'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Phone, Mail, AlertCircle, Home } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';

export default function VerificationRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-green-600">Account Info</span>
              </div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-green-600">Medical Info</span>
              </div>
              <div className="w-16 h-1 bg-red-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="text-sm font-medium text-red-600">Verification</span>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Step 3: Verification Request Submitted</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Success Icon */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Registration Complete!
                </h2>
                <p className="text-gray-600">
                  Thank you for registering as a blood donor, {user.name}!
                </p>
              </div>

              {/* Status Card */}
              <Card className="bg-yellow-50 border-yellow-200 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        Verification Pending
                      </h3>
                      <p className="text-sm text-yellow-800 mb-3">
                        Your donor profile has been submitted and is currently pending verification by our admin team. 
                        This process typically takes 1-2 business days.
                      </p>
                      <div className="bg-yellow-100 rounded-lg p-3 text-sm text-yellow-900">
                        <p className="font-medium mb-1">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Our team will review your information</li>
                          <li>We may contact you via phone or email for verification</li>
                          <li>Once verified, you'll receive a confirmation notification</li>
                          <li>You can then start participating in blood donation activities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-blue-50 border-blue-200 mb-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Your Contact Information
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Please ensure you're available at the following contact details for verification:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Email:</span>
                      <span className="text-blue-800">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Phone:</span>
                      <span className="text-blue-800">{user.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card className="bg-gray-50 border-gray-200 mb-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Important Notes
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">•</span>
                      <span>Keep your phone accessible for verification calls from our team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">•</span>
                      <span>Check your email regularly for updates on your verification status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">•</span>
                      <span>You can check your verification status anytime in your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">•</span>
                      <span>Once verified, you'll have full access to all donor features</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push('/home')}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-lg font-semibold"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go to Home
                </Button>
                <Button
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  className="flex-1 h-12 text-lg font-semibold"
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
