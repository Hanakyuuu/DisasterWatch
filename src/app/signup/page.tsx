'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '@/services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string; phone?: string}>({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [canProceed, setCanProceed] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const router = useRouter();

  const locations = [
    'Kachin', 'Kayah', 'Kayin', 'Chin', 'Mon', 
    'Rakhine', 'Shan', 'Ayeyarwady', 'Bago', 
    'Magway', 'Mandalay', 'Naypyidaw', 'Sagaing',
    'Tanintharyi', 'Yangon'
  ];

  const genders = ['Male', 'Female', 'Other'];

  const validate = () => {
    const newErrors: {email?: string; password?: string; confirmPassword?: string; phone?: string} = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?\d{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Phone must be a valid number (10-15 digits, may start with +)';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password)) {
      newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert('You must agree to the terms and privacy policy.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(firestore, 'user'), {
        uid: userCredential.user.uid,
        email,
        fullName,
        phone,
        gender,
        dob,
        location,
         notificationEnabled: false, // Default to true
  minMagnitude: 1, 
        createdAt: new Date()
      });
      setShowSuccessAlert(true);
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    }
  };

  const handleSuccessAlertClose = () => {
    setShowSuccessAlert(false);
    router.push('/login');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
  };
  
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
  };

  React.useEffect(() => {
    validate();
  }, [fullName, phone, gender, dob, location, email, password, confirmPassword]);

  React.useEffect(() => {
    const allFilled = fullName && phone && gender && dob && location && email && password && confirmPassword;
    setCanProceed(!!allFilled && validate());
  }, [fullName, phone, gender, dob, location, email, password, confirmPassword]);

  const missingFields = () => {
    const fields = [];
    if (!fullName) fields.push('Full Name');
    if (!phone) fields.push('Phone Number');
    if (!gender) fields.push('Gender');
    if (!dob) fields.push('Date of Birth');
    if (!location) fields.push('Location');
    if (!email) fields.push('Email');
    if (!password) fields.push('Password');
    if (!confirmPassword) fields.push('Confirm Password');
    return fields;
  };

  const LabelWithIcon = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <Icon className="w-4 h-4 text-primary" />
      {text}
    </Label>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">
        {step === 1 ? (
          <form onSubmit={handleNext}>
            <h1 className="text-2xl font-semibold mb-6 text-center">Create an Account</h1>
            <p className="text-muted-foreground mb-6 text-center">Create your account and discover amazing opportunities</p>
            
            <div className="space-y-5">
              <div>
                <LabelWithIcon icon={User} text="Full Name" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <LabelWithIcon icon={Phone} text="Phone Number" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
              </div>

              <div>
                <LabelWithIcon icon={Users} text="Gender" />
                <Select onValueChange={(val) => setGender(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g} value={g.toLowerCase()}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <LabelWithIcon icon={Calendar} text="Date of Birth" />
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div>
                <LabelWithIcon icon={Mail} text="Email" />
                <Input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
              </div>

              <div>
                <LabelWithIcon icon={Lock} text="Password" />
                <Input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
              </div>

              <div>
                <LabelWithIcon icon={Lock} text="Confirm Password" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
              </div>

              <div>
                <LabelWithIcon icon={MapPin} text="Location" />
                <Select onValueChange={(val) => setLocation(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc.toLowerCase()}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl btn-hover"
                  disabled={!canProceed}
                >
                  Next
                </Button>
              </div>

              {((!email || !password || !confirmPassword || Object.keys(errors).length > 0) || missingFields().length > 0) && (
                <div className="text-yellow-600 text-sm mt-2 text-center">
                  {missingFields().length > 0
                    ? `Please fill: ${missingFields().join(', ')}`
                    : 'Please enter a valid email and password (at least 8 characters, uppercase, lowercase, number, special character, passwords must match).'}
                </div>
              )}

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:text-black/80 font-medium underline transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <h2 className="text-2xl font-semibold mb-6 text-center">User Agreement</h2>
            <div className="mb-4 p-3 border rounded bg-gray-50 text-sm max-h-60 overflow-y-auto">
              <p className="mb-4">
                Welcome to our Disaster Management Platform. By creating an account, you acknowledge and agree to the following terms and conditions that govern your use of our services:
              </p>
              <p className="mb-4">
                <strong>1. Purpose of Data Collection:</strong> The personal information you provide (including name, contact details, location, and other relevant data) will be used exclusively for disaster preparedness, response, and recovery purposes. This includes sending you critical alerts, evacuation notices, and emergency information.
              </p>
              <p className="mb-4">
                <strong>2. Data Protection:</strong> We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your data will be stored on secure servers and accessed only by authorized personnel for legitimate disaster management purposes.
              </p>
              <p className="mb-4">
                <strong>3. Information Sharing:</strong> In emergency situations, we may share your information with government agencies, first responders, and relief organizations to facilitate life-saving assistance. Such sharing will be limited to what is necessary for emergency response operations.
              </p>
              <p className="mb-4">
                <strong>4. User Responsibilities:</strong> You agree to provide accurate and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Promptly notify us of any unauthorized use or security breaches.
              </p>
              <p className="mb-4">
                <strong>5. Communication Consent:</strong> By registering, you consent to receive emergency alerts, warnings, and related communications via SMS, email, or other available channels. Standard messaging rates may apply.
              </p>
              <p className="mb-4">
                <strong>6. Prohibited Activities:</strong> You may not use this platform for any unlawful purpose or in any way that could damage, disable, or impair the service. False reporting or misuse of emergency features is strictly prohibited and may result in legal consequences.
              </p>
              <p className="mb-4">
                <strong>7. Limitation of Liability:</strong> While we strive to provide accurate and timely information, we cannot guarantee the completeness or reliability of all data during rapidly evolving emergency situations. Use this service at your own discretion in conjunction with other information sources.
              </p>
              <p className="mb-4">
                <strong>8. Amendments:</strong> These terms may be updated periodically to reflect changes in our services or legal requirements. Continued use of the platform after such changes constitutes your acceptance of the new terms.
              </p>
              <p>
                By checking the agreement box, you confirm that you have read, understood, and agreed to these terms and our <a href="#" className="underline">Privacy Policy</a>. If you do not agree, please do not proceed with registration.
              </p>
            </div>
            <label className="flex items-center mb-4 text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-2"
                required
              />
              I agree to the terms and conditions outlined above
            </label>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl btn-hover"
              disabled={!agree}
            >
              Sign Up
            </Button>
          </form>
        )}
      </div>

      {/* Success Alert Dialog */}
<AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
  <AlertDialogContent className="bg-sky-50 border-sky-100">
    <AlertDialogHeader>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-sky-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-sky-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <AlertDialogTitle className="text-sky-800">Registration Successful!</AlertDialogTitle>
      </div>
      <AlertDialogDescription className="text-sky-700 pl-10">
        Your account has been created successfully. You can now log in with your credentials.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction 
        onClick={handleSuccessAlertClose}
        className="bg-sky-600 hover:bg-sky-700 text-white"
      >
        Continue to Login
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}