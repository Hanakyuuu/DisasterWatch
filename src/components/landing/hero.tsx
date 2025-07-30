import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative py-20 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 top-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div>
      </div>
      <div className="container mx-auto flex flex-col items-center gap-10 px-4 md:px-6 lg:flex-row lg:gap-20">
        <div className="flex flex-col items-center space-y-6 text-center lg:items-start lg:text-left animate-fade-in ml-10">
          <h3 className=" mt-[-100px] font-headline font-bold text-4xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl ">Crisis Companion:</h3>
          <h3 className=" mt-[-100px] font-headline font-bold text-4xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl ">Support and Safety</h3>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">Crisis Companion offers calm guidance and reliable support through natural disasters and emotional distress, ensuring you're never alone.</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button className='btn-hover' asChild size="lg">
              <Link href="/user/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md lg:max-w-none lg:flex-1 animate-fade-in relative ml-6">

          <div className="bubble1" />
          <div className="bubble2" />
          <div className="bubble3" />
          {/* Sphere 1 */}
          <div className="absolute top-[-30px] left-[-60px] h-44 w-44 rounded-full bg-blue-300/50 opacity-100 blur-4xl z-0" />

          {/* Sphere 2 */}
          <div className="absolute bottom-[-20px] right-[-10px] h-72 w-72 rounded-full bg-blue-400/30 opacity-50 blur-4xl z-1" />

          {/* Hero Image */}
          <Image
            src="/robot.png"
            width={700}
            height={700}
            alt="Hero Image"
            className="relative z-10 ml-1 overflow-hidden rounded-xl sm:w-full lg:order-last -mt-12 animate-float "
          />
        </div>
      </div>
    </section>
  );
}
