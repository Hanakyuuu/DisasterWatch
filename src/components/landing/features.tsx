import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, BotMessageSquare, ClipboardList, UserCog } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <BotMessageSquare className="h-8 w-8 text-primary" />,
      title: 'AI Chatbot Assistance',
      description:
        'Get real-time emotional support and disaster information from our friendly AI companion.',
    },
    {
      icon: <BellRing className="h-8 w-8 text-primary" />,
      title: 'Personalized Alerts',
      description:
        'Set up custom alerts for relevant disasters and receive tailored mental health resources.',
    },
    {
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      title: 'Emergency Preparedness',
      description:
        'Use our AI tool to create a personalized emergency plan based on your location and needs.',
    },
    {
      icon: <UserCog className="h-8 w-8 text-primary" />,
      title: 'Profile & Privacy',
      description:
        'Manage your personal profile and customize your data privacy settings with ease.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
            Your Reliable Partner in Times of Need
          </h2>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            Crisis Companion provides the tools and support you need to navigate any challenge with
            confidence.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col text-center text-white transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg card-gradient" >
              <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-yellow-400">
                {feature.icon}
              </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2 font-headline text-xl">{feature.title}</CardTitle>
                <p className="text-muted-foreground text-white">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}