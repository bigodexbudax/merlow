'use client'

import { login, signup } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSearchParams } from 'next/navigation'
import { AlertCircleIcon, InfoIcon, LockIcon, MailIcon } from 'lucide-react'
import { Suspense } from 'react'

function LoginContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
            <div className="w-full max-w-[400px] space-y-6">
                {error && (
                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                        <AlertCircleIcon className="h-4 w-4" />
                        <AlertTitle>Erro na autenticação</AlertTitle>
                        <AlertDescription className="text-xs">
                            {error === 'credential_error'
                                ? 'Email ou senha incorretos. Por favor, tente novamente.'
                                : 'Houve um problema ao criar sua conta. Verifique seus dados.'}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col items-center gap-0 mb-0 text-center">
                    <img
                        src="/logo.png"
                        alt="Merlow Logo"
                        className="h-[400px] w-auto object-contain transition-transform hover:scale-105 duration-500"
                    />
                    <p className="text-sm text-muted-foreground -mt-32">Sua gestão financeira simplificada.</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card className="border-none shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle>Bem-vindo de volta</CardTitle>
                                <CardDescription>Acesse sua conta para gerenciar seus lançamentos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form action={login} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email-login">Email</Label>
                                            <div className="relative">
                                                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input id="email-login" name="email" type="email" placeholder="nome@exemplo.com" className="pl-10" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password-login">Senha</Label>
                                                <Button variant="link" type="button" className="px-0 font-normal h-auto text-xs text-muted-foreground">
                                                    Esqueceu sua senha?
                                                </Button>
                                            </div>
                                            <div className="relative">
                                                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input id="password-login" name="password" type="password" className="pl-10" required />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="remember" name="remember-me" />
                                            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Lembrar de mim
                                            </label>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Entrar
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">
                                        Ao entrar, você concorda com nossos <Button variant="link" type="button" className="h-auto p-0 text-xs text-muted-foreground underline">Termos de Uso</Button>.
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Card className="border-none shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle>Comece agora</CardTitle>
                                <CardDescription>Crie sua conta gratuita em poucos segundos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 py-3">
                                    <InfoIcon className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        Não existe saldo ou entradas aqui. Focamos nos seus gastos e compromissos.
                                    </AlertDescription>
                                </Alert>
                                <form action={signup} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email-signup">Email</Label>
                                            <Input id="email-signup" name="email" type="email" placeholder="seu@email.com" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password-signup">Escolha uma senha</Label>
                                            <Input id="password-signup" name="password" type="password" required />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="outline" className="w-full">
                                        Criar minha conta
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="text-center pt-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-transparent hover:text-foreground h-auto p-0 flex items-center gap-1 mx-auto">
                        <InfoIcon className="h-3 w-3" />
                        Precisa de ajuda? Entre em contato.
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
            <LoginContent />
        </Suspense>
    )
}
