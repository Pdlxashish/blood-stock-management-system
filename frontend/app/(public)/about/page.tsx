'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Users, Award, Loader2 } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import axiosInstance from '@/lib/axiosInstance';

interface AboutContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionContent: string;
  visionTitle: string;
  visionContent: string;
  values: string;
  storyTitle: string;
  storyContent: string;
  stats: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactEmergency: string;
  whatWeDo: string;
}

interface ValueItem {
  title: string;
  description: string;
  icon: string;
}

interface StatItem {
  label: string;
  value: string;
}

interface WhatWeDoItem {
  title: string;
  description: string;
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axiosInstance.get('/api/about');
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconMap: any = {
    Heart,
    Target,
    Users,
    Award,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load content</p>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const values: ValueItem[] = JSON.parse(content.values);
  const stats: StatItem[] = JSON.parse(content.stats);
  const whatWeDo: WhatWeDoItem[] = JSON.parse(content.whatWeDo);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.heroTitle}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {content.heroSubtitle}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{content.missionTitle}</h2>
                <p className="text-gray-600">
                  {content.missionContent}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{content.visionTitle}</h2>
                <p className="text-gray-600">
                  {content.visionContent}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const IconComponent = iconMap[value.icon] || Heart;
                return (
                  <Card key={index} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Story */}
          <Card className="border border-gray-200 shadow-sm mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.storyTitle}</h2>
              <div className="space-y-4 text-gray-600 whitespace-pre-wrap">
                {content.storyContent}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="bg-red-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What We Do */}
          <Card className="border border-gray-200 shadow-sm mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
              <div className="space-y-6">
                {whatWeDo.map((item, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">{content.contactAddress}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">{content.contactPhone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">{content.contactEmail}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Emergency Hotline</h3>
                  <p className="text-red-600 font-semibold">{content.contactEmergency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
