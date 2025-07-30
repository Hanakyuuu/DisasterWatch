import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Cta() {
  return (
    <section id="cta" className="py-16 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6" >
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="flex flex-col items-center space-y-4 p-8 text-center md:p-12 card-gradient">
            <h2 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Be Prepared?
            </h2>
            <p className="max-w-xl text-muted-foreground md:text-lg text-white">
              Create your account today to access personalized alerts, AI support, and emergency
              planning tools. Stay safe and supported with Crisis Companion.
            </p>
            <div className="flex space-x-4">
            <Button className="btn-hover border border-white rounded-lg" asChild size="lg">
                <Link href="/user/dashboard">Get Started Free</Link>
            </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
