import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '12 Pubs of Bologna',
  description: 'La sfida natalizia dei 12 pub!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}