'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import NotificationBell from '@/components/NotificationBell';
import DonationCountdown from '@/components/DonationCountdown';
import { useDonorByUserId } from '@/lib/queries/donors';
import { useDonationsByUser } from '@/lib/queries/donations';
import { useEvents, useUserEventParticipations, useUserEventVolunteers } from '@/lib/queries/events';
import { useCertificatesByUser } from '@/lib/queries/certificates';
import type { Certificate } from '@/lib/queries/certificates';
import { CertificatePreview } from '@/lib/certificate-preview';
import { useHasMounted } from '@/hooks/useHasMounted';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';
import {
  Heart,
  Calendar,
  Award,
  Droplet,
  MapPin,
  Users,
  Clock,
  Printer,
} from 'lucide-react';
import Link from 'next/link';

export default function DonorHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const hasMounted = useHasMounted();

  // Queries
  const { data: donorProfile } = useDonorByUserId(user?.id || '');
  const { data: donations, isLoading: donationsLoading, error: donationsError } = useDonationsByUser(user?.id || '');
  const { data: events } = useEvents({ status: 'UPCOMING', limit: 3 });
  const { data: certificates = [] } = useCertificatesByUser(user?.id || '');
  const { data: eventParticipations = [] } = useUserEventParticipations(user?.id || '');
  const { data: eventVolunteers = [] } = useUserEventVolunteers(user?.id || '');

  // Debug logging
  console.log('🔍 Debug Info:', {
    userId: user?.id,
    donorProfile,
    donations,
    donationsLoading,
    donationsError,
  });

  // Calculate stats from actual data
  const donorStats = {
    totalDonations: donations?.length || 0,
    eventsAttended: eventParticipations.length + eventVolunteers.length, // Count both participations and volunteer records
    certificates: certificates.length,
    lastDonationDate: donations?.[0]?.donationDate,
    nextEligibleDate: donations?.[0]?.donationDate 
      ? new Date(new Date(donations[0].donationDate).getTime() + (56 * 24 * 60 * 60 * 1000)).toISOString() // 56 days later
      : undefined,
  };

  useEffect(() => {
    // Handle token from Google OAuth redirect FIRST
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      console.log('[HOME] Received OAuth token, storing and fetching user data');
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user data with the new token
      axiosInstance.get(API_PATHS.AUTH.GET_PROFILE, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const userData = response.data.data;
          console.log('[HOME] User data fetched:', userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setLoading(false);
          
          // Remove token from URL
          window.history.replaceState({}, '', '/home');
        })
        .catch(err => {
          console.error('[HOME] Failed to fetch user data:', err);
          router.push('/login?error=auth_failed');
        });
      return;
    }

    if (error === 'auth_failed') {
      console.error('[HOME] OAuth authentication failed');
      router.push('/login?error=auth_failed');
      return;
    }

    // Normal authentication check (no OAuth token in URL)
    if (!isAuthenticated()) {
      console.log('[HOME] Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (!userData) {
      console.log('[HOME] No user data found, redirecting to login');
      router.push('/login');
      return;
    }

    // Only donors should access this page
    if (userData.role !== 'DONOR') {
      console.log('[HOME] User is not a donor, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('[HOME] User authenticated:', userData.email);
    setUser(userData);
    setLoading(false);
  }, [router, searchParams]);

  if (!hasMounted || loading || donationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate upcoming events for this user
  const upcomingEvents = events?.filter(event => {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    return eventDate > now;
  }) || [];

  // Get recent donations (last 5)
  const recentDonations = donations?.slice(0, 5) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Thank you for being a life saver. Here's your donor dashboard.
              </p>
              {donationsError && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Unable to load donation data. Please refresh the page or contact support if the issue persists.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell userId={user.id} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {donorStats.totalDonations}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-md">
                    <Droplet className="h-7 w-7 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Events Attended</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {donorStats.eventsAttended}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
                    <Calendar className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certificates</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {donorStats.certificates}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center shadow-md">
                    <Award className="h-7 w-7 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Events */}
              <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Upcoming Blood Donation Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(event.eventDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              </div>
                            </div>
                            <Badge variant={event.status === 'UPCOMING' ? 'default' : 'secondary'}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Link href={`/events/${event.id}`}>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-4">
                        <Link href="/events">
                          <Button variant="outline">
                            View All Events
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No upcoming events at the moment</p>
                      <Link href="/events">
                        <Button variant="outline" className="mt-4">
                          Browse All Events
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Donation History */}
              <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-red-600" />
                    Recent Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentDonations.length > 0 ? (
                    <div className="space-y-4">
                      {recentDonations.map((donation) => (
                        <div key={donation.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <Droplet className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Blood Group: {donation.bloodGroup}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {donation.units} unit{donation.units > 1 ? 's' : ''} donated
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(donation.donationDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {donation.location}
                                </div>
                              </div>
                              {donation.notes && (
                                <p className="text-sm text-gray-600 mt-2">{donation.notes}</p>
                              )}
                            </div>
                            <Badge variant={
                              donation.status === 'COMPLETED' ? 'default' : 
                              donation.status === 'PENDING' ? 'secondary' : 'destructive'
                            }>
                              {donation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Droplet className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>You haven't made any donations yet</p>
                      <p className="text-sm mt-2">Start saving lives today!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Countdown Timer */}
              {donorProfile && (
                <DonationCountdown 
                  lastDonationDate={donorStats.lastDonationDate}
                  donorId={donorProfile.id}
                />
              )}

              {/* Profile Card */}
              <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {donorProfile?.bloodGroup && (
                        <p className="text-sm font-medium text-red-600">
                          Blood Group: {donorProfile.bloodGroup.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Role</span>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    {donorProfile?.isEligible !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Eligible to Donate</span>
                        <Badge variant={donorProfile.isEligible ? 'default' : 'secondary'}>
                          {donorProfile.isEligible ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}
                    {donorStats.lastDonationDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Donation</span>
                        <span className="text-sm text-gray-900">
                          {new Date(donorStats.lastDonationDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {donorStats.nextEligibleDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Next Eligible</span>
                        <span className="text-sm text-gray-900">
                          {new Date(donorStats.nextEligibleDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link href="/profile">
                    <Button variant="outline" className="w-full">
                      View Full Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/events">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Calendar className="h-4 w-4" />
                      Find Events
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      About Us
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* My Certificates */}
              <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    My Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <button
                          key={cert.id}
                          onClick={() => setSelectedCert(cert)}
                          className="w-full text-left border rounded-lg p-3 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Award className="h-4 w-4 text-yellow-600 shrink-0" />
                                <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-yellow-700">
                                  {cert.type === 'DONATION' ? 'Donation Certificate' : 'Volunteer Certificate'}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 font-mono">{cert.certificateNumber}</p>
                              {cert.eventTitle && (
                                <p className="text-xs text-gray-600 mt-1 truncate">{cert.eventTitle}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(cert.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              className={cert.type === 'DONATION'
                                ? 'bg-red-100 text-red-700 border-red-200 shrink-0 text-xs'
                                : 'bg-blue-100 text-blue-700 border-blue-200 shrink-0 text-xs'
                              }
                              variant="outline"
                            >
                              {cert.type === 'DONATION' ? 'Donation' : 'Volunteer'}
                            </Badge>
                          </div>
                          <p className="text-xs text-yellow-600 mt-2 font-medium group-hover:underline">
                            Click to view certificate →
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Award className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No certificates yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Certificates are issued by the admin after your donation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Impact Card */}
              <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Heart className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">Your Impact</h3>
                      {donorStats.totalDonations && donorStats.totalDonations > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm text-red-100">
                            You've made {donorStats.totalDonations} donation{donorStats.totalDonations > 1 ? 's' : ''}!
                          </p>
                          <p className="text-sm text-red-100">
                            Thank you for being a hero! 🦸‍♂️
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-100">
                          Every donation can save up to 3 lives. Start your journey as a life saver today!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />

      {/* Certificate Preview Modal */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="!w-[95vw] !max-w-none h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              {selectedCert?.type === 'DONATION' ? 'Donation Certificate' : 'Volunteer Certificate'}
            </DialogTitle>
            <DialogDescription>
              Preview and download your certificate
            </DialogDescription>
          </DialogHeader>
          <div className="print:hidden mb-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
          </div>
          <div id="print-area" className="overflow-x-auto">
            <CertificatePreview cert={selectedCert} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
