import { supabase } from '@/lib/supabase'

const SESSION_KEY = 'hooddo_session_id'

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export type EventName =
  | 'app_open'
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_completed'
  | 'feed_viewed'
  | 'feed_filter_changed'
  | 'feed_empty_shown'
  | 'corner_screen_viewed'
  | 'corner_selected'
  | 'corner_changed'
  | 'publish_type_selected'
  | 'publish_started'
  | 'publish_completed'
  | 'publication_opened'
  | 'contact_blocked_shown'
  | 'auth_modal_opened'
  | 'auth_completed'
  | 'contact_clicked'
  | 'publication_closed'
  | 'my_tasks_viewed'
  | 'republish_clicked'
  | 'share_clicked'

export type EventOptions = {
  publication_id?: number | string
  publication_type?: 'request' | 'offer' | string
  category?: string
  source?: 'feed' | 'direct' | 'my_tasks' | 'task_detail' | 'publish' | string
  step?: number | string
  filter_type?: 'tab' | 'category' | 'radius' | string
  value?: string | number
}

export async function logEvent(eventName: EventName, options: EventOptions = {}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').insert({
      event_name: eventName,
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      publication_id: options.publication_id ?? null,
      publication_type: options.publication_type ?? null,
      category: options.category ?? null,
      source: options.source ?? null,
    })
  } catch {
    // analytics must never break the app
  }
}
