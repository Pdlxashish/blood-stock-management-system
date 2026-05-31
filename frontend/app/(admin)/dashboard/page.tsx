'use client';

import { useMemo } from 'react';
import {
  Users, Droplet, Calendar, AlertCircle,
  TrendingUp, ArrowRight, Clock, Package, Activity,
  Target, AlertTriangle, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from 'next/link';
import { useBloodStockSummary, useBloodPacks } from "@/lib/queries/bloodStock";
import { useDonors } from "@/lib/queries/donors";
import { useEvents } from "@/lib/queries/events";
import { useDonations } from "@/lib/queries/donations";
import { ClientOnly } from '@/components/ClientOnly';

// Constants
const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LOW_STOCK_THRESHOLD = 5;
const CRITICAL_STOCK_THRESHOLD = 3;

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ ...s.tooltipValue, color: entry.color, marginTop: 4, fontSize: 13 }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  // Fetch all data using TanStack Query (without pagination to get arrays directly)
  const { data: bloodStockSummary = [], isLoading: stockLoading } = useBloodStockSummary();
  const { data: bloodPacksData, isLoading: packsLoading } = useBloodPacks();
  const { data: donorsData, isLoading: donorsLoading } = useDonors();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: donationsData, isLoading: donationsLoading } = useDonations();

  // Extract arrays from potentially paginated responses
  const bloodPacks = Array.isArray(bloodPacksData) ? bloodPacksData : bloodPacksData?.data || [];
  const donors = Array.isArray(donorsData) ? donorsData : donorsData?.data || [];
  const donations = Array.isArray(donationsData) ? donationsData : donationsData?.data || [];

  // Calculate all statistics using useMemo for performance
  const stats = useMemo(() => {
    // Blood stock data with all blood groups - including available, used, and expired
    const bloodData: { name: string; available: number; used: number; expired: number }[] = ALL_BLOOD_GROUPS.map(bloodGroup => {
      const dbFormat = bloodGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
      const stockData = bloodStockSummary.find(stock => stock.bloodGroup === dbFormat);
      
      return {
        name: bloodGroup,
        available: stockData?.available || 0,
        used: stockData?.used || 0,
        expired: stockData?.expired || 0,
      };
    });

    // Low stock alerts
    const lowStockAlerts = bloodData
      .filter(bg => bg.available < LOW_STOCK_THRESHOLD)
      .map(bg => ({
        bloodGroup: bg.name,
        units: bg.available,
        isCritical: bg.available < CRITICAL_STOCK_THRESHOLD
      }));

    // Expiring packs (within 7 days)
    const now = new Date();
    const expiringPacks = bloodPacks
      .filter((pack: any) => {
        if (pack.status !== 'AVAILABLE') return false;
        const expiry = new Date(pack.expiryDate);
        const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 7 && daysUntil > 0;
      })
      .slice(0, 5);

    // Recent donors (last 5)
    const recentDonors = donors
      .sort((a: any, b: any) => new Date(b.user?.createdAt || 0).getTime() - new Date(a.user?.createdAt || 0).getTime())
      .slice(0, 5);

    // Recent events (upcoming events)
    const recentEvents = events
      .filter(event => event.status === 'UPCOMING')
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 3);

    // Calculate statistics
    const totalBloodUnits = bloodData.reduce((sum, bg) => sum + bg.available, 0);
    const activeDonors = donors.filter((donor: any) => donor.totalDonations > 0).length;
    const upcomingEvents = events.filter(event => event.status === 'UPCOMING').length;
    const criticalStock = lowStockAlerts.filter(alert => alert.isCritical).length;

    return {
      bloodData,
      lowStockAlerts,
      expiringPacks,
      recentDonors,
      recentEvents,
      totalDonors: donors.length,
      activeDonors,
      totalBloodUnits,
      lowStockUnits: lowStockAlerts.length,
      criticalStock,
      upcomingEvents,
      totalDonations: donations.length,
      expiringSoon: expiringPacks.length,
    };
  }, [bloodStockSummary, bloodPacks, donors, events, donations]);

  // Loading state
  const isLoading = stockLoading || packsLoading || donorsLoading || eventsLoading || donationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-11 h-11 text-[#7F1D1D] animate-spin" />
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-gray-50">
      {/* Clean Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Blood bank management overview</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-medium text-green-700">Live</span>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <ClientOnly fallback="Loading...">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-6">

      {/* ── Low Stock Alert Card ── */}
      {stats.lowStockAlerts.length > 0 && (
        <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-sm">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Low Stock Alert</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.lowStockAlerts.length} blood group{stats.lowStockAlerts.length !== 1 ? 's' : ''} require immediate attention
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {stats.lowStockAlerts.slice(0, 4).map((alert, i) => {
                  const isCritical = alert.units < CRITICAL_STOCK_THRESHOLD;
                  return (
                    <div
                      key={i}
                      className={`px-4 py-3 rounded-lg border ${
                        isCritical 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="text-center">
                        <p className={`text-lg font-bold ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>
                          {alert.bloodGroup}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {alert.units} units
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Blood Units</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalBloodUnits}</div>
            <p className="text-xs text-gray-500 mt-1">Available in stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Stock</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.criticalStock}</div>
            <p className="text-xs text-gray-500 mt-1">Below {CRITICAL_STOCK_THRESHOLD} units</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expiring Soon</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</div>
            <p className="text-xs text-gray-500 mt-1">Within 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Donors</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.activeDonors}</div>
            <p className="text-xs text-gray-500 mt-1">of {stats.totalDonors} total</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Expiring Packs Alert ── */}
      {stats.expiringPacks.length > 0 && (
        <div className="bg-white border-l-4 border-orange-500 rounded-lg shadow-sm">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Expiring Soon</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.expiringPacks.length} blood pack{stats.expiringPacks.length !== 1 ? 's' : ''} expiring within 7 days
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {stats.expiringPacks.map((pack: any, i: number) => {
                const expiry = new Date(pack.expiryDate);
                const daysUntil = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{pack.packCode}</p>
                      <p className="text-xs text-orange-700 font-medium mt-0.5">{pack.bloodGroup}</p>
                    </div>
                    <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      {daysUntil}d
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/blood-donate/blood-collection">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Collect Blood</p>
              <p className="text-xs text-gray-500 mt-1">Register new donation</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/blood-donate/donate-form">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Issue Blood</p>
              <p className="text-xs text-gray-500 mt-1">Distribute to recipient</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/donors">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Manage Donors</p>
              <p className="text-xs text-gray-500 mt-1">View donor database</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reports">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">View Reports</p>
              <p className="text-xs text-gray-500 mt-1">Analytics & insights</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Charts Row ── */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Blood Group Stock Analysis</CardTitle>
                <CardDescription className="text-sm text-gray-600">Real-time inventory across all blood types</CardDescription>
              </div>
            </div>
            <Link href="/dashboard/reports" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              View Reports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.bloodData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(243,244,246,0.5)' }} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
              <Bar dataKey="available" fill="#16a34a" radius={[4, 4, 0, 0]} name="Available" />
              <Bar dataKey="used" fill="#6b7280" radius={[4, 4, 0, 0]} name="Used" />
              <Bar dataKey="expired" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expired" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* All Blood Group Names */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">All Blood Groups Overview</p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Safe Stock</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600">Low Stock</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Critical</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {ALL_BLOOD_GROUPS.map((bloodGroup) => {
                const groupData = stats.bloodData.find(bg => bg.name === bloodGroup);
                const available = groupData?.available || 0;
                const isLowStock = available < LOW_STOCK_THRESHOLD;
                const isCritical = available < CRITICAL_STOCK_THRESHOLD;
                
                return (
                  <div
                    key={bloodGroup}
                    className={`text-center p-4 rounded-lg border transition-all hover:shadow-md ${
                      isCritical 
                        ? 'bg-red-50 border-red-200' 
                        : isLowStock 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <p className={`text-lg font-bold mb-2 ${
                      isCritical 
                        ? 'text-red-700' 
                        : isLowStock 
                        ? 'text-orange-700' 
                        : 'text-green-700'
                    }`}>
                      {bloodGroup}
                    </p>
                    <p className={`text-2xl font-bold mb-1 ${
                      isCritical 
                        ? 'text-red-600' 
                        : isLowStock 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {available}
                    </p>
                    <p className="text-xs text-gray-600">units</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donors */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Recent Donors</CardTitle>
                <CardDescription className="text-sm text-gray-600">Latest registered donors</CardDescription>
              </div>
            </div>
            <Link href="/dashboard/donors" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {stats.recentDonors.map((donor: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="w-10 h-10 bg-blue-100 border border-blue-200">
                    <AvatarFallback className="text-sm font-semibold text-blue-700 bg-transparent">
                      {donor.user?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{donor.user?.name || 'Unknown Donor'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {donor.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '')} · {donor.location}
                    </p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {donor.totalDonations}× donated
                  </Badge>
                </div>
              ))}
              {stats.recentDonors.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No donors registered yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Upcoming Events</CardTitle>
                <CardDescription className="text-sm text-gray-600">Scheduled blood drives</CardDescription>
              </div>
            </div>
            <Link href="/dashboard/events" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {stats.recentEvents.map((event, i) => {
                const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                
                return (
                  <Link key={i} href="/dashboard/events">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-700">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{event.location} • {eventDate}</p>
                      </div>
                      <Badge 
                        className={`text-xs font-medium ${
                          event.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          event.status === 'RUNNING' ? 'bg-green-50 text-green-700 border-green-200' :
                          event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
              {stats.recentEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  </div>
  );
}

// ── Minimal Styles (only for tooltip) ─────────────────────────────────────────
const s = {
  tooltip: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  tooltipLabel: { fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 },
  tooltipValue: { fontSize: 14, fontWeight: 800, color: '#16a34a', margin: '2px 0 0' },
};