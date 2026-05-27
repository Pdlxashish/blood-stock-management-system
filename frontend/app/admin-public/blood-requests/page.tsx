'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Droplet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
} from 'lucide-react';

interface BloodRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  neededBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  stockAvailable?: boolean;
  stockCheckedAt?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

const URGENCY_COLORS = {
  NORMAL: 'bg-blue-100 text-blue-800',
  URGENT: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  FULFILLED: 'bg-gray-100 text-gray-800',
};

export default function BloodRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'ALL' ? { status: filter } : {};
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests`,
        { params }
      );
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkStock = async (requestId: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/${requestId}/check-stock`
      );
      
      const { stockInfo } = response.data.data;
      alert(
        `Stock Check:\nAvailable: ${stockInfo.available} units\nNeeded: ${stockInfo.needed} units\nStatus: ${stockInfo.isAvailable ? '✅ Available' : '❌ Insufficient'}`
      );
      
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check stock');
    }
  };

  const approveRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this blood request?')) return;

    try {
      setProcessing(true);
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/${requestId}/approve`,
        { reviewedBy: 'admin' }
      );
      alert('Blood request approved successfully!');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/${requestId}/reject`,
        { 
          reviewedBy: 'admin',
          rejectionReason: rejectionReason.trim()
        }
      );
      alert('Blood request rejected');
      fetchRequests();
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
        <p className="text-gray-600 mt-1">Review and manage blood requests from the public</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as any)}
            size="sm"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Droplet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No blood requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{request.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={URGENCY_COLORS[request.urgency]}>
                        {request.urgency}
                      </Badge>
                      <Badge className={STATUS_COLORS[request.status]}>
                        {request.status}
                      </Badge>
                      <Badge variant="outline" className="font-bold">
                        {request.bloodGroup}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {request.unitsNeeded} {request.unitsNeeded === 1 ? 'Unit' : 'Units'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{request.phone}</span>
                  </div>
                  {request.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{request.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{request.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Needed by: {formatDate(request.neededBy)}</span>
                  </div>
                </div>

                {/* Stock Status */}
                {request.stockCheckedAt && (
                  <div className={`p-3 rounded-lg ${request.stockAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">
                        Stock: {request.stockAvailable ? '✅ Available' : '❌ Insufficient'}
                      </span>
                      <span className="text-xs text-gray-600">
                        (Checked: {formatDate(request.stockCheckedAt)})
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {request.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{request.notes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.rejectionReason && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {request.status === 'PENDING' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkStock(request.id)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Check Stock
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveRequest(request.id)}
                      disabled={processing}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedRequest(request)}
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {request.status === 'APPROVED' && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      ✅ Approved - Ready for blood issuance
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Reject Blood Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Rejecting request from <strong>{selectedRequest.name}</strong>
                </p>
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectRequest(selectedRequest.id)}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  Reject Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
