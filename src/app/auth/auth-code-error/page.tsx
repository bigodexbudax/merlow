export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
            <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900 text-center">
                <h1 className="text-2xl font-bold text-red-600">Auth Error</h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    There was an error authenticating your user. Please try again.
                </p>
                <a
                    href="/login"
                    className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    Back to Login
                </a>
            </main>
        </div>
    )
}
