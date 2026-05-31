'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import PasswordInput from '@/components/PasswordInput';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { validatePassword } from '@/lib/validators';

interface Account {
  id: string;
  name: string;
  email: string;
  role: string;
  bloodGroup: string | null;
  location: string | null;
  createdAt: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'select' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [email, setEmail] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check email as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && email.includes('@')) {
        checkEmail();
      } else {
        setAccounts([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const checkEmail = async () => {
    setCheckingEmail(true);
    setError('');
    
    try {
      const response = await axiosInstance.get(`/api/email/check?email=${encodeURIComponent(email)}`);
      
      if (response.data.exists) {
        setAccounts(response.data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAccounts([]);
      }
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setStep('select');
  };

  const handleRequestReset = async () => {
    if (!selectedAccountId) {
      setError('Please select an account');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/api/password-reset/request', { 
        email,
        userId: selectedAccountId 
      });

      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        toast.success('Reset code sent to your email!');
        setStep('reset');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Invalid password');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/password-reset/reset', {
        email,
        otp,
        newPassword,
      });

      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        toast.success('Password reset successful!');
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-full mb-3">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'email' ? 'Forgot Password?' : step === 'select' ? 'Select Account' : 'Reset Password'}
            </h1>
            <p className="text-gray-600 text-sm">
              {step === 'email'
                ? 'Enter your email to find your account'
                : step === 'select'
                ? 'Select which account you want to reset'
                : 'Enter the code sent to your email and create a new password'}
            </p>
          </div>

          {/* Card */}
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              {/* Step 1: Email Input */}
              {step === 'email' && (
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-9"
                        required
                        disabled={loading}
                      />
                      {checkingEmail && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll check if this email is registered
                    </p>
                  </div>

                  {/* Show accounts if found */}
                  {accounts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Found {accounts.length} account{accounts.length > 1 ? 's' : ''} with this email:
                      </Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {accounts.map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => handleSelectAccount(account.id)}
                            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                  <User className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
                                </div>
                                <p className="font-semibold text-gray-900 text-lg">{account.name}</p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-red-600 rotate-180" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show message if no accounts found */}
                  {email && email.includes('@') && !checkingEmail && accounts.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No account found with this email. Please check your email or{' '}
                        <Link href="/become-donor" className="font-semibold underline">
                          create a new account
                        </Link>
                        .
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Confirm Account Selection */}
              {step === 'select' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Selected Account:</p>
                    {accounts.find(a => a.id === selectedAccountId) && (
                      <div className="space-y-1">
                        <p className="text-sm text-blue-800">
                          <strong>Name:</strong> {accounts.find(a => a.id === selectedAccountId)?.name}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Email:</strong> {accounts.find(a => a.id === selectedAccountId)?.email}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Role:</strong> {accounts.find(a => a.id === selectedAccountId)?.role}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    A 6-digit reset code will be sent to <strong>{email}</strong>
                  </p>

                  <Button
                    onClick={handleRequestReset}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? 'Sending Code...' : 'Send Reset Code'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep('email');
                      setSelectedAccountId('');
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Email
                  </Button>
                </div>
              )}

              {/* Step 3: Reset Password */}
              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label>Reset Code</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="pl-9"
                        maxLength={6}
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Check your email for the reset code
                    </p>
                  </div>

                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    label="New Password"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                    showStrengthIndicator={true}
                    showRequirements={true}
                  />

                  <div>
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-9 pr-9"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep('select')}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center mt-5 space-y-2">
            <Link href="/login" className="text-red-600 hover:underline font-medium text-sm block">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Login
            </Link>
            <Link href="/become-donor" className="text-gray-600 hover:underline text-sm block">
              Don't have an account? Become a donor
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
