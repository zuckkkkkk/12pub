import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Beer, MapPin, Trophy, Camera, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">🍺</div>
          <div className="absolute top-40 right-20 text-4xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🎄</div>
          <div className="absolute bottom-40 left-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🎅</div>
          <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>🍻</div>
        </div>

        {/* Logo/Icon */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gold/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-gold to-gold-dark p-4 rounded-2xl">
            <Beer className="h-16 w-16 text-zinc-900" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-6xl font-bold text-zinc-100 mb-4">
          12 Pubs of
          <span className="block bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            Bologna
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-zinc-400 max-w-md mb-8">
          La sfida definitiva del pub crawl natalizio. 
          12 tappe, 12 sfide, un solo vincitore.
        </p>

        {/* CTA Button */}
        <Link href="/auth">
          <Button size="lg" className="text-lg px-8 group">
            Inizia la Sfida
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
          {[
            { icon: MapPin, label: '12 Pub', desc: 'da visitare' },
            { icon: Beer, label: 'Timer', desc: 'per ogni tappa' },
            { icon: Camera, label: 'Foto', desc: 'da scattare' },
            { icon: Trophy, label: 'Classifica', desc: 'in tempo reale' },
          ].map((feature, i) => (
            <div 
              key={i}
              className="flex flex-col items-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
            >
              <feature.icon className="h-6 w-6 text-gold mb-2" />
              <span className="text-zinc-100 font-semibold">{feature.label}</span>
              <span className="text-xs text-zinc-500">{feature.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-zinc-600">
        <p>Bevi responsabilmente 🎄</p>
      </footer>
    </main>
  )
}
