import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Certificate {
  id: string;
  certificateNumber: string;
  type: 'DONATION' | 'VOLUNTEER';
  userId: string;
  recipientName: string;
  eventTitle?: string;
  volunteerId?: string;
  issueDate: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Fetch certificates for a specific user
export function useCertificatesByUser(userId: string) {
  return useQuery({
    queryKey: ['certificates', 'user', userId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/certificates?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      const result = await response.json();
      return result.data as Certificate[];
    },
    enabled: !!userId,
  });
}

// Fetch all certificates
export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/certificates`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      const result = await response.json();
      return result.data as Certificate[];
    },
  });
}

// Fetch certificate by ID
export function useCertificate(id: string) {
  return useQuery({
    queryKey: ['certificates', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/certificates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificate');
      }
      return response.json() as Promise<Certificate>;
    },
    enabled: !!id,
  });
}

// Fetch certificate by certificate number
export function useCertificateByNumber(certificateNumber: string) {
  return useQuery({
    queryKey: ['certificates', 'number', certificateNumber],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/certificates/number/${certificateNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificate');
      }
      return response.json() as Promise<Certificate>;
    },
    enabled: !!certificateNumber,
  });
}

// Create certificate mutation
export function useCreateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      certificateNumber: string;
      type: 'DONATION' | 'VOLUNTEER';
      userId: string;
      recipientName: string;
      eventTitle?: string;
      volunteerId?: string;
    }) => {
      const response = await fetch(`${API_URL}/api/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create certificate');
      }

      const result = await response.json();
      return result.data as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

// Delete certificate mutation
export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/certificates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete certificate');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}
