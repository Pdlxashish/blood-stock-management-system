'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Heart, Users, CalendarDays, ArrowRight, Shield } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { HowItWorks } from "@/components/HowItWorks";
import { ImageSlider } from "@/components/ImageSlider";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-1">
        <div className="animate-fade-in">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-red-800 to-red-900 text-white">
            <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Every Drop <span className="opacity-80">Saves a Life</span>
                </h1>
                <p className="text-lg mt-4 opacity-90 leading-relaxed">
                  Join VitalFlow — a modern blood donation management platform connecting donors with those in need. Your donation matters.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link href="/need-a-blood">
                    <Button size="lg" className="bg-white text-red-800 hover:bg-gray-100 font-semibold">
                      Need a Blood? <Droplets className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/become-donor">
                    <Button size="lg" variant="secondary" className="font-semibold">
                      Become a Donor <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button 
                      size="lg" 
                      variant="ghost" 
                      className="text-white border border-white/30 hover:bg-white/10"
                    >
                      View Events
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Blood Packs Tracked", value: "50+", icon: Droplets },
                  { label: "Registered Donors", value: "8+", icon: Users },
                  { label: "Events Organized", value: "3+", icon: CalendarDays },
                  { label: "Lives Impacted", value: "100+", icon: Heart },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <s.icon className="h-6 w-6 mx-auto text-red-800 mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <HowItWorks />

          {/* Image Slider Section */}
          <ImageSlider />

          {/* CTA Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Make a Difference?
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Join thousands of donors in our mission to ensure safe blood supply for everyone.
              </p>
              <Link href="/become-donor">
                <Button size="lg" className="bg-red-800 hover:bg-red-900">
                  Register Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
