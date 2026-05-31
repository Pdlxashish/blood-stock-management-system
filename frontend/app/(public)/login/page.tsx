'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import axiosInstance from "@/lib/axiosInstance";
import { API_PATHS } from "@/lib/apiPaths";
import { validateLoginData } from "@/lib/validators";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const tokenFromUrl = searchParams.get('token');
  const errorFromUrl = searchParams.get('error');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Handle Google OAuth callback with token
  useEffect(() => {
    const handleGoogleAuthCallback = async () => {
      // Check for error from Google OAuth
      if (errorFromUrl) {
        console.error('❌ [GOOGLE AUTH] Error from callback:', errorFromUrl);
        setError('Google authentication failed. Please try again.');
        // Clear the error from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        window.history.replaceState({}, '', newUrl.toString());
        return;
      }

      // Check if token exists in URL (from Google OAuth callback)
      if (tokenFromUrl) {
        console.log('🔍 [GOOGLE AUTH] Token found in URL, processing...');
        console.log('🔍 [GOOGLE AUTH] Token preview:', tokenFromUrl.substring(0, 20) + '...');
        setLoading(true);
        
        try {
          // Store token first so axiosInstance can use it
          localStorage.setItem('token', tokenFromUrl);
          
          console.log('🔍 [GOOGLE AUTH] Fetching user profile from:', API_PATHS.AUTH.GET_PROFILE);
          
          // Fetch user profile with the token
          const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE, {
            headers: {
              Authorization: `Bearer ${tokenFromUrl}`
            }
          });

          console.log('🔍 [GOOGLE AUTH] Response received:', response.status);

          if (response.data.success) {
            const user = response.data.data;
            
            console.log('✅ [GOOGLE AUTH] User profile fetched:', user);
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(user));

            // Clear token from URL for security
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('token');
            window.history.replaceState({}, '', newUrl.toString());

            // Redirect based on user status
            let finalRedirectUrl = '/';
            
            if (user.role === 'DONOR') {
              if (!user.hasDonorProfile) {
                finalRedirectUrl = '/donor-form';
              } else if (user.donorStatus === 'PENDING') {
                finalRedirectUrl = '/verification-request';
              } else if (user.donorStatus === 'APPROVED' || user.donorStatus === 'VERIFIED') {
                finalRedirectUrl = '/home';
              } else {
                finalRedirectUrl = '/home';
              }
            } else {
              finalRedirectUrl = '/dashboard';
            }
            
            console.log('🎯 [GOOGLE AUTH] Redirecting to:', finalRedirectUrl);
            
            // Small delay to ensure localStorage is written
            setTimeout(() => {
              window.location.href = finalRedirectUrl;
            }, 100);
          }
        } catch (err: any) {
          console.error('❌ [GOOGLE AUTH] Failed to fetch user profile:', err);
          console.error('❌ [GOOGLE AUTH] Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            url: err.config?.url,
          });
          
          // Clear invalid token
          localStorage.removeItem('token');
          
          // Show user-friendly error
          const errorMessage = err.response?.data?.message || 
                              err.response?.status === 404 ? 'Profile endpoint not found. Please contact support.' :
                              'Failed to complete Google sign-in. Please try again.';
          setError(errorMessage);
          setLoading(false);
          
          // Clear token from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    };

    handleGoogleAuthCallback();
  }, [tokenFromUrl, errorFromUrl, router]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate login data
    const validation = validateLoginData(loginData);
    if (!validation.isValid) {
      setError(validation.message || 'Please check your credentials');
      setLoading(false);
      return;
    }

    try {
      // 🔍 Clear stale localStorage data before login
      console.log('🔍 [LOGIN] Clearing stale localStorage data...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, loginData);

      if (response.data.success) {
        const { user, token } = response.data.data;

        // 🔍 DEBUG LOGS
        console.log('🔍 [LOGIN] User data received:', user);
        console.log('🔍 [LOGIN] hasDonorProfile:', user.hasDonorProfile);
        console.log('🔍 [LOGIN] donorStatus:', user.donorStatus);
        console.log('🔍 [LOGIN] donorId:', user.donorId);
        console.log('🔍 [LOGIN] role:', user.role);
        console.log('🔍 [LOGIN] isVerified:', user.isVerified);

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Check if there's a redirect URL from query params
        if (redirectUrl) {
          console.log('🎯 [LOGIN] Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
          return;
        }

        // Redirect based on role and donor profile status
        let finalRedirectUrl = '/';
        
        if (user.role === 'DONOR') {
          console.log('🔍 [LOGIN] User is DONOR - checking donor profile...');
          
          // Check if user has a donor profile
          if (!user.hasDonorProfile) {
            console.log('❌ [LOGIN] No donor profile found - redirecting to /donor-form');
            finalRedirectUrl = '/donor-form';
          } else {
            console.log('✅ [LOGIN] Has donor profile - checking status...');
            
            // User has donor profile - check verification status
            if (user.donorStatus === 'PENDING') {
              console.log('⏳ [LOGIN] Status PENDING - redirecting to /verification-request');
              finalRedirectUrl = '/verification-request';
            } else if (user.donorStatus === 'APPROVED' || user.donorStatus === 'VERIFIED') {
              console.log('✅ [LOGIN] Status APPROVED/VERIFIED - redirecting to /home');
              finalRedirectUrl = '/home';
            } else if (user.donorStatus === 'REJECTED') {
              console.log('❌ [LOGIN] Status REJECTED - redirecting to /home');
              finalRedirectUrl = '/home';
            } else {
              console.log('❓ [LOGIN] Unknown status - redirecting to /home');
              finalRedirectUrl = '/home';
            }
          }
        } else {
          console.log('🔍 [LOGIN] User is ADMIN/STAFF - redirecting to /dashboard');
          // Admin/Staff -> dashboard
          finalRedirectUrl = '/dashboard';
        }
        
        console.log('🎯 [LOGIN] Final redirect URL:', finalRedirectUrl);
        
        // Force a page reload to update navbar
        window.location.href = finalRedirectUrl;
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Login failed. Please check your credentials.';
      
      console.error('❌ [LOGIN] Error:', errorMessage);
      
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

              {/* Google Sign In Button */}
              <div className="mb-4">
                <GoogleAuthButton mode="signin" />
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

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
                  <div className="flex items-center justify-between mb-1">
                    <Label>Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-red-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
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