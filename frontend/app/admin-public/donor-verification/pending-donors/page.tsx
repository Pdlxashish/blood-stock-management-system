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
  RefreshCw,
  Users,
  X,
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
  rejectionReason?: string | null;
  reverificationRequested?: boolean;
  reverificationMessage?: string | null;
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
  const [showUnverifyDialog, setShowUnverifyDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [unverificationReason, setUnverificationReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchDonorsByStatus(activeTab);
    fetchStats();
  }, [activeTab]);

  const fetchDonorsByStatus = async (status: string) => {
    setIsLoading(true);
    try {
      let endpoint = '/api/donors';
      const params: any = {
        limit: '100', // Fetch more donors to display
      };
      
      if (status === 'pending') {
        params.verificationStatus = 'PENDING';
      } else if (status === 'verified') {
        params.verificationStatus = 'VERIFIED';
      } else if (status === 'rejected') {
        params.verificationStatus = 'REJECTED';
      }
      // 'all' means no filter - will show all donors
      
      const response = await axiosInstance.get(endpoint, { params });
      if (response.data.status === 'success') {
        // Data is already sorted by createdAt DESC (LIFO) from backend
        setDonors(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching donors:', error);
      toast.error('Failed to load donors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingDonors = async () => {
    fetchDonorsByStatus('pending');
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
        fetchDonorsByStatus(activeTab);
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
        fetchDonorsByStatus(activeTab);
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error rejecting donor:', error);
      toast.error(error.response?.data?.message || 'Failed to reject donor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnverify = async () => {
    if (!selectedDonor || !unverificationReason.trim()) {
      toast.error('Please provide an unverification reason');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axiosInstance.patch(`/api/donors/${selectedDonor.id}/unverify`, {
        unverificationReason: unverificationReason.trim(),
        verifiedBy: 'public-dashboard-admin',
      });

      if (response.data.status === 'success') {
        toast.success('Donor unverified successfully');
        setShowUnverifyDialog(false);
        setSelectedDonor(null);
        setUnverificationReason('');
        fetchDonorsByStatus(activeTab);
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error unverifying donor:', error);
      toast.error(error.response?.data?.message || 'Failed to unverify donor');
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

  // Filter donors based on search query (optional filtering)
  const filteredDonors = searchQuery.trim() 
    ? donors.filter((donor) => {
        const query = searchQuery.toLowerCase();
        return (
          donor.user.name.toLowerCase().includes(query) ||
          donor.user.email.toLowerCase().includes(query) ||
          donor.user.phone.includes(query) ||
          donor.id.toLowerCase().includes(query)
        );
      })
    : donors; // Show all donors if no search query

  // Donors List Component
  const DonorsList = ({ 
    donors, 
    isLoading, 
    searchQuery, 
    activeTab,
    onApprove,
    onReject,
    setSelectedDonor,
    setShowUnverifyDialog
  }: {
    donors: PendingDonor[];
    isLoading: boolean;
    searchQuery: string;
    activeTab: string;
    onApprove: (donor: PendingDonor) => void;
    onReject: (donor: PendingDonor) => void;
    setSelectedDonor: (donor: PendingDonor) => void;
    setShowUnverifyDialog: (show: boolean) => void;
  }) => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (donors.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-semibold text-muted-foreground">
                {searchQuery ? 'No donors found matching your search' : `No ${activeTab} donors yet`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : activeTab === 'all' 
                    ? 'No donor registrations in the system yet'
                    : `There are currently no ${activeTab} donor registrations`}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="w-full space-y-3">
        {donors.map((donor) => (
          <Card key={donor.id} className="w-full hover:shadow-lg transition-all duration-200 border-l-4"
            style={{
              borderLeftColor: 
                donor.verificationStatus === 'PENDING' ? '#f97316' :
                donor.verificationStatus === 'VERIFIED' ? '#22c55e' : '#ef4444'
            }}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold truncate">{donor.user.name}</h3>
                      <Badge variant="outline" className="text-red-600 border-red-600 shrink-0">
                        {formatBloodGroup(donor.bloodGroup)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ID: {donor.id} • Registered: {formatDate(donor.createdAt)}
                    </p>
                  </div>
                  <Badge 
                    className={
                      donor.verificationStatus === 'PENDING' 
                        ? 'bg-orange-500 text-white shrink-0' 
                        : donor.verificationStatus === 'VERIFIED'
                        ? 'bg-green-500 text-white shrink-0'
                        : 'bg-red-500 text-white shrink-0'
                    }
                  >
                    {donor.verificationStatus === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                    {donor.verificationStatus === 'VERIFIED' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {donor.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                    {donor.verificationStatus}
                  </Badge>
                </div>

                {/* Re-verification Request Badge */}
                {donor.verificationStatus === 'REJECTED' && donor.reverificationRequested && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2.5">
                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-900">Re-verification Requested</p>
                        {donor.reverificationMessage && (
                          <p className="text-xs text-blue-700 mt-1 line-clamp-2">{donor.reverificationMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {donor.verificationStatus === 'REJECTED' && donor.rejectionReason && !donor.reverificationRequested && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-900">Rejection Reason</p>
                        <p className="text-xs text-red-700 mt-1">{donor.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact & Location Info - Compact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-muted/30 rounded-md p-2.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{donor.user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{donor.user.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{donor.city || donor.location}</span>
                  </div>
                  {donor.weight && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Weight:</span>
                      <span>{donor.weight} kg</span>
                    </div>
                  )}
                  {donor.dateOfBirth && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{formatDate(donor.dateOfBirth)}</span>
                    </div>
                  )}
                </div>

                {donor.address && (
                  <div className="flex items-start gap-1.5 text-xs bg-muted/20 rounded-md p-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">Address: </span>
                      <span className="text-muted-foreground">{donor.address}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {(donor.verificationStatus === 'PENDING' || donor.reverificationRequested) && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => onApprove(donor)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      {donor.reverificationRequested ? 'Approve Re-verification' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => onReject(donor)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {/* Re-verify Button for Rejected Donors */}
                {donor.verificationStatus === 'REJECTED' && !donor.reverificationRequested && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => onApprove(donor)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Re-verify Donor
                    </Button>
                  </div>
                )}
                
                {/* Unverify Button for Verified Donors */}
                {donor.verificationStatus === 'VERIFIED' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => {
                        setSelectedDonor(donor);
                        setShowUnverifyDialog(true);
                      }}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Unverify Donor
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Search Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-500 text-white">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Donor Verification Management</h1>
            <p className="text-muted-foreground">
              Review and manage donor registrations
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowSearch(!showSearch)}
          className="gap-2"
        >
          {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          {showSearch ? 'Close Search' : 'Search'}
        </Button>
      </div>

      {/* Search Bar (Collapsible) */}
      {showSearch && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredDonors.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{donors.length}</span> donors
                  {searchQuery && ' (filtered)'}
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="h-8"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, phone, or donor ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === 'pending' ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === 'verified' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setActiveTab('verified')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.verified}</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Tab Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <span className="text-sm font-medium">Viewing:</span>
        <Badge variant="outline" className="text-sm">
          {activeTab === 'pending' && <><Clock className="w-3 h-3 mr-1" /> Pending Donors</>}
          {activeTab === 'verified' && <><CheckCircle className="w-3 h-3 mr-1" /> Verified Donors</>}
          {activeTab === 'rejected' && <><XCircle className="w-3 h-3 mr-1" /> Rejected Donors</>}
          {activeTab === 'all' && <><Users className="w-3 h-3 mr-1" /> All Donors</>}
        </Badge>
        <span className="text-sm text-muted-foreground ml-auto">
          {filteredDonors.length} {filteredDonors.length === 1 ? 'donor' : 'donors'}
        </span>
      </div>

      {/* Donor List */}
      <DonorsList 
        donors={filteredDonors} 
        isLoading={isLoading}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onApprove={(donor) => {
          setSelectedDonor(donor);
          setShowApproveDialog(true);
        }}
        onReject={(donor) => {
          setSelectedDonor(donor);
          setShowRejectDialog(true);
        }}
        setSelectedDonor={setSelectedDonor}
        setShowUnverifyDialog={setShowUnverifyDialog}
      />

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

      {/* Unverify Dialog */}
      <Dialog open={showUnverifyDialog} onOpenChange={setShowUnverifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unverify Donor</DialogTitle>
            <DialogDescription>
              This will change the donor's status from verified to unverified. Please provide a reason.
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
                <p className="text-sm">
                  <span className="font-medium">Current Status:</span>{' '}
                  <Badge className="bg-green-500">VERIFIED</Badge>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unverification-reason">Unverification Reason *</Label>
                <Textarea
                  id="unverification-reason"
                  value={unverificationReason}
                  onChange={(e) => setUnverificationReason(e.target.value)}
                  placeholder="Enter the reason for unverifying this donor..."
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
                setShowUnverifyDialog(false);
                setUnverificationReason('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnverify}
              disabled={isProcessing || !unverificationReason.trim()}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unverifying...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Unverify Donor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
