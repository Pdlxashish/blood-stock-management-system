'use client';

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, AlertCircle, ArrowLeft, Share2 } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { format } from "date-fns";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAuth } from "@/hooks/useAuth";
import { useEventById, useAddParticipant, useAddVolunteer } from "@/lib/queries/events";
import { getStatusBadge } from "@/lib/eventStatusConfig";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const eventId = params.id as string;
  const { user, isAuthenticated, isMounted } = useAuth();
  const [registering, setRegistering] = useState(false);

  const { data: event, isLoading, error, refetch } = useEventById(eventId);
  const addParticipant = useAddParticipant(eventId);
  const addVolunteer = useAddVolunteer(eventId);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description || 'Join this blood donation event',
        url: window.location.href,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegisterParticipant = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to register for this event");
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setRegistering(true);
      await addParticipant.mutateAsync({ userId: user.id });
      toast.success("Successfully registered as participant!");
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterVolunteer = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to register as volunteer");
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setRegistering(true);
      await addVolunteer.mutateAsync({ userId: user.id });
      toast.success("Successfully registered as volunteer!");
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Event not found</p>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'The event you are looking for does not exist'}
            </p>
            <Button onClick={() => router.push('/events')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const statusBadge = getStatusBadge(event.status);
  const eventDate = new Date(event.eventDate);
  const participantCount = event.participants?.length || 0;
  const volunteerCount = event.volunteers?.length || 0;
  const bannerUrl = event.banner 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${event.banner}` 
    : '/placeholder-event.jpg';
  const posterUrl = event.poster 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${event.poster}` 
    : null;

  // Check if current user is already registered
  const isParticipant = event.participants?.some(p => p.userId === user?.id) || false;
  const isVolunteer = event.volunteers?.some(v => v.userId === user?.id) || false;
  const isRegistered = isParticipant || isVolunteer;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/events')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          {/* Banner and Poster Images */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className={`${posterUrl ? 'lg:col-span-2' : 'lg:col-span-3'} w-full h-96 overflow-hidden rounded-lg shadow-lg group cursor-pointer`}>
              <img
                src={bannerUrl}
                alt={`${event.title} banner`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-event.jpg';
                }}
              />
            </div>
            {posterUrl && (
              <div className="lg:col-span-1 w-full h-96 overflow-hidden rounded-lg shadow-lg group cursor-pointer">
                <img
                  src={posterUrl}
                  alt={`${event.title} poster`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-event.jpg';
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline" className={statusBadge.color}>
                      {statusBadge.label}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{format(eventDate, 'MMMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{format(eventDate, 'h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-500">Participants</p>
                        <p className="font-medium">
                          {participantCount} registered
                          {event.capacity && ` / ${event.capacity}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {event.description && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h2>
                    <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {event.latitude && event.longitude && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Event Location</h2>
                    <MapView
                      latitude={event.latitude}
                      longitude={event.longitude}
                      title={event.title}
                      location={event.location}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Register for Event</h3>
                  
                  {!isMounted ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                  ) : !isAuthenticated ? (
                    <>
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700"
                          onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
                        >
                          Register as Participant
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
                        >
                          Register as Volunteer
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        You must be logged in to register
                      </p>
                    </>
                  ) : isRegistered ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 text-center">
                          ✓ You are registered for this event
                        </p>
                        {isParticipant && (
                          <p className="text-xs text-green-600 text-center mt-1">
                            Registered as Participant
                          </p>
                        )}
                        {isVolunteer && (
                          <p className="text-xs text-green-600 text-center mt-1">
                            Registered as Volunteer
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={handleRegisterParticipant}
                        disabled={registering}
                      >
                        {registering ? 'Registering...' : 'Register as Participant'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleRegisterVolunteer}
                        disabled={registering}
                      >
                        {registering ? 'Registering...' : 'Register as Volunteer'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Logged in as {user?.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <Badge variant="outline" className={`mt-1 ${statusBadge.color}`}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    {event.capacity && (
                      <div>
                        <p className="text-gray-500">Capacity</p>
                        <p className="font-medium text-gray-900">{event.capacity} people</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Registered</p>
                      <p className="font-medium text-gray-900">
                        {participantCount} participant{participantCount !== 1 ? 's' : ''}
                        {volunteerCount > 0 && `, ${volunteerCount} volunteer${volunteerCount !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
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
