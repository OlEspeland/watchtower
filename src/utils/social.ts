import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase'
import type { MediaItem, Review, FriendRequestData, UserProfile } from '../types'

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

export async function sendFriendRequest(fromUid: string, fromName: string, toUid: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await setDoc(doc(db, 'users', toUid, 'friendRequests', fromUid), {
    fromUid,
    fromName,
    sentAt: new Date().toISOString(),
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
