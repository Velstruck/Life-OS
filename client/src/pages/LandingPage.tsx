import { CTASection } from '../components/hero-dithering-card';
import { ThemeToggle } from '../components/ui/theme-toggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <header className="w-full flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Life OS</h1>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <CTASection />
      </main>
    </div>
  );
}
