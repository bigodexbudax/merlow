'use client'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'
import {
    Button,
} from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface UserNavProps {
    user: {
        email?: string
        user_metadata?: any
    }
    accounts: { id: string; name: string; type: string }[]
    signOut: () => Promise<void>
}

export function UserNav({ user, accounts, signOut }: UserNavProps) {
    // Logic to determine "active" account could go here (e.g. from cookies or context)
    // For now, we list them.

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt={user.email || ''} />
                        <AvatarFallback>{user.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Minha Conta</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Perfis (Contas)</DropdownMenuLabel>
                    {accounts.length === 0 && (
                        <DropdownMenuItem disabled>Nenhum perfil encontrado</DropdownMenuItem>
                    )}
                    {accounts.map(account => (
                        <DropdownMenuItem key={account.id}>
                            <User className="mr-2 h-4 w-4" />
                            <span>{account.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground capitalize">{account.type}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/registries">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Gerenciar Cadastros</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
