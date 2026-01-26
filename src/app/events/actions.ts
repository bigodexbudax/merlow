'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const eventSchema = z.object({
    amount: z.coerce.number().positive(),
    event_date: z.string().date(), // YYYY-MM-DD
    description: z.string().optional(),
    account_id: z.string().uuid().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    entity_id: z.string().uuid().optional().nullable(),
    payment_method: z.enum(['credito', 'debito', 'pix', 'dinheiro', 'boleto', 'outro']),
    source_type: z.enum(['manual', 'document']).default('manual'),
    // Subflows
    is_recurring: z.boolean().optional(),
    recurrence_interval_value: z.coerce.number().int().positive().optional(),
    recurrence_interval_unit: z.enum(['dia', 'semana', 'mes', 'ano']).optional(),
    recurrence_ends_at: z.string().date().optional().nullable(),

    is_installment: z.boolean().optional(),
    installment_total_amount: z.coerce.number().positive().optional(),
    installment_count: z.coerce.number().int().positive().optional(),
    installment_amount: z.coerce.number().positive().optional(),
})

export async function createFinancialEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Helper to treat empty/null as undefined for Zod optional coercion
    const getOptional = (key: string) => {
        const val = formData.get(key)
        return (val === null || val === '') ? undefined : val
    }

    const rawData = {
        amount: formData.get('amount'),
        event_date: formData.get('event_date'),
        description: formData.get('description'),
        account_id: formData.get('account_id') || null,
        category_id: formData.get('category_id') || null,
        entity_id: formData.get('entity_id') || null,
        payment_method: formData.get('payment_method'),
        source_type: 'manual',
        is_recurring: formData.get('is_recurring') === 'on',
        recurrence_interval_value: getOptional('recurrence_interval_value'),
        recurrence_interval_unit: getOptional('recurrence_interval_unit'),
        recurrence_ends_at: formData.get('recurrence_ends_at') || null, // date optional nullable handles null fine usually, but lets stick to pattern if needed. Actually string().date().optional().nullable() handles null? Zod string() expects string. null fails?
        // Wait, schema for recurrence_ends_at is z.string().date().optional().nullable()
        // z.string() fails on null.
        // So recurrence_ends_at also needs undefined or string.
        // If it is null, we can pass null if nullable() allows it.
        // But formData.get returns Object(null) or string.
        // Let's use getOptional for it too, or pass null explicitly if we want null. Schema allows Nullable.

        is_installment: formData.get('is_installment') === 'on',
        installment_total_amount: getOptional('installment_total_amount'),
        installment_count: getOptional('installment_count'),
        installment_amount: getOptional('installment_amount'),
    }

    // Fix recurrence_ends_at separately to match schema type (string | null | undefined)
    // If empty string, make it null?
    const endsAt = formData.get('recurrence_ends_at')
    rawData.recurrence_ends_at = endsAt ? String(endsAt) : null

    // Validate
    const parseResult = eventSchema.safeParse(rawData)
    if (!parseResult.success) {
        return { error: 'Validation failed', details: parseResult.error.flatten() }
    }
    const data = parseResult.data

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Create the main event
    // If it's an installment, the User requested that 'amount' in financial_events stores the INSTALLMENT amount, not total.
    const eventAmount = (data.is_installment && data.installment_amount)
        ? data.installment_amount
        : data.amount

    // If it's an installment, add (1/X) to the description
    const eventDescription = (data.is_installment && data.installment_count)
        ? `${data.description} (1/${data.installment_count})`
        : data.description

    const { data: event, error: eventError } = await supabase
        .from('financial_events')
        .insert({
            user_id: user.id,
            amount: eventAmount,
            event_date: data.event_date,
            description: eventDescription,
            account_id: data.account_id,
            category_id: data.category_id,
            entity_id: data.entity_id,
            payment_method: data.payment_method,
            source_type: data.source_type,
            status: 'confirmado',
            installment: data.is_installment ? 1 : null,
        })
        .select('id')
        .single()

    if (eventError || !event) {
        return { error: eventError?.message || 'Failed to create event' }
    }

    // 2. Handle Recurrence
    if (data.is_recurring && data.recurrence_interval_value && data.recurrence_interval_unit) {
        const { data: recurrence, error: recError } = await supabase
            .from('event_recurrences')
            .insert({
                user_id: user.id,
                start_event_id: event.id,
                interval_value: data.recurrence_interval_value,
                interval_unit: data.recurrence_interval_unit,
                expected_amount: data.amount,
                starts_at: data.event_date,
                ends_at: data.recurrence_ends_at,
                active: true,
            })
            .select('id')
            .single()

        if (!recError && recurrence) {
            // Update the first event with recurrence_id
            await supabase
                .from('financial_events')
                .update({ recurrence_id: recurrence.id })
                .eq('id', event.id)

            // Calculate future dates and insert them
            if (data.recurrence_ends_at) {
                const pendingEvents = []
                let currentDate = new Date(data.event_date + 'T00:00:00') // Local time start

                // Parse End Date
                const endDate = new Date(data.recurrence_ends_at + 'T00:00:00')

                // Loop limit to prevent infinite loops (safety mechanism)
                let safetyCounter = 0
                const MAX_RECURRENCES = 360 // e.g. 30 years monthly

                while (safetyCounter < MAX_RECURRENCES) {
                    safetyCounter++

                    // Increment Date based on Unit
                    // We handle basic Js date incrementation
                    if (data.recurrence_interval_unit === 'dia') {
                        currentDate.setDate(currentDate.getDate() + data.recurrence_interval_value)
                    } else if (data.recurrence_interval_unit === 'semana') {
                        currentDate.setDate(currentDate.getDate() + (data.recurrence_interval_value * 7))
                    } else if (data.recurrence_interval_unit === 'mes') {
                        currentDate.setMonth(currentDate.getMonth() + data.recurrence_interval_value)
                    } else if (data.recurrence_interval_unit === 'ano') {
                        currentDate.setFullYear(currentDate.getFullYear() + data.recurrence_interval_value)
                    }

                    // Check if passed end date
                    if (currentDate > endDate) break;

                    // Format Date YYYY-MM-DD
                    const y = currentDate.getFullYear()
                    const m = String(currentDate.getMonth() + 1).padStart(2, '0')
                    const d = String(currentDate.getDate()).padStart(2, '0')
                    const dateStr = `${y}-${m}-${d}`

                    pendingEvents.push({
                        user_id: user.id,
                        amount: data.amount,
                        event_date: dateStr,
                        description: data.description ? `${data.description} (Assinatura)` : '(Assinatura)',
                        account_id: data.account_id,
                        category_id: data.category_id,
                        entity_id: data.entity_id,
                        payment_method: data.payment_method,
                        source_type: data.source_type,
                        status: 'pendente',
                        recurrence_id: recurrence.id
                    })
                }

                if (pendingEvents.length > 0) {
                    await supabase.from('financial_events').insert(pendingEvents)
                }
            }
        }
    }

    // 3. Handle Installments
    if (data.is_installment && data.installment_count && data.installment_amount) {
        // data.amount is the Total Value from the form (before we swapped it for the main event insert)
        // or we use installment_total_amount if provided (though UI doesn't seem to send it explicitly as separate field, it sends 'amount' as total).
        // Let's rely on data.amount as Total.
        const totalAmount = data.amount

        const { data: installment, error: instError } = await supabase
            .from('event_installments')
            .insert({
                user_id: user.id,
                start_event_id: event.id,
                total_amount: totalAmount,
                total_installments: data.installment_count,
                installment_amount: data.installment_amount,
                starts_at: data.event_date,
            })
            .select('id')
            .single()

        if (!instError && installment) {
            // Update the first event with installment_id
            await supabase
                .from('financial_events')
                .update({ installment_id: installment.id })
                .eq('id', event.id)

            // Create remaining installments (2 to N)
            const remainingInstallments = []
            // Need to import addMonths. I'll add it to the top level import later in this step if possible, 
            // but replace_file_content can't do scattered edits easily.
            // I will assume addMonths is imported or I can use native Date.
            // Native Date is safer for disjoint edits.

            for (let i = 1; i < data.installment_count; i++) {
                // Calculate date: Start Date + i months
                const baseDate = new Date(data.event_date + 'T00:00:00') // Append time to avoid timezone mess if possible, or just use Split
                // Better:
                const [y, m, d] = data.event_date.split('-').map(Number)
                const nextDateObj = new Date(y, m - 1 + i, d) // JS Month is 0-indexed
                const nextDateStr = nextDateObj.toISOString().split('T')[0]

                remainingInstallments.push({
                    user_id: user.id,
                    amount: data.installment_amount, // All have the installment amount
                    event_date: nextDateStr,
                    description: `${data.description} (${i + 1}/${data.installment_count})`,
                    account_id: data.account_id,
                    category_id: data.category_id,
                    entity_id: data.entity_id,
                    payment_method: data.payment_method,
                    source_type: data.source_type,
                    status: 'pendente', // Future installments are pending
                    installment_id: installment.id,
                    installment: i + 1,
                })
            }

            if (remainingInstallments.length > 0) {
                await supabase
                    .from('financial_events')
                    .insert(remainingInstallments)
            }
        }
    }

    revalidatePath('/')
    return { success: true, eventId: event.id }
}

export async function updateFinancialEvent(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        description: formData.get('description'),
        category_id: formData.get('category_id') || null,
        account_id: formData.get('account_id') || null,
        entity_id: formData.get('entity_id') || null,
        payment_method: formData.get('payment_method'),
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // MVP: Only allowed to update basic fields as per requirements
    // "Pode editar: Descrição, Categoria, Account, Entity, Payment Method"

    const { error } = await supabase
        .from('financial_events')
        .update({
            description: rawData.description,
            category_id: rawData.category_id,
            account_id: rawData.account_id,
            entity_id: rawData.entity_id,
            payment_method: rawData.payment_method,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}
