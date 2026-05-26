'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { API_PATHS } from "@/lib/apiPaths";
import { useAuthStore } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    id: "",
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
      const response = await axiosInstance.post(API_PATHS.AUTH.ADMIN_LOGIN, loginData);

      if (response.data.success) {
        const { admin, token } = response.data.data;

        // Use Zustand auth store
        login(admin, token);
        
        // Also store in localStorage for backward compatibility
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(admin));
        localStorage.setItem('isAdmin', 'true');

        // Redirect to admin dashboard
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md px-4">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400 text-sm">Secure access for administrators only</p>
        </div>

        {/* Card */}
        <Card className="shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <Label className="text-slate-200">Admin ID</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    name="id"
                    type="text"
                    value={loginData.id}
                    onChange={handleLoginChange}
                    placeholder="Enter admin ID"
                    className="pl-9 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-200">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    className="pl-9 pr-9 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 shadow-lg"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In as Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-xs">
            <Shield className="inline h-3 w-3 mr-1" />
            This is a secure area. All access attempts are logged.
          </p>
        </div>

      </div>
    </div>
  );
}
