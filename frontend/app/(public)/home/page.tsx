'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { useDonorByUserId } from '@/lib/queries/donors';
import { useDonationsByUser } from '@/lib/queries/donations';
import { useEvents } from '@/lib/queries/events';
import { useHasMounted } from '@/hooks/useHasMounted';
import {
  Heart,
  Calendar,
  Award,
  Droplet,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function DonorHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasMounted = useHasMounted();

  // Queries
  const { data: donorProfile } = useDonorByUserId(user?.id || '');
  const { data: donations, isLoading: donationsLoading, error: donationsError } = useDonationsByUser(user?.id || '');
  const { data: events } = useEvents({ status: 'UPCOMING', limit: 3 });

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
    livesSaved: (donations?.length || 0) * 3, // Each donation saves ~3 lives
    eventsAttended: 0, // TODO: Calculate from event participation
    certificates: donations?.filter(d => d.status === 'COMPLETED').length || 0,
    lastDonationDate: donations?.[0]?.donationDate,
    nextEligibleDate: donations?.[0]?.donationDate 
      ? new Date(new Date(donations[0].donationDate).getTime() + (56 * 24 * 60 * 60 * 1000)).toISOString() // 56 days later
      : undefined,
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (!userData) {
      router.push('/login');
      return;
    }

    // Only donors should access this page
    if (userData.role !== 'DONOR') {
      // Non-donors should not access this page - redirect to login
      router.push('/login');
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

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
          <div className="mb-8">
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {donorStats.totalDonations}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Droplet className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lives Saved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {donorStats.livesSaved}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Events Attended</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {donorStats.eventsAttended}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {donorStats.certificates}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
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
              <Card>
                <CardHeader>
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
              {/* Profile Card */}
              <Card>
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
              <Card>
                <CardHeader>
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

              {/* Impact Card */}
              <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                <CardContent className="pt-6">
                  <Heart className="h-10 w-10 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Your Impact</h3>
                  {donorStats.totalDonations && donorStats.totalDonations > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-100">
                        You've made {donorStats.totalDonations} donation{donorStats.totalDonations > 1 ? 's' : ''} and potentially saved {donorStats.livesSaved} lives!
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
