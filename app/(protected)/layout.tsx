import { Nav } from '@/components/nav'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav />
      <main className="w-full max-w-4xl mx-auto md:-mt-4 md:pt-0 relative z-10">
        {children}
      </main>
    </div>
  )
}