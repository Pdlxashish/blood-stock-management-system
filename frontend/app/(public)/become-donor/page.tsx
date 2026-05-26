'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, User, Mail, Lock, Phone, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function BecomeDonorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClaimPrompt, setShowClaimPrompt] = useState(false);
  const [existingAccount, setExistingAccount] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check if account exists when phone/email changes
  const checkExistingAccount = async (phone: string, email: string) => {
    if (!phone && !email) return;

    try {
      const params = new URLSearchParams();
      if (phone) params.append('phone', phone);
      if (email) params.append('email', email);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/account-claim/check?${params}`
      );
      
      if (!response.ok) {
        console.error('Failed to check existing account:', response.statusText);
        return;
      }
      
      const data = await response.json();

      if (data.data.exists) {
        setExistingAccount(data.data);
        setShowClaimPrompt(true);
      } else {
        setExistingAccount(null);
        setShowClaimPrompt(false);
      }
    } catch (err) {
      console.error('Error checking account:', err);
      // Silently fail - don't block registration if check fails
      setExistingAccount(null);
      setShowClaimPrompt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for existing account before submitting
    if (showClaimPrompt && existingAccount && !existingAccount.isVerified) {
      setError('You already have an account! Please use "Claim Account" below.');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          role: 'DONOR',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a claim account scenario
        if (data.shouldClaimAccount) {
          setShowClaimPrompt(true);
          setExistingAccount(data);
          setError(data.message);
          return;
        }
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful - redirect to OTP verification
      alert('Registration successful! Please check your email for OTP verification.');
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Life Saver</h1>
            <p className="text-gray-600">Join our community of heroes and start saving lives today</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-red-600">Account Info</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="text-sm font-medium text-gray-500">Medical Info</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="text-sm font-medium text-gray-500">Verification</span>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Step 1: Create Your Account</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                    {showClaimPrompt && existingAccount && !existingAccount.isVerified && (
                      <Button
                        type="button"
                        onClick={() => router.push('/claim-account')}
                        className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Claim Your Account →
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value });
                          // Check for existing account on blur
                        }}
                        onBlur={() => checkExistingAccount(form.phone, form.email)}
                        placeholder="+1 234 567 8900"
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Next Step:</strong> After creating your account, you'll be asked to provide medical information like blood group, weight, and age to complete your donor profile.
                  </p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" required disabled={loading} />
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-red-600 hover:underline font-medium">Terms & Conditions</a>
                    {" "}and{" "}
                    <a href="#" className="text-red-600 hover:underline font-medium">Privacy Policy</a>
                  </span>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Register"}
                </Button>
              </form>

              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-red-600 hover:underline font-semibold">
                    Login here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
