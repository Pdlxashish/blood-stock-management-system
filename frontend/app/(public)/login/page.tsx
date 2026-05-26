'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import axiosInstance from "@/lib/axiosInstance";
import { API_PATHS } from "@/lib/apiPaths";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, loginData);

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect based on role and verification status
        let redirectUrl = '/';
        
        if (!user.isVerified && user.role === 'DONOR') {
          // Unverified donor -> complete profile
          redirectUrl = '/donor-form';
        } else if (user.role === 'DONOR') {
          // Verified donor -> home
          redirectUrl = '/home';
        } else {
          // Admin/Staff -> dashboard (or stay on current page if already on dashboard)
          redirectUrl = '/dashboard';
        }
        
        // Force a page reload to update navbar
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Login failed. Please check your credentials.';
      
      // Check if email verification is required
      if (errorData?.requiresEmailVerification) {
        setError(errorMessage);
        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(errorData.email)}`);
        }, 2000);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-4">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-full mb-3">
              <Droplets className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Login to your account</p>
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

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Enter email"
                      className="pl-9"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter password"
                      className="pl-9 pr-9"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer Link */}
          <div className="text-center mt-5 text-sm">
            <Link href="/become-donor" className="text-red-600 hover:underline font-medium">
              Don't have an account? Become a blood donor
            </Link>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}