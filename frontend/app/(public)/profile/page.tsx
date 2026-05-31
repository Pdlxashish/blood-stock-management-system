'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getUser, isAuthenticated, setAuth } from '@/lib/auth';
import type { User } from '@/lib/auth';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  Clock,
  AlertCircle,
  Camera,
  Save,
  X as CloseIcon,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface DonorProfile {
  id: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (userData) {
      setUser(userData);
      setEditForm({
        name: userData.name,
        phone: userData.phone || '',
      });
      
      if (userData.role === 'DONOR') {
        fetchDonorProfile(userData.id);
      }
    }
    setLoading(false);
  }, [router]);

  const fetchDonorProfile = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/api/donors?userId=${userId}`);
      if (response.data.status === 'success' && response.data.data.length > 0) {
        setDonorProfile(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching donor profile:', error);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/profile/picture`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user!, ...data.data };
        setUser(updatedUser);
        setAuth(token!, updatedUser);
        toast.success('Profile picture updated successfully!');
        
        // Force page reload to update all components
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(data.message || 'Failed to upload profile picture');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axiosInstance.put('/api/auth/profile', {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
      });

      if (response.data.success) {
        const updatedUser = { ...user!, ...response.data.data };
        setUser(updatedUser);
        const token = localStorage.getItem('token');
        setAuth(token!, updatedUser);
        setEditDialogOpen(false);
        toast.success('Profile updated successfully!');
        
        // Force page reload to update all components
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-red-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const backUrl = user.role === 'DONOR' ? '/home' : '/dashboard';
  const profileImageUrl = user.profilePicture 
    ? `${API_URL}${user.profilePicture}` 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      <PublicNav />
      
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href={backUrl}>
            <Button variant="ghost" className="gap-2 mb-6 hover:bg-white">
              <ArrowLeft className="h-4 w-4" />
              Back to {user.role === 'DONOR' ? 'Home' : 'Dashboard'}
            </Button>
          </Link>

          {/* Profile Header Card */}
          <Card className="border-0 shadow-2xl mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-red-600 to-red-800"></div>
            <CardContent className="relative pt-0 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-red-600 to-red-800">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-5xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleProfilePictureClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all border-2 border-gray-200 group-hover:scale-110"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-red-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-red-600 text-white">
                      {user.role}
                    </Badge>
                    {user.isVerified ? (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  onClick={() => setEditDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700 gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <UserIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-lg text-gray-900 font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-lg text-gray-900 font-medium break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-lg text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-lg text-gray-900 font-medium">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  {user.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : donorProfile?.verificationStatus === 'PENDING' ? (
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  ) : donorProfile?.verificationStatus === 'REJECTED' ? (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Verification Status</p>
                    {user.isVerified ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {donorProfile?.verifiedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(donorProfile.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : donorProfile?.verificationStatus === 'PENDING' ? (
                      <div className="mt-1">
                        <Badge className="bg-yellow-600 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                        <p className="text-sm text-gray-600 mt-2">
                          Your profile is being reviewed by our team
                        </p>
                      </div>
                    ) : donorProfile?.verificationStatus === 'REJECTED' ? (
                      <div className="mt-1">
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                        {donorProfile.rejectionReason && (
                          <p className="text-sm text-red-700 mt-2">
                            {donorProfile.rejectionReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-sm text-gray-900 font-mono mt-1 break-all">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {user.role === 'DONOR' && !donorProfile && (
            <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Complete Your Donor Profile</h3>
                    <p className="text-sm text-gray-600">
                      Fill out your medical information to become a verified donor
                    </p>
                  </div>
                  <Link href="/donor-form">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Complete Donor Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <PublicFooter />

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-red-600" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your full name"
                required
                minLength={2}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter your phone number"
                required
                minLength={10}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                <CloseIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
