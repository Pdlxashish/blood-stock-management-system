import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Query Keys
export const donorKeys = {
  all: ['donors'] as const,
  lists: () => [...donorKeys.all, 'list'] as const,
  list: (filters?: any) => [...donorKeys.lists(), filters] as const,
  details: () => [...donorKeys.all, 'detail'] as const,
  detail: (id: string) => [...donorKeys.details(), id] as const,
};

// Types
export interface Donor {
  id: string;
  userId: string;
  bloodGroup: string;
  donorType?: 'PERSON' | 'ORGANIZATION'; // Add donorType field
  location: string;
  city?: string;
  address?: string;
  dateOfBirth?: string;
  weight?: number;
  latitude?: number;
  longitude?: number;
  lastDonationDate?: string;
  totalDonations: number;
  isEligible: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    createdAt?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateDonorData {
  userId: string;
  bloodGroup: string;
  dateOfBirth: string;
  weight: number;
  location: string;
  city?: string;
  address?: string;
}

// Fetch all donors with pagination
export function useDonors(filters?: any, page?: number, limit?: number) {
  const shouldPaginate = page !== undefined || limit !== undefined;
  const actualPage = page || 1;
  const actualLimit = limit || 20;

  return useQuery({
    queryKey: donorKeys.list({ ...filters, ...(shouldPaginate && { page: actualPage, limit: actualLimit }) }),
    queryFn: async () => {
      // Fetch all donors (don't filter by verification status here - let the frontend tabs handle it)
      const params = shouldPaginate 
        ? { ...filters, page: actualPage, limit: actualLimit }
        : { ...filters };
      
      const response = await axiosInstance.get<{ status: string; data: Donor[]; pagination?: any }>(
        API_PATHS.DONOR.GET_ALL,
        { params }
      );
      
      // If pagination is requested, return the full response
      if (shouldPaginate && response.data.pagination) {
        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      }
      
      // Otherwise, return just the data for backward compatibility
      return response.data.data;
    },
  });
}

// Fetch single donor
export function useDonor(id: string) {
  return useQuery({
    queryKey: donorKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Donor }>(
        API_PATHS.DONOR.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Fetch donor by user ID
export function useDonorByUserId(userId: string) {
  return useQuery({
    queryKey: [...donorKeys.all, 'user', userId],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Donor[] }>(
        API_PATHS.DONOR.GET_ALL,
        { params: { userId } }
      );
      // Return the first donor (should be only one per user)
      const donors = response.data.data;
      return Array.isArray(donors) ? donors[0] || null : null;
    },
    enabled: !!userId,
  });
}

// Fetch 90-day donation eligibility for a user
export interface DonorEligibility {
  isEligible: boolean;
  lastDonationDate: string | null;
  nextEligibleDate: string | null;
  daysRemaining: number;
}

export function useDonorEligibility(userId: string) {
  return useQuery({
    queryKey: [...donorKeys.all, 'eligibility', userId],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: DonorEligibility }>(
        API_PATHS.DONOR.GET_ELIGIBILITY(userId)
      );
      return response.data.data;
    },
    enabled: !!userId,
    // Refresh every 5 minutes so the countdown stays reasonably fresh
    staleTime: 5 * 60 * 1000,
  });
}

// Create donor
export function useCreateDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDonorData) => {
      const response = await axiosInstance.post<{ success: boolean; data: Donor }>(
        API_PATHS.DONOR.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });
}

// Update donor
export function useUpdateDonor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateDonorData>) => {
      const response = await axiosInstance.put<{ success: boolean; data: Donor }>(
        API_PATHS.DONOR.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donorKeys.detail(id) });
    },
  });
}

// Delete donor
export function useDeleteDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        API_PATHS.DONOR.DELETE(id)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });
}
