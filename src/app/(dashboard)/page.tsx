import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { DashboardSummary } from '@/components/dashboard/dashboard-summary'
import { TimelineList } from '@/components/dashboard/timeline-list'
import { MonthNav } from '@/components/dashboard/month-nav'
import { FutureCommitments } from '@/components/dashboard/future-commitments'
import { CreateEventDialog } from '@/components/events/create-event-dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardPageProps {
  searchParams: Promise<{ month?: string, year?: string }>
}

export default async function Home(props: DashboardPageProps) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 1. Determine Date Range
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthNum = now.getMonth() + 1

  const year = searchParams.year ? parseInt(searchParams.year) : currentYear
  const month = searchParams.month ? parseInt(searchParams.month) : currentMonthNum

  // Construct start/end dates for the month (Local safe)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // For MonthNav and other UI components, we'll pass raw year/month to avoid RSC serialization shifts
  const currentDate = new Date(year, month - 1, 1)

  // 2. Data Fetching
  const [
    categoriesResult,
    entitiesResult,
    eventsResult
  ] = await Promise.all([
    supabase.from('categories').select('id, name').order('name'),
    supabase.from('entities').select('id, name').order('name'),
    supabase.from('financial_events')
      .select('*, categories(name)')
      .eq('user_id', user.id)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
  ])

  const categories = categoriesResult.data || []
  const entities = entitiesResult.data || []
  const events = eventsResult.data || []

  // 3. Calculate Summaries
  const confirmedTotal = events
    .filter(e => e.status === 'confirmado')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const projectedTotal = events
    .filter(e => e.status === 'pendente')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // 4. Fetch Future Commitments
  // Simple view: next 3 months
  const futureMonthsData = []
  for (let i = 1; i <= 3; i++) {
    const futureDate = addMonths(currentDate, i)
    const fStart = startOfMonth(futureDate).toISOString().split('T')[0]
    const fEnd = endOfMonth(futureDate).toISOString().split('T')[0]

    // We fetch aggregate sum for pending events in that month
    const { data: futureEvents } = await supabase
      .from('financial_events')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'pendente')
      .gte('event_date', fStart)
      .lte('event_date', fEnd)

    const sum = futureEvents?.reduce((acc, curr) => acc + curr.amount, 0) || 0
    if (sum > 0) {
      futureMonthsData.push({
        month: format(futureDate, 'MMMM', { locale: ptBR }),
        amount: sum
      })
    }
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1 container mx-auto max-w-lg p-4 pb-24 space-y-6">
        {/* BLOCK 1: HEADER & SUMMARY */}
        <section className="space-y-4">
          <MonthNav month={month} year={year} />
          <DashboardSummary
            confirmedTotal={confirmedTotal}
            projectedTotal={projectedTotal}
          />
        </section>

        <Separator />

        {/* BLOCK 2: TIMELINE */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lançamentos</h2>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Nenhum lançamento neste mês.
            </div>
          ) : (
            <TimelineList
              events={events}
              categories={categories}
              entities={entities}
            />
          )}
        </section>

        <Separator />

        {/* BLOCK 4: FUTURE */}
        {futureMonthsData.length > 0 && (
          <section>
            <FutureCommitments data={futureMonthsData} />
          </section>
        )}

      </main>

      {/* CTA FIXED BOTTOM */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <CreateEventDialog
          categories={categories}
          entities={entities}
          trigger={
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          }
        />
      </div>
    </div>
  )
}
