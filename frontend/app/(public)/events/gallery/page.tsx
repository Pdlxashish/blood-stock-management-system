'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, ArrowLeft, Image as ImageIcon, FileImage } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { format } from "date-fns";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useEvents } from "@/lib/queries/events";
import { getStatusBadge } from "@/lib/eventStatusConfig";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventGalleryPage() {
  const hasMounted = useHasMounted();
  const router = useRouter();
  const { data: events = [], isLoading } = useEvents();
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; type: string } | null>(null);

  // Filter events that have banners or posters
  const eventsWithMedia = events.filter(event => event.banner || event.poster);

  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event gallery...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/events')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Gallery</h1>
              <p className="text-gray-600">Browse banners and posters from our blood donation events</p>
            </div>
          </div>

          {eventsWithMedia.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No event media available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {eventsWithMedia.map((event) => {
                const statusBadge = getStatusBadge(event.status);
                const eventDate = new Date(event.eventDate);
                const bannerUrl = event.banner ? `${process.env.NEXT_PUBLIC_API_URL}${event.banner}` : null;
                const posterUrl = event.poster ? `${process.env.NEXT_PUBLIC_API_URL}${event.poster}` : null;

                return (
                  <div key={event.id} className="space-y-4">
                    {/* Event Info Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <Link 
                          href={`/events/${event.id}`}
                          className="text-2xl font-bold text-gray-900 hover:text-red-600 transition-colors"
                        >
                          {event.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {format(eventDate, 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <Badge variant="outline" className={`${statusBadge.color}`}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          View Event Details
                        </Button>
                      </Link>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Banner */}
                      {bannerUrl && (
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                          <div 
                            className="relative"
                            onClick={() => setSelectedImage({ url: bannerUrl, title: event.title, type: 'Banner' })}
                          >
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className="bg-blue-600 text-white">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Banner
                              </Badge>
                            </div>
                            <div className="w-full h-80 overflow-hidden">
                              <img
                                src={bannerUrl}
                                alt={`${event.title} banner`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="sm">
                                  View Full Size
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Poster */}
                      {posterUrl && (
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                          <div 
                            className="relative"
                            onClick={() => setSelectedImage({ url: posterUrl, title: event.title, type: 'Poster' })}
                          >
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className="bg-purple-600 text-white">
                                <FileImage className="h-3 w-3 mr-1" />
                                Poster
                              </Badge>
                            </div>
                            <div className="w-full h-80 overflow-hidden">
                              <img
                                src={posterUrl}
                                alt={`${event.title} poster`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="sm">
                                  View Full Size
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>

                    <hr className="border-slate-200" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />

      {/* Full Size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </div>
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-white text-gray-900">
                {selectedImage.type} - {selectedImage.title}
              </Badge>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
