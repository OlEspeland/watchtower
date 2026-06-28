export const ACCENT_COLORS = [
  { key: 'purple', name: 'Purple', light: '#7c3aed', lightBg: 'rgba(124,58,237,0.12)', dark: '#a78bfa', darkBg: 'rgba(167,139,250,0.16)' },
  { key: 'blue', name: 'Blue', light: '#2563eb', lightBg: 'rgba(37,99,235,0.12)', dark: '#60a5fa', darkBg: 'rgba(96,165,250,0.16)' },
  { key: 'emerald', name: 'Emerald', light: '#059669', lightBg: 'rgba(5,150,105,0.12)', dark: '#34d399', darkBg: 'rgba(52,211,153,0.16)' },
  { key: 'pink', name: 'Pink', light: '#ec4899', lightBg: 'rgba(236,72,153,0.12)', dark: '#f472b6', darkBg: 'rgba(244,114,182,0.16)' },
  { key: 'rose', name: 'Rose', light: '#e11d48', lightBg: 'rgba(225,29,72,0.12)', dark: '#fb7185', darkBg: 'rgba(251,113,133,0.16)' },
  { key: 'orange', name: 'Orange', light: '#ea580c', lightBg: 'rgba(234,88,12,0.12)', dark: '#fb923c', darkBg: 'rgba(251,146,60,0.16)' },
  { key: 'teal', name: 'Teal', light: '#0d9488', lightBg: 'rgba(13,148,136,0.12)', dark: '#2dd4bf', darkBg: 'rgba(45,212,191,0.16)' },
  { key: 'indigo', name: 'Indigo', light: '#4f46e5', lightBg: 'rgba(79,70,229,0.12)', dark: '#818cf8', darkBg: 'rgba(129,140,248,0.16)' },
  { key: 'amber', name: 'Amber', light: '#d97706', lightBg: 'rgba(217,119,6,0.12)', dark: '#fbbf24', darkBg: 'rgba(251,191,36,0.16)' },
] as const

export type AccentKey = typeof ACCENT_COLORS[number]['key']
