// Auth utility functions for managing user authentication

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isAdminFlag = localStorage.getItem('isAdmin') === 'true';
  const user = getUser();
  return isAdminFlag || user?.role === 'ADMIN';
};

export const logout = (): void => {
  clearAuth();
  localStorage.removeItem('isAdmin');
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/admin';
  }
};
