export default function PlayLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-[100dvh] text-white selection:bg-white/20 overflow-hidden flex flex-col">
            {children}
        </div>
    )
}
