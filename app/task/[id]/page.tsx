import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import TaskDetail from './TaskDetail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { data: task } = await supabase
    .from('tasks')
    .select('title, description, type, reward_ils, display_name')
    .eq('id', params.id)
    .single()

  if (!task) {
    return { title: 'HoodDo' }
  }

  const isOffer = task.type === 'offer'
  const reward = task.reward_ils > 0 ? ` · ${task.reward_ils} ₪` : ''
  const description = task.description
    || (isOffer ? 'הצעת עזרה מהשכונה' : `משימה קטנה מהשכונה${reward}`)

  return {
    title: `${task.title} | HoodDo`,
    description,
    openGraph: {
      title: task.title,
      description,
      siteName: 'HoodDo',
      locale: 'he_IL',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: task.title,
      description,
    },
  }
}

export default function TaskPage() {
  return (
    <Suspense>
      <TaskDetail />
    </Suspense>
  )
}
