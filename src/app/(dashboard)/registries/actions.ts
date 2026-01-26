'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Accounts ---

export async function createAccount(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const type = formData.get('type') as string

    if (!name || !type) return { error: 'Campos obrigatórios faltando' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { error } = await supabase
        .from('accounts')
        .insert({
            user_id: user.id,
            name,
            type,
        })

    if (error) return { error: error.message }
    revalidatePath('/registries')
    return { success: true }
}

export async function deleteAccount(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('accounts').delete().eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/registries')
    return { success: true }
}

// --- Categories ---

export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string

    if (!name) return { error: 'Missing required fields' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
        })

    if (error) return { error: error.message }
    revalidatePath('/registries')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/registries')
    return { success: true }
}

// --- Entities ---

export async function createEntity(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const type = formData.get('type') as string

    if (!name) return { error: 'Missing required fields' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Simple normalization: lowercase and trim
    const normalized_name = name.trim().toLowerCase()

    const { error } = await supabase
        .from('entities')
        .insert({
            user_id: user.id,
            name,
            normalized_name,
            type: type || null,
        })

    if (error) return { error: error.message }
    revalidatePath('/registries')
    return { success: true }
}

export async function deleteEntity(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('entities').delete().eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/registries')
    return { success: true }
}
