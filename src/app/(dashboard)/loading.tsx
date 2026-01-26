import { MonthNavSkeleton, DashboardSummarySkeleton, TimelineListSkeleton } from "@/components/dashboard/dashboard-skeletons"
import { Separator } from "@/components/ui/separator"

export default function DashboardLoading() {
    return (
        <main className="flex-1 container mx-auto max-w-lg p-4 pb-24 space-y-6">
            {/* BLOCK 1: HEADER & SUMMARY */}
            <section className="space-y-4">
                <MonthNavSkeleton />
                <DashboardSummarySkeleton />
            </section>

            <Separator />

            {/* BLOCK 2: TIMELINE */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
                </div>
                <TimelineListSkeleton />
            </section>

            <Separator />
        </main>
    )
}
