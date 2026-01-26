import { Skeleton } from "@/components/ui/skeleton"

export function MonthNavSkeleton() {
    return (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-40 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
    )
}

export function DashboardSummarySkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
        </div>
    )
}

export function TimelineItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-50 dark:border-zinc-800 rounded-lg">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 gap-1">
                    <Skeleton className="h-5 w-6" />
                    <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32 md:w-48" />
                    <div className="flex gap-2 items-center">
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-4 w-10 rounded" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-12" />
            </div>
        </div>
    )
}

export function TimelineListSkeleton() {
    return (
        <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <TimelineItemSkeleton key={i} />
            ))}
        </div>
    )
}
