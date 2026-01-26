import { createClient } from '@/utils/supabase/server'
import RegistriesClient from './registries-client'
import { AppHeader } from '@/components/app-header'
import { redirect } from 'next/navigation'

export default async function RegistriesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please login</div>
    }

    const [categories, entities] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('entities').select('*').order('name'),
    ])

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
            <AppHeader user={user} signOut={signOut} />
            <main className="flex-1">
                <RegistriesClient
                    categories={categories.data || []}
                    entities={entities.data || []}
                />
            </main>
        </div>
    )
}
