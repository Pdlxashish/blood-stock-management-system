'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Image as ImageIcon, Info, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PublicDashboardPage() {
  const cards = [
    {
      title: 'Image Gallery',
      description: 'Browse through our collection of blood donation events and activities',
      icon: ImageIcon,
      href: '/admin-public/gallery',
      color: 'bg-blue-500',
    },
    {
      title: 'About Us',
      description: 'Learn more about our blood donation management system and mission',
      icon: Info,
      href: '/admin-public/about',
      color: 'bg-green-500',
    },
    {
      title: 'Donor Verification',
      description: 'Verify donor information and check donation history',
      icon: UserCheck,
      href: '/admin-public/donor-verification',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-900 text-white">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Public Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Blood Donation Management System public portal
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-white mb-2`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Our Blood Donation Portal</CardTitle>
          <CardDescription>
            Making a difference, one donation at a time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our Blood Donation Management System is dedicated to saving lives by connecting donors
            with those in need. Through this public dashboard, you can explore our activities,
            learn about our mission, and verify donor information.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                To ensure a safe and adequate blood supply for all patients in need through
                efficient management and community engagement.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Get Involved</h3>
              <p className="text-sm text-muted-foreground">
                Join our community of life-savers. Every donation counts and can save up to
                three lives. Check our events and become a regular donor today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
