import Link from 'next/link'
import { UserNav } from '@/components/user-nav'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface AppHeaderProps {
    user: any
    accounts: any[]
    signOut: () => Promise<void>
}

export function AppHeader({ user, accounts, signOut }: AppHeaderProps) {
    return (
        <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
                <UserNav user={user} accounts={accounts} signOut={signOut} />
            </div>
        </header>
    )
}
