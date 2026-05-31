'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Heart, Plus, Search, User, Building2, Droplets, TrendingUp, CheckCircle2, Home, Loader2, AlertCircle, Bell, Phone, MapPin, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BLOOD_GROUPS } from "@/lib/data";
import { useBloodIssues } from "@/lib/queries/bloodIssues";
import { toast as sonnerToast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BloodDonatePage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch blood issues using TanStack Query
  const { data: bloodIssues = [], isLoading, error } = useBloodIssues();

  // Fetch approved blood requests
  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/approved`
        );
        setApprovedRequests(response.data.data);
      } catch (error) {
        console.error('Failed to fetch approved requests:', error);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchApprovedRequests();
  }, []);

  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      sonnerToast.error('Please provide a rejection reason');
      return;
    }

    if (!selectedRequest) {
      sonnerToast.error('No request selected');
      return;
    }

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/${selectedRequest.id}/reject`,
        {
          reviewedBy: 'admin',
          rejectionReason: rejectionReason.trim(),
        }
      );

      // Send rejection email notification
      if (selectedRequest.email) {
        sonnerToast.success(`Blood request rejected. Notification email sent to ${selectedRequest.email}`);
      } else {
        sonnerToast.success('Blood request rejected successfully');
      }

      // Refresh the approved requests list
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/approved`
      );
      setApprovedRequests(response.data.data);
      
      // Close modal and reset
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error: any) {
      sonnerToast.error(error.response?.data?.message || 'Failed to reject blood request');
    }
  };

  // Calculate stats
  const totalUnits = bloodIssues.reduce((sum, issue) => sum + issue.unitsIssued, 0);
  const totalPersons = bloodIssues.filter(issue => issue.recipientType === "PERSON").length;
  const totalOrganizations = bloodIssues.filter(issue => issue.recipientType === "ORGANIZATION").length;
  const recentIssues = bloodIssues.slice(0, 5);

  // Filter blood issues
  const filteredIssues = bloodIssues.filter((issue) => {
    if (filterType !== "all") {
      const typeMap = { "person": "PERSON", "organization": "ORGANIZATION" };
      if (issue.recipientType !== typeMap[filterType as keyof typeof typeMap]) return false;
    }
    if (filterBloodGroup !== "all" && issue.bloodGroup !== filterBloodGroup) return false;
    if (searchQuery && !issue.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-red-800 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading blood donations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <p className="text-sm font-semibold text-red-600 mb-1">Failed to load blood donations</p>
          <p className="text-xs text-slate-500">Please refresh the page to try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
      {/* ── Breadcrumbs ── */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blood Donations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
            <Heart size={18} color="#7F1D1D" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">Blood Donations</h1>
            <p className="text-[13px] text-slate-500 mt-[2px]">Track and manage blood donation records</p>
          </div>
        </div>
        <Button 
          className="bg-[#7F1D1D] hover:bg-[#991B1B]"
          onClick={() => router.push('/dashboard/blood-donate/donate-form')}
        >
          <Plus size={14} className="mr-1.5" /> Record Donation
        </Button>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Units Donated</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Droplets size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#7F1D1D] leading-none">{totalUnits}</div>
            <p className="text-[11px] text-slate-400 mt-1">Blood units collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Individual Donors</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.08)] flex items-center justify-center">
              <User size={16} color="#3b82f6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#3b82f6] leading-none">{totalPersons}</div>
            <p className="text-[11px] text-slate-400 mt-1">Individual recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Organizations</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.08)] flex items-center justify-center">
              <Building2 size={16} color="#a855f7" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#a855f7] leading-none">{totalOrganizations}</div>
            <p className="text-[11px] text-slate-400 mt-1">Organization recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Records</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.08)] flex items-center justify-center">
              <CheckCircle2 size={16} color="#22c55e" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#22c55e] leading-none">{bloodIssues.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Blood issue records</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Donations ── */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
              <TrendingUp size={15} color="#7F1D1D" />
            </div>
            <div>
              <CardTitle className="text-sm">Recent Blood Issues</CardTitle>
              <CardDescription className="text-xs">Latest 5 blood issue records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    issue.recipientType === "PERSON" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {issue.recipientType === "PERSON" ? <User size={18} /> : <Building2 size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{issue.recipientName}</p>
                    <p className="text-xs text-slate-500">{new Date(issue.issueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                    {issue.bloodGroup}
                  </Badge>
                  <span className="text-sm font-bold text-slate-700">{issue.unitsIssued} {issue.unitsIssued === 1 ? 'unit' : 'units'}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative flex-1">
          <Search size={13} color="#94a3b8" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-8"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="person">Individual</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blood Groups</SelectItem>
            {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterType !== "all" || filterBloodGroup !== "all" || searchQuery) && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setFilterType("all");
              setFilterBloodGroup("all");
              setSearchQuery("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* ── Approved Blood Requests ── */}
      {!loadingRequests && approvedRequests.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  Urgent Blood Requests
                </CardTitle>
                <CardDescription className="text-xs">
                  {approvedRequests.length} approved request{approvedRequests.length !== 1 ? 's' : ''} waiting for blood issuance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {approvedRequests.map((request) => {
                // Convert blood group from database format to display format
                const displayBloodGroup = request.bloodGroup
                  .replace('_POSITIVE', '+')
                  .replace('_NEGATIVE', '-');
                
                return (
                  <div
                    key={request.id}
                    className="bg-white p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{request.name}</h4>
                          <Badge variant="outline" className="font-bold text-red-600 border-red-300 bg-red-50 text-base px-2 py-0.5">
                            {displayBloodGroup}
                          </Badge>
                          {request.urgency === 'EMERGENCY' && (
                            <Badge className="bg-red-600">EMERGENCY</Badge>
                          )}
                          {request.urgency === 'URGENT' && (
                            <Badge className="bg-orange-600">URGENT</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {request.unitsNeeded} unit{request.unitsNeeded !== 1 ? 's' : ''} needed
                          </div>
                          <div className="flex items-center gap-1 col-span-2">
                            <MapPin className="h-3 w-3" />
                            {request.address}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => router.push(`/dashboard/blood-donate/donate-form?requestId=${request.id}`)}
                        >
                          Issue Blood
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-base">Reject Blood Request</CardTitle>
              <CardDescription className="text-xs">
                Rejecting request from <strong>{selectedRequest.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">
                  Rejection Reason <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter reason for rejection (will be sent via email)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                {selectedRequest.email && (
                  <p className="text-xs text-slate-500 mt-2">
                    📧 Rejection notification will be sent to: <strong>{selectedRequest.email}</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectRequest}
                  disabled={!rejectionReason.trim()}
                  className="flex-1"
                >
                  Reject Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── All Donations Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Blood Issue Records</CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredIssues.length} of {bloodIssues.length} blood issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(issue.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={issue.recipientType === "PERSON" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-purple-50 text-purple-700 border-purple-200"
                        }
                      >
                        {issue.recipientType === "PERSON" ? <User size={12} className="mr-1" /> : <Building2 size={12} className="mr-1" />}
                        {issue.recipientType === "PERSON" ? "Individual" : "Organization"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{issue.recipientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                        {issue.bloodGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{issue.contact}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          issue.status === "COMPLETED" 
                            ? "bg-green-50 text-green-700 border-green-200"
                            : issue.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{issue.unitsIssued}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No blood issues match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
