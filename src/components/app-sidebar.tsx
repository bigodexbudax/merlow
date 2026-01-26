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
    useSidebar,
} from '@/components/ui/sidebar'
import { UserNav } from '@/components/user-nav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
    const { state } = useSidebar()

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
            <SidebarHeader className="h-20 flex items-center justify-center p-0">
                <Link href="/" className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    state === 'expanded' ? "px-4 w-full" : "px-0 w-8"
                )}>
                    {state === 'expanded' ? (
                        <img
                            src="/menu.png"
                            alt="Merlow Logo"
                            className="h-10 w-auto object-contain transition-opacity duration-300"
                        />
                    ) : (
                        <img
                            src="/menu_logo.png"
                            alt="Merlow Icon"
                            className="h-12 w-12 object-contain transition-opacity duration-300"
                        />
                    )}
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
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
