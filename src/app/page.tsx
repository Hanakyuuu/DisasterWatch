import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Faq } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { Cta } from '@/components/landing/cta';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <div className="container mx-auto px-4 md:px-6">
          <Separator />
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <Separator />
        </div>
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
