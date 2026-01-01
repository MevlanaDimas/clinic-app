export const PageLoading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-25 w-25 border-t-4 border-emerald-600 border-opacity-50" />
            <p className="mt-7 text-lg">Loading...</p>
        </div>
    )
}