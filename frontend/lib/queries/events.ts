import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: any) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  participants: (id: string) => [...eventKeys.detail(id), 'participants'] as const,
  volunteers: (id: string) => [...eventKeys.detail(id), 'volunteers'] as const,
};

// Types
export type EventStatus = 'UPCOMING' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  status: EventStatus;
  capacity?: number;
  banner?: string;
  poster?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  participants: EventParticipant[];
  volunteers: EventVolunteer[];
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface EventVolunteer {
  id: string;
  eventId: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: string | null;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
}

interface CreateEventData {
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  status?: EventStatus;
  capacity?: number;
  latitude?: number;
  longitude?: number;
}

interface AddVolunteerData {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface AddParticipantData {
  userId: string;
}

// Fetch all events
export function useEvents(filters?: any) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Event[] }>(
        API_PATHS.EVENT.GET_ALL,
        { params: filters }
      );
      return response.data.data;
    },
  });
}

// Fetch single event
export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Event }>(
        API_PATHS.EVENT.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Alias for useEvent
export const useEventById = useEvent;

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventData) => {
      const response = await axiosInstance.post<{ status: string; data: Event }>(
        API_PATHS.EVENT.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// Update event
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateEventData>) => {
      const response = await axiosInstance.put<{ status: string; data: Event }>(
        API_PATHS.EVENT.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
    },
  });
}

// Delete event
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(API_PATHS.EVENT.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// Add volunteer to event
export function useAddVolunteer(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddVolunteerData) => {
      const response = await axiosInstance.post(
        `/api/events/${eventId}/volunteers`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.volunteers(eventId) });
    },
  });
}

// Remove volunteer from event
export function useRemoveVolunteer(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (volunteerId: string) => {
      const response = await axiosInstance.delete(
        `/api/events/${eventId}/volunteers/${volunteerId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.volunteers(eventId) });
    },
  });
}

// Add participant to event
export function useAddParticipant(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddParticipantData) => {
      const response = await axiosInstance.post(
        `/api/events/${eventId}/participants`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
    },
  });
}

// Remove participant from event
export function useRemoveParticipant(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: string) => {
      const response = await axiosInstance.delete(
        `/api/events/${eventId}/participants/${participantId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
    },
  });
}
