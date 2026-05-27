'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { format } from "date-fns";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useEvents } from "@/lib/queries/events";
import { getStatusBadge } from "@/lib/eventStatusConfig";

export default function PublicEventsPage() {
  const hasMounted = useHasMounted();
  const { data: events = [], isLoading, error } = useEvents();

  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center ">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Failed to load events</p>
            <p className="text-gray-600">{error instanceof Error ? error.message : 'An error occurred'}</p>
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
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Blood Donation Events</h1>
            <p className="text-gray-600 mt-2">Join a blood donation drive near you</p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No events available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const statusBadge = getStatusBadge(event.status);
                const eventDate = new Date(event.eventDate);
                const participantCount = event.participants?.length || 0;
                const bannerUrl = event.banner ? `${process.env.NEXT_PUBLIC_API_URL}${event.banner}` : null;

                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="block">
                    <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
                      {bannerUrl && (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg">
                          <img 
                            src={bannerUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <Badge variant="outline" className={`text-[10px] mb-3 ${statusBadge.color}`}>
                          {statusBadge.label}
                        </Badge>
                        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg">{event.title}</h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                            {format(eventDate, 'MMMM d, yyyy')}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                            {format(eventDate, 'h:mm a')}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 flex-shrink-0" />
                            {participantCount} registered
                            {event.capacity && ` / ${event.capacity} capacity`}
                          </p>
                        </div>

                        {event.description && (
                          <p className="text-xs text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        )}

                        <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
