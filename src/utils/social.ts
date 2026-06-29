import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase'
import type { Collection, CollectionItem, MediaItem, Review, FriendRequestData, UserProfile } from '../types'

export function getReviewKey(item: MediaItem): string {
  return `${item.mediaType}:${item.id}`
}

export async function saveReview(uid: string, item: MediaItem, rating: number, comment: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const key = getReviewKey(item)
  const ref = doc(db, 'users', uid, 'reviews', key)
  await setDoc(ref, {
    mediaType: item.mediaType,
    mediaId: item.id,
    title: item.title,
    year: item.year,
    overview: item.overview,
    posterPath: item.posterPath,
    releaseDate: item.releaseDate ?? null,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  })
}

export async function deleteReview(uid: string, item: MediaItem): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const key = getReviewKey(item)
  await deleteDoc(doc(db, 'users', uid, 'reviews', key))
}

export async function loadUserReviews(uid: string): Promise<Review[]> {
  if (!db) return []
  const ref = collection(db, 'users', uid, 'reviews')
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data() as Review)
}

export function subscribeReviews(uid: string, onData: (reviews: Review[]) => void): Unsubscribe | null {
  if (!db) return null
  const ref = collection(db, 'users', uid, 'reviews')
  const q = query(ref, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map((d) => d.data() as Review))
  })
}

export async function searchUsers(queryStr: string): Promise<UserProfile[]> {
  if (!db || !queryStr.trim()) return []
  const lower = queryStr.toLowerCase()
  const ref = collection(db, 'usernames')
  const q = query(ref, where('name', '>=', lower), where('name', '<', lower + 'z'), limit(20))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile))
}

export async function sendFriendRequest(fromUid: string, fromName: string, toUid: string, toName: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const now = new Date().toISOString()
  await setDoc(doc(db, 'users', toUid, 'friendRequests', fromUid), {
    fromUid,
    fromName,
    sentAt: now,
  })
  await setDoc(doc(db, 'users', fromUid, 'sentRequests', toUid), {
    toUid,
    toName,
    sentAt: now,
  })
}

export async function acceptFriendRequest(uid: string, fromUid: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const now = new Date().toISOString()
  await setDoc(doc(db, 'users', uid, 'friends', fromUid), { addedAt: now })
  await setDoc(doc(db, 'users', fromUid, 'friends', uid), { addedAt: now })
  await deleteDoc(doc(db, 'users', uid, 'friendRequests', fromUid))
}

export async function declineFriendRequest(uid: string, fromUid: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'users', uid, 'friendRequests', fromUid))
}

export async function removeFriend(uid: string, friendUid: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'users', uid, 'friends', friendUid))
  await deleteDoc(doc(db, 'users', friendUid, 'friends', uid))
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() } as UserProfile
}

export async function hasSentRequest(fromUid: string, toUid: string): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(doc(db, 'users', fromUid, 'sentRequests', toUid))
  return snap.exists()
}

export async function removeSentRequest(uid: string, toUid: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'users', uid, 'sentRequests', toUid))
}

export function subscribeSentRequests(uid: string, onData: (sent: string[]) => void): Unsubscribe | null {
  if (!db) return null
  const ref = collection(db, 'users', uid, 'sentRequests')
  return onSnapshot(ref, (snapshot) => {
    onData(snapshot.docs.map((d) => d.id))
  })
}

export async function hasPendingRequest(toUid: string, fromUid: string): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(doc(db, 'users', toUid, 'friendRequests', fromUid))
  return snap.exists()
}

export function subscribeFriendRequests(uid: string, onData: (requests: FriendRequestData[]) => void): Unsubscribe | null {
  if (!db) return null
  const ref = collection(db, 'users', uid, 'friendRequests')
  return onSnapshot(ref, (snapshot) => {
    onData(snapshot.docs.map((d) => d.data() as FriendRequestData))
  })
}

export function subscribeFriends(uid: string, onData: (friendUids: string[]) => void): Unsubscribe | null {
  if (!db) return null
  const ref = collection(db, 'users', uid, 'friends')
  return onSnapshot(ref, (snapshot) => {
    onData(snapshot.docs.map((d) => d.id))
  })
}

/* ─── Friend Reviews ─── */

export async function loadFriendReviewsForMedia(
  friendUids: string[],
  itemKey: string,
): Promise<(Review & { authorUid: string; authorName: string })[]> {
  if (!db || friendUids.length === 0) return []
  const results: (Review & { authorUid: string; authorName: string })[] = []
  for (const uid of friendUids) {
    const ref = doc(db, 'users', uid, 'reviews', itemKey)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const profile = await loadUserProfile(uid)
      results.push({
        ...(snap.data() as Review),
        authorUid: uid,
        authorName: profile?.name ?? 'Unknown',
      })
    }
  }
  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/* ─── Collections ─── */

export function generateCollectionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function createCollection(uid: string, name: string, description: string): Promise<string> {
  if (!db) throw new Error('Firebase not configured')
  const id = generateCollectionId()
  const now = new Date().toISOString()
  await setDoc(doc(db, 'users', uid, 'collections', id), {
    id,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    itemCount: 0,
  })
  return id
}

export async function deleteCollection(uid: string, collectionId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const itemsSnap = await getDocs(collection(db, 'users', uid, 'collections', collectionId, 'items'))
  const batch = itemsSnap.docs.map((d) => deleteDoc(d.ref))
  await Promise.all(batch)
  await deleteDoc(doc(db, 'users', uid, 'collections', collectionId))
}

export function subscribeCollections(uid: string, onData: (collections: Collection[]) => void): Unsubscribe | null {
  if (!db) return null
  const ref = collection(db, 'users', uid, 'collections')
  const q = query(ref, orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map((d) => d.data() as Collection))
  })
}

export async function addToCollection(
  uid: string,
  collectionId: string,
  item: MediaItem,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const key = `${item.mediaType}:${item.id}`
  const now = new Date().toISOString()
  await setDoc(doc(db, 'users', uid, 'collections', collectionId, 'items', key), {
    mediaType: item.mediaType,
    mediaId: item.id,
    title: item.title,
    year: item.year,
    posterPath: item.posterPath,
    addedAt: now,
  })
  const colRef = doc(db, 'users', uid, 'collections', collectionId)
  const colSnap = await getDoc(colRef)
  if (colSnap.exists()) {
    const current = (colSnap.data() as Collection).itemCount ?? 0
    await setDoc(colRef, { itemCount: current + 1, updatedAt: now }, { merge: true })
  }
}

export async function removeFromCollection(uid: string, collectionId: string, itemKey: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'users', uid, 'collections', collectionId, 'items', itemKey))
  const colRef = doc(db, 'users', uid, 'collections', collectionId)
  const colSnap = await getDoc(colRef)
  if (colSnap.exists()) {
    const current = (colSnap.data() as Collection).itemCount ?? 0
    await setDoc(colRef, { itemCount: Math.max(0, current - 1), updatedAt: new Date().toISOString() }, { merge: true })
  }
}

export function subscribeCollectionItems(
  uid: string,
  collectionId: string,
  onData: (items: CollectionItem[]) => void,
): Unsubscribe | null {
  if (!db) return null
  const ref = collection(db, 'users', uid, 'collections', collectionId, 'items')
  const q = query(ref, orderBy('addedAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map((d) => d.data() as CollectionItem))
  })
}

export async function isInCollection(uid: string, collectionId: string, itemKey: string): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(doc(db, 'users', uid, 'collections', collectionId, 'items', itemKey))
  return snap.exists()
}
