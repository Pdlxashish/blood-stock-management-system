'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useCreateEvent, useEvents } from "@/lib/queries/events";
import { EventsHeader } from "./components/EventsHeader";
import { EventsFilterTabs } from "./components/EventsFilterTabs";
import { EventCardsGrid } from "./components/EventCardsGrid";
import { EventCreateDialog } from "./components/EventCreateDialog";
import type { EventFormState } from "./components/types";

export default function EventsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<EventFormState>({
    title: "",
    eventDate: "",
    location: "",
    description: "",
    status: "UPCOMING",
    capacity: undefined,
    latitude: undefined,
    longitude: undefined,
    banner: null,
    poster: null,
  });

  const { data: events = [], isLoading, error } = useEvents();
  const createEvent = useCreateEvent();

  const filteredEvents = events.filter((event) => (filterStatus === "all" ? true : event.status === filterStatus));

  const counts = {
    all: events.length,
    UPCOMING: events.filter((event) => event.status === "UPCOMING").length,
    RUNNING: events.filter((event) => event.status === "RUNNING").length,
    COMPLETED: events.filter((event) => event.status === "COMPLETED").length,
    CANCELLED: events.filter((event) => event.status === "CANCELLED").length,
  };

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.eventDate || !newEvent.location) {
      toast.error("Title, date and location are required");
      return;
    }

    // Prevent multiple submissions
    if (createEvent.isPending) {
      return;
    }

    try {
      // Create event first
      const createdEvent = await createEvent.mutateAsync({
        title: newEvent.title,
        eventDate: newEvent.eventDate,
        location: newEvent.location,
        description: newEvent.description || undefined,
        status: newEvent.status,
        capacity: newEvent.capacity,
        latitude: newEvent.latitude,
        longitude: newEvent.longitude,
      });

      const eventId = createdEvent.data?.id;
      
      if (!eventId) {
        throw new Error("Failed to get event ID from response");
      }

      // Upload banner if provided
      if (newEvent.banner) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', newEvent.banner);
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/events/${eventId}/banner`,
          bannerFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // Upload poster if provided
      if (newEvent.poster) {
        const posterFormData = new FormData();
        posterFormData.append('poster', newEvent.poster);
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/events/${eventId}/poster`,
          posterFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // Close dialog and reset form
      setDialogOpen(false);
      setNewEvent({
        title: "",
        eventDate: "",
        location: "",
        description: "",
        status: "UPCOMING",
        capacity: undefined,
        latitude: undefined,
        longitude: undefined,
        banner: null,
        poster: null,
      });
      
      toast.success("Event created successfully");
    } catch (caughtError: unknown) {
      const message = axios.isAxiosError(caughtError)
        ? caughtError.response?.data?.message || "Failed to create event"
        : "Failed to create event";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <EventsHeader onCreateClick={() => setDialogOpen(true)} />

      <EventsFilterTabs filterStatus={filterStatus} counts={counts} onFilterChange={setFilterStatus} />

      <EventCardsGrid
        filteredEvents={filteredEvents}
        isLoading={isLoading}
        error={error}
        onViewEvent={(eventId) => router.push(`/dashboard/events/${eventId}`)}
      />

      <EventCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={newEvent}
        onFormChange={setNewEvent}
        onCreate={handleCreate}
        isCreating={createEvent.isPending}
      />
    </div>
  );
}
