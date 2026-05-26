'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck, Search, Calendar, Droplet, Phone, Mail, MapPin, Award, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axiosInstance';
import { getUser } from '@/lib/auth';

interface DonorInfo {
  id: string;
  userId: string;
  bloodGroup: string;
  donorType: string;
  location: string;
  city: string | null;
  address: string | null;
  dateOfBirth: string | null;
  weight: number | null;
  latitude: number | null;
  longitude: number | null;
  lastDonationDate: string | null;
  totalDonations: number;
  isEligible: boolean;
  medicalNotes: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  donorTypeCategory: 'REGULAR' | 'FIRST_TIME' | 'OCCASIONAL';
  daysSinceLastDonation: number | null;
  livesSaved: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isVerified: boolean;
  };
}

export default function DonorVerificationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a donor ID, email, or phone number');
      return;
    }

    setIsSearching(true);
    setError(null);
    setDonorInfo(null);

    try {
      const response = await axiosInstance.get(`/api/donors/verify?query=${encodeURIComponent(searchQuery.trim())}`);
      
      if (response.data.status === 'success') {
        setDonorInfo(response.data.data);
        toast.success('Donor found!');
      }
    } catch (err: any) {
      console.error('Error verifying donor:', err);
      const errorMessage = err.response?.data?.message || 'Donor not found. Please check the information and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApproveDonor = async () => {
    if (!donorInfo) return;

    setIsApproving(true);
    try {
      const currentUser = getUser();
      const response = await axiosInstance.patch(`/api/donors/${donorInfo.id}/approve`, {
        verifiedBy: currentUser?.id,
      });

      if (response.data.status === 'success') {
        toast.success('Donor verified successfully!');
        // Refresh donor info
        setDonorInfo({
          ...donorInfo,
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date().toISOString(),
          user: {
            ...donorInfo.user,
            isVerified: true,
          },
        });
      }
    } catch (err: any) {
      console.error('Error approving donor:', err);
      const errorMessage = err.response?.data?.message || 'Failed to verify donor. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectDonor = async () => {
    if (!donorInfo || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsRejecting(true);
    try {
      const currentUser = getUser();
      const response = await axiosInstance.patch(`/api/donors/${donorInfo.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        verifiedBy: currentUser?.id,
      });

      if (response.data.status === 'success') {
        toast.success('Donor verification rejected');
        // Refresh donor info
        setDonorInfo({
          ...donorInfo,
          verificationStatus: 'REJECTED',
          verifiedAt: new Date().toISOString(),
          rejectionReason: rejectionReason.trim(),
        });
        setShowRejectDialog(false);
        setRejectionReason('');
      }
    } catch (err: any) {
      console.error('Error rejecting donor:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reject donor. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-600';
      case 'PENDING':
        return 'bg-yellow-600';
      case 'REJECTED':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500';
  };

  const getDonorTypeColor = (type: string) => {
    switch (type) {
      case 'REGULAR':
        return 'bg-blue-500';
      case 'FIRST_TIME':
        return 'bg-purple-500';
      case 'OCCASIONAL':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatBloodGroup = (bloodGroup: string) => {
    // Convert A_POSITIVE to A+, etc.
    return bloodGroup
      .replace('_POSITIVE', '+')
      .replace('_NEGATIVE', '-');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500 text-white">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donor Verification</h1>
          <p className="text-muted-foreground">
            Verify donor information and check donation history
          </p>
        </div>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search Donor</CardTitle>
          <CardDescription>
            Enter donor ID, email address, or phone number to verify donor information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Enter donor ID, email, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && !donorInfo && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-red-900">Donor Not Found</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donor Information */}
      {donorInfo && (
        <div className="space-y-4">
          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${getStatusColor(donorInfo.status)} text-white`}>
              {donorInfo.status}
            </Badge>
            <Badge className={`${getDonorTypeColor(donorInfo.donorTypeCategory)} text-white`}>
              {donorInfo.donorTypeCategory.replace('_', ' ')}
            </Badge>
            <Badge className={`${getVerificationStatusColor(donorInfo.verificationStatus)} text-white`}>
              {donorInfo.verificationStatus}
            </Badge>
            {!donorInfo.isEligible && (
              <Badge variant="destructive">
                NOT ELIGIBLE
              </Badge>
            )}
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Donor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Donor ID:</span>
                    <span className="text-muted-foreground font-mono">{donorInfo.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span className="text-muted-foreground">{donorInfo.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{donorInfo.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span className="text-muted-foreground">{donorInfo.user.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Blood Group:</span>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      {formatBloodGroup(donorInfo.bloodGroup)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span className="text-muted-foreground">
                      {donorInfo.city || donorInfo.location}
                    </span>
                  </div>
                  {donorInfo.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-muted-foreground">{donorInfo.address}</p>
                      </div>
                    </div>
                  )}
                  {donorInfo.weight && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Weight:</span>
                      <span className="text-muted-foreground">{donorInfo.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donation Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-3xl font-bold">{donorInfo.totalDonations}</p>
                    <p className="text-xs text-muted-foreground">
                      {donorInfo.livesSaved} lives potentially saved
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
              </CardHeader>
              <CardContent>
                {donorInfo.lastDonationDate ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-xl font-bold">
                        {new Date(donorInfo.lastDonationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {donorInfo.daysSinceLastDonation !== null && (
                        <p className="text-xs text-muted-foreground">
                          {donorInfo.daysSinceLastDonation} days ago
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-muted-foreground">No donations yet</p>
                      <p className="text-xs text-muted-foreground">First-time donor</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical Notes */}
          {donorInfo.medicalNotes && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-yellow-900">Medical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">{donorInfo.medicalNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Verification Status & Actions */}
          {donorInfo.verificationStatus === 'PENDING' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900">Pending Verification</p>
                    <p className="text-sm text-yellow-700">
                      This donor is awaiting verification. Please review their information and contact them if needed before approving.
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleApproveDonor}
                    disabled={isApproving || isRejecting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve Donor
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isApproving || isRejecting}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {donorInfo.verificationStatus === 'VERIFIED' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Donor Verified</p>
                    <p className="text-sm text-green-700">
                      This donor has been verified and can participate in blood donation activities.
                    </p>
                    {donorInfo.verifiedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Verified on {new Date(donorInfo.verifiedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {donorInfo.verificationStatus === 'REJECTED' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white flex-shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Verification Rejected</p>
                    <p className="text-sm text-red-700 mb-2">
                      This donor's verification was rejected.
                    </p>
                    {donorInfo.rejectionReason && (
                      <div className="bg-red-100 rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-800">{donorInfo.rejectionReason}</p>
                      </div>
                    )}
                    {donorInfo.verifiedAt && (
                      <p className="text-xs text-red-600 mt-2">
                        Rejected on {new Date(donorInfo.verifiedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reject Dialog */}
          {showRejectDialog && (
            <Card className="border-red-200 bg-red-50 mt-4">
              <CardHeader>
                <CardTitle className="text-red-900">Reject Donor Verification</CardTitle>
                <CardDescription className="text-red-700">
                  Please provide a reason for rejecting this donor's verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason" className="text-red-900">
                    Rejection Reason *
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="min-h-[100px]"
                    disabled={isRejecting}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRejectDonor}
                    disabled={isRejecting || !rejectionReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Confirm Rejection
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason('');
                    }}
                    disabled={isRejecting}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Help Text */}
      {!donorInfo && !isSearching && !error && (
        <Card>
          <CardHeader>
            <CardTitle>How to Verify a Donor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To verify a donor, you can search using any of the following:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li>Donor ID (e.g., the unique ID assigned to the donor)</li>
              <li>Email address registered with the system</li>
              <li>Phone number registered with the system</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              The system will display the donor's information, donation history, and verification
              status if found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
