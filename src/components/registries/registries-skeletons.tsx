import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function RegistriesSkeleton() {
    return (
        <div className="container mx-auto py-10 w-full max-w-4xl">
            <Skeleton className="h-10 w-48 mb-8" />

            <div className="w-full space-y-6">
                <div className="grid w-full grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <Skeleton className="h-9 rounded-md" />
                    <Skeleton className="h-9 rounded-md" />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-4 ml-auto" />
                                </div>
                            </div>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
