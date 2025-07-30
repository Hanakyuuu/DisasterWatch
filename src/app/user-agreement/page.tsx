'use client';

import { Header } from '@/components/landing/header2';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
  
export default function UserAgreementPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleAgree = () => {
    if (agreed) {
      // Redirect to your desired route, e.g. account created or dashboard
      router.push('/welcome'); // adjust as needed
    }
  };

  return (
    <>
        <Header />
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-2xl bg-white rounded-xl shadow-lg p-8 w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Terms and Conditions</h1>

        <div className="max-h-64 overflow-y-auto border rounded-md p-4 text-sm text-gray-700 bg-gray-50">
            <p>
                Welcome to Crisis Companion. Before proceeding, please carefully read the following User Agreement:
            </p>
            <p className="mt-3">
                By creating an account, you agree to provide accurate and truthful information. You acknowledge that your personal data will be used in accordance with our privacy policies. You agree to use the platform responsibly and not engage in any activities that could harm other users or the system.
            </p>
            <p className="mt-3">
                We reserve the right to suspend or terminate accounts that violate these terms. Continued use of this platform constitutes acceptance of this agreement.
            </p>
            <p className="mt-3 text-gray-500">
                Last updated: July 2025
            </p>
        </div>


        <div className="flex items-center gap-2">
          <Checkbox id="agree" checked={agreed} onCheckedChange={() => setAgreed(!agreed)} />
          <Label htmlFor="agree" className="text-sm">
            I have read and agree to the User Agreement.
          </Label>
        </div>

        <Button
          disabled={!agreed}
          onClick={handleAgree}
          className="w-full h-12 text-lg font-semibold rounded-xl transition btn-hover"
        >
            <Sparkles className="w-5 h-5 mr-2" />
          Create My Account
        </Button>
      

        <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button type="button" className="text-primary hover:text-black/80 font-medium underline transition-colors">
                    Sign In
                  </button>
                </p>
        </div>
        </div>
    </main>
    </>
  );
}
