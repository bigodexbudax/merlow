'use client'

import * as React from 'react'
import {
    LayoutDashboard,
    Receipt,
    Settings,
    ChevronRight,
} from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { UserNav } from '@/components/user-nav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface User {
    id: string
    email?: string
    user_metadata?: {
        avatar_url?: string
        full_name?: string
    }
}

export function AppSidebar({ user, ...props }: { user: User } & React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    const items = [
        {
            title: 'Dashboard',
            url: '#',
            icon: LayoutDashboard,
            isActive: false,
            comingSoon: true,
        },
        {
            title: 'Lançamentos',
            url: '/',
            icon: Receipt,
            isActive: pathname === '/',
        },
        {
            title: 'Configurações',
            url: '/registries',
            icon: Settings,
            isActive: pathname === '/registries',
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="h-16 flex items-center justify-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl px-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                        M
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">Merlow</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.isActive}
                                    tooltip={item.title}
                                    className={item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    {item.comingSoon ? (
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                            <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1">breve</Badge>
                                        </div>
                                    ) : (
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <div className="group-data-[collapsible=icon]:hidden">
                    {/* User info or logout could go here, or keep UserNav in header */}
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
