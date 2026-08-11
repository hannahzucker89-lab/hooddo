export type EmptyStateExample = {
  type: 'task' | 'offer'
  category: string
  emoji: string
  title: string
  rewardLabel: string
  subtitle: string
}

export const EMPTY_STATE_EXAMPLES: EmptyStateExample[] = [
  { type: 'task', category: 'חיות', emoji: '🐶', title: 'טיול עם הכלב', rewardLabel: '20 ₪', subtitle: 'כ-20 דקות · גמיש' },
  { type: 'offer', category: 'למידה', emoji: '📚', title: 'שיעורים פרטיים במתמטיקה', rewardLabel: '80 ₪', subtitle: 'גמיש' },
  { type: 'task', category: 'חיות', emoji: '🐾', title: 'שמירה על הכלב לכמה ימים', rewardLabel: '150 ₪', subtitle: 'גמיש' },
  { type: 'offer', category: 'טכנולוגיה', emoji: '💻', title: 'אשמח לעזור בבעיות מחשב קטנות', rewardLabel: 'ללא תמורה', subtitle: 'גמיש' },
  { type: 'task', category: 'בית וצמחים', emoji: '🌿', title: 'השקיית עציצים בזמן שאני בחופשה', rewardLabel: 'ללא תמורה', subtitle: 'גמיש' },
  { type: 'task', category: 'אחר', emoji: '🛏️', title: 'מחפש סאבלט לכמה ימים', rewardLabel: 'בתיאום', subtitle: 'גמיש' },
]
