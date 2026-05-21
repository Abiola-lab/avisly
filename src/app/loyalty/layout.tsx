export default function LoyaltyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col">
            {children}
        </div>
    )
}
