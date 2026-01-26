'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCategory, deleteCategory, createEntity, deleteEntity } from './actions'
import React from 'react'

type Category = { id: string; name: string }
type Entity = { id: string; name: string }

export default function RegistriesClient({
    categories,
    entities,
}: {
    categories: Category[]
    entities: Entity[]
}) {
    const [activeTab, setActiveTab] = useState('categories')

    return (
        <div className="container mx-auto py-10 w-full max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Cadastros</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="entities">Empresas</TabsTrigger>
                </TabsList>

                <TabsContent value="categories">
                    <RegistriesTab
                        title="Categorias"
                        description="Gerencie as categorias de gastos."
                        data={categories}
                        columns={['Nome']}
                        onDelete={deleteCategory}
                        createForm={<CreateCategoryForm onClose={() => { }} />}
                    />
                </TabsContent>

                <TabsContent value="entities">
                    <RegistriesTab
                        title="Empresas"
                        description="Gerencie empresas, lojas, ou prestadores de serviço."
                        data={entities}
                        columns={['Nome']}
                        onDelete={deleteEntity}
                        createForm={<CreateEntityForm onClose={() => { }} />}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function RegistriesTab({
    title,
    description,
    data,
    columns,
    onDelete,
    createForm,
}: {
    title: string
    description: string
    data: any[]
    columns: string[]
    onDelete: (id: string) => Promise<any>
    createForm: React.ReactNode
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            await onDelete(id)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                                <Plus className="h-4 w-4" /> Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo {title}</DialogTitle>
                            </DialogHeader>
                            {/* Clone element to pass onClose */}
                            {/* @ts-ignore */}
                            {React.cloneElement(createForm as React.ReactElement, { onClose: () => setIsDialogOpen(false) })}
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col}>{col}</TableHead>
                            ))}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-center py-4 text-muted-foreground">
                                    Nenhum item encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


function CreateCategoryForm({ onClose }: { onClose: () => void }) {
    return (
        <form action={async (formData) => {
            await createCategory(formData)
            onClose()
        }} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required placeholder="ex: Alimentação" />
            </div>
            <Button type="submit" className="w-full">Criar</Button>
        </form>
    )
}

function CreateEntityForm({ onClose }: { onClose: () => void }) {
    return (
        <form action={async (formData) => {
            await createEntity(formData)
            onClose()
        }} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required placeholder="ex: Amazon" />
            </div>
            <Button type="submit" className="w-full">Criar</Button>
        </form>
    )
}
