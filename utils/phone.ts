/**
 * Normalize an Israeli phone number to international format: 972XXXXXXXXX
 */
export function normalizeIsraeliPhone(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '')

  // Remove leading zeros
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  // Remove country code if already present
  if (digits.startsWith('972')) {
    digits = digits.slice(3)
  }

  // Should now be 9 digits (e.g. 521234567)
  return `972${digits}`
}

/**
 * Validate that the result looks like a valid Israeli number (972 + 9 digits)
 */
export function isValidIsraeliPhone(raw: string): boolean {
  const normalized = normalizeIsraeliPhone(raw)
  return /^972\d{9}$/.test(normalized)
}

const WHATSAPP_MESSAGE =
  'היי, ראיתי את המשימה שלך ב-HoodDo ואשמח לעזור 🙂 האם זה עדיין רלוונטי?'

/**
 * Build a WhatsApp deep link for the task creator.
 */
export function buildWhatsAppLink(phone: string): string {
  const normalized = normalizeIsraeliPhone(phone)
  const encoded = encodeURIComponent(WHATSAPP_MESSAGE)
  return `https://wa.me/${normalized}?text=${encoded}`
}
