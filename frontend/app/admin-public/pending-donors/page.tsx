'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axiosInstance';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PendingDonor {
  id: string;
  userId: string;
  bloodGroup: string;
  donorType: string;
  location: string;
  city: string | null;
  address: string | null;
  dateOfBirth: string | null;
  weight: number | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
}

interface VerificationStats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

export default function PendingDonorsPage() {
  const [donors, setDonors] = useState<PendingDonor[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<PendingDonor | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingDonors();
    fetchStats();
  }, []);

  const fetchPendingDonors = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/api/donors/pending');
      if (response.data.status === 'success') {
        setDonors(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching pending donors:', error);
      toast.error('Failed to load pending donors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/donors/verification-stats');
      if (response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedDonor) return;

    setIsProcessing(true);
    try {
      const response = await axiosInstance.patch(`/api/donors/${selectedDonor.id}/approve`, {
        verifiedBy: 'public-dashboard-admin', // You can get this from auth context
      });

      if (response.data.status === 'success') {
        toast.success('Donor approved successfully!');
        setShowApproveDialog(false);
        setSelectedDonor(null);
        fetchPendingDonors();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error approving donor:', error);
      toast.error(error.response?.data?.message || 'Failed to approve donor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDonor || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axiosInstance.patch(`/api/donors/${selectedDonor.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        verifiedBy: 'public-dashboard-admin',
      });

      if (response.data.status === 'success') {
        toast.success('Donor rejected');
        setShowRejectDialog(false);
        setSelectedDonor(null);
        setRejectionReason('');
        fetchPendingDonors();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error rejecting donor:', error);
      toast.error(error.response?.data?.message || 'Failed to reject donor');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBloodGroup = (bloodGroup: string) => {
    return bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredDonors = donors.filter((donor) => {
    const query = searchQuery.toLowerCase();
    return (
      donor.user.name.toLowerCase().includes(query) ||
      donor.user.email.toLowerCase().includes(query) ||
      donor.user.phone.includes(query) ||
      donor.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-500 text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Donor Verification</h1>
            <p className="text-muted-foreground">
              Review and verify new donor registrations
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-3xl font-bold">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold">{stats.verified}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-3xl font-bold">{stats.rejected}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                <span className="text-3xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or donor ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Donors List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : filteredDonors.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-semibold text-muted-foreground">
                {searchQuery ? 'No donors found' : 'No pending verifications'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'All donor registrations have been processed'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{donor.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Registered on {formatDate(donor.createdAt)}
                        </p>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        PENDING
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Droplet className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Blood Group:</span>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {formatBloodGroup(donor.bloodGroup)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span className="text-muted-foreground">{donor.user.email}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">{donor.user.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span className="text-muted-foreground">
                          {donor.city || donor.location}
                        </span>
                      </div>

                      {donor.weight && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Weight:</span>
                          <span className="text-muted-foreground">{donor.weight} kg</span>
                        </div>
                      )}

                      {donor.dateOfBirth && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">DOB:</span>
                          <span className="text-muted-foreground">
                            {formatDate(donor.dateOfBirth)}
                          </span>
                        </div>
                      )}
                    </div>

                    {donor.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Address:</span>
                          <p className="text-muted-foreground">{donor.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          setSelectedDonor(donor);
                          setShowApproveDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedDonor(donor);
                          setShowRejectDialog(true);
                        }}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Donor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this donor? They will be able to access the admin
              dashboard and donate blood.
            </DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-2 py-4">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {selectedDonor.user.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {selectedDonor.user.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Blood Group:</span>{' '}
                {formatBloodGroup(selectedDonor.bloodGroup)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Donor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Donor</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this donor registration.
            </DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {selectedDonor.user.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {selectedDonor.user.email}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Donor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
