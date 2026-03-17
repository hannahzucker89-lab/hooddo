const KEY_NAME = 'hooddo_name'
const KEY_PHONE = 'hooddo_phone'

export function getSavedName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEY_NAME) ?? ''
}

export function saveName(name: string): void {
  localStorage.setItem(KEY_NAME, name)
}

export function getSavedPhone(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEY_PHONE) ?? ''
}

export function savePhone(phone: string): void {
  localStorage.setItem(KEY_PHONE, phone)
}

export function clearPhone(): void {
  localStorage.removeItem(KEY_PHONE)
}
