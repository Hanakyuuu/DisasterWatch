import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="font-headline text-3xl foreground font-bold tracking-tight md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            Find answers to common questions about Crisis Companion.
          </p>
      </div> {/* Added back horizontal padding */}
        <div className="faq-accordion-container text-white">
        <Accordion type="single" collapsible className="w-full p-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Crisis Companion?</AccordionTrigger>
              <AccordionContent>
                Crisis Companion is a support system designed to assist individuals during natural
                disasters and emotional distress. It offers timely information, emotional support,
                and emergency preparedness tools.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is my personal data safe?</AccordionTrigger>
              <AccordionContent>
                Yes, we prioritize your privacy. Registered users have full control over their
                personal data and can customize their privacy settings. We use industry-standard
                security measures to protect your information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How does the AI chatbot work?</AccordionTrigger>
              <AccordionContent>
                Our AI chatbot provides real-time emotional support and answers to disaster-related
                questions. It's trained to be a supportive and informative companion, available 24/7
                for registered users.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I use the app without registering?</AccordionTrigger>
              <AccordionContent>
                Absolutely. Unregistered users can access general crisis-related information and
                public resources. However, features like the AI chatbot and personalized alerts
                require registration.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
