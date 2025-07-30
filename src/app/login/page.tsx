'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { Header } from '@/components/landing/header2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({ email: '', password: '' });

    try {
      // 1. Authenticate user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const normalizedEmail = user.email?.toLowerCase() || '';

      // 2. Check user documents in Firestore
      const [userDoc, adminDoc] = await Promise.all([
        getDoc(doc(db, 'user', normalizedEmail)),
        getDoc(doc(db, 'admins', normalizedEmail))
      ]);

      // 3. Create user document if it doesn't exist
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'user', normalizedEmail), {
          email: normalizedEmail,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          role: adminDoc.exists() ? 'admin' : 'user'
        });
      }

      // 4. Redirect based on role
      router.push(adminDoc.exists() ? '/admin/admin-dashboard' : '/user/dashboard');

    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle all possible authentication errors
      switch (error.code) {
        case 'auth/invalid-email':
          setFieldErrors({
            email: 'Please enter a valid email address',
            password: ''
          });
          break;
        case 'auth/user-not-found':
          setFieldErrors({
            email: 'No account found with this email',
            password: ''
          });
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setFieldErrors({
            email: 'Incorrect email or password',
            password: 'Incorrect email or password'
          });
          setError('Incorrect email or password');
          break;
        case 'auth/too-many-requests':
          setError('Account temporarily locked. Try again later.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    if (error) setError('');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Login Form */}
        <div className="mt-[-80px] flex flex-col justify-center px-8 md:px-16">
          <div className="max-w-md w-full mx-auto animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">Log in to your account</h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <div className="text-red-500 text-sm mt-1">{fieldErrors.email}</div>
                )}
              </div>
              
              <div>
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Password
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {fieldErrors.password && (
                  <div className="text-red-500 text-sm mt-1">{fieldErrors.password}</div>
                )}
              </div>
              
              <div className="pt-2">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4 btn-hover"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : 'Log In'}
              </Button>
            </form>
            
            <p className="text-sm mt-4 text-center">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary underline hover:text-black/100">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Image */}
        <div className="hidden md:flex items-center justify-center relative px-4">
          <div className="relative w-[400px] h-[400px] mt-[-100px]">
            {/* Background Blobs */}
            <div className="absolute top-[40px] left-[-20px] h-32 w-32 rounded-full bg-blue-300/50 opacity-70 blur-4xl z-0" />
            <div className="absolute bottom-[30px] right-[-10px] h-52 w-52 rounded-full bg-blue-400/30 opacity-50 blur-4xl z-1" />

            {/* Main Image */}
            <Image
              src="/robot4.png"
              width={400}
              height={400}
              alt="Hero Image"
              className="relative z-10 overflow-hidden rounded-xl animate-float"
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}