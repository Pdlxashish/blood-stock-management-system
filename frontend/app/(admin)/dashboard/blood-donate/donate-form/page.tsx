'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, AlertCircle, CheckCircle2, Package, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";
import { useBloodPacks } from "@/lib/queries/bloodStock";
import { useCreateBloodIssue } from "@/lib/queries/bloodIssues";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BloodIssueForm {
  donationType: 'person' | 'organization';
  name: string;
  bloodGroup: string;
  units: string;
  contact: string;
  notes?: string;
}

export default function DonateFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  
  const [formData, setFormData] = useState<BloodIssueForm>({
    donationType: 'person',
    name: '',
    bloodGroup: '',
    units: '1',
    contact: '',
    notes: '',
  });

  const [selectedPacks, setSelectedPacks] = useState<Set<string>>(new Set());
  const [bloodRequest, setBloodRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  // Fetch blood packs using TanStack Query
  const { data: allBloodPacks = [], isLoading: packsLoading } = useBloodPacks();
  const createBloodIssue = useCreateBloodIssue();

  // Fetch blood request if requestId is provided
  useEffect(() => {
    if (requestId) {
      const fetchBloodRequest = async () => {
        try {
          setLoadingRequest(true);
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/${requestId}`
          );
          const request = response.data.data;
          setBloodRequest(request);
          
          // Pre-fill form with blood request data
          setFormData({
            donationType: 'person',
            name: request.name,
            bloodGroup: request.bloodGroup,
            units: request.unitsNeeded.toString(),
            contact: request.phone,
            notes: `Blood Request - Address: ${request.address}${request.notes ? '\nNotes: ' + request.notes : ''}`,
          });
        } catch (error) {
          console.error('Failed to fetch blood request:', error);
          sonnerToast.error('Failed to load blood request details');
        } finally {
          setLoadingRequest(false);
        }
      };
      fetchBloodRequest();
    }
  }, [requestId]);

  // Get unique blood groups that have available stock (dynamic)
  const availableBloodGroups = useMemo(() => {
    const bloodGroupsWithStock = new Set<string>();
    const packs = Array.isArray(allBloodPacks) ? allBloodPacks : allBloodPacks?.data || [];
    packs
      .filter(pack => pack.status === 'AVAILABLE')
      .forEach(pack => {
        // Convert database format to display format
        const displayFormat = pack.bloodGroup
          .replace('_POSITIVE', '+')
          .replace('_NEGATIVE', '-')
          .replace('_', '');
        bloodGroupsWithStock.add(displayFormat);
      });
    
    // Sort blood groups in standard order
    const sortOrder = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return sortOrder.filter(bg => bloodGroupsWithStock.has(bg));
  }, [allBloodPacks]);

  // Filter available packs based on blood group (memoized to prevent infinite loop)
  const availablePacks = useMemo(() => {
    if (!formData.bloodGroup) return [];
    
    // Convert display format back to database format for filtering
    const dbFormat = formData.bloodGroup
      .replace('+', '_POSITIVE')
      .replace('-', '_NEGATIVE');
    
    const packs = Array.isArray(allBloodPacks) ? allBloodPacks : allBloodPacks?.data || [];
    return packs
      .filter(pack => 
        pack.bloodGroup === dbFormat && 
        pack.status === 'AVAILABLE'
      )
      .sort((a, b) => {
        // Sort by expiry date ASC (FIFO - earliest expiry first)
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
  }, [allBloodPacks, formData.bloodGroup]);

  // Auto-select packs when blood group or units change
  useEffect(() => {
    if (formData.bloodGroup) {
      const unitsNeeded = parseInt(formData.units) || 0;
      
      // Auto-select first N packs based on units needed (FIFO)
      const autoSelected = new Set(availablePacks.slice(0, unitsNeeded).map(p => p.id));
      setSelectedPacks(autoSelected);
    } else {
      setSelectedPacks(new Set());
    }
  }, [formData.bloodGroup, formData.units, availablePacks]);

  const handlePackToggle = (packId: string) => {
    const newSelected = new Set(selectedPacks);
    if (newSelected.has(packId)) {
      newSelected.delete(packId);
    } else {
      // Check if we've reached the limit
      const unitsNeeded = parseInt(formData.units) || 0;
      if (newSelected.size < unitsNeeded) {
        newSelected.add(packId);
      } else {
        sonnerToast.error(`You can only select ${unitsNeeded} pack(s)`);
        return;
      }
    }
    setSelectedPacks(newSelected);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.bloodGroup || !formData.units || !formData.contact) {
      sonnerToast.error('Please fill all required fields');
      return;
    }

    const unitsNeeded = parseInt(formData.units) || 0;
    if (selectedPacks.size !== unitsNeeded) {
      sonnerToast.error(`Please select exactly ${unitsNeeded} blood pack(s)`);
      return;
    }

    if (availablePacks.filter(p => p.status === 'AVAILABLE').length < unitsNeeded) {
      sonnerToast.error('Not enough available blood packs for this blood group');
      return;
    }

    try {
      const issueResult = await createBloodIssue.mutateAsync({
        recipientName: formData.name,
        recipientType: formData.donationType === 'person' ? 'PERSON' : 'ORGANIZATION',
        bloodGroup: formData.bloodGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE'), // Convert to DB format
        unitsRequested: unitsNeeded,
        contact: formData.contact,
        notes: formData.notes || undefined,
        bloodPackIds: Array.from(selectedPacks),
      });

      // If this was from a blood request, mark it as fulfilled
      if (requestId && bloodRequest) {
        try {
          await axios.patch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests/${requestId}/fulfill`,
            {
              fulfilledBy: 'admin',
              bloodIssueId: issueResult.data.id,
            }
          );
        } catch (error) {
          console.error('Failed to mark blood request as fulfilled:', error);
          // Don't fail the whole operation if this fails
        }
      }

      sonnerToast.success(`Successfully issued ${unitsNeeded} unit(s) of ${formData.bloodGroup} blood to ${formData.name}`);
      
      // Navigate back to blood donate page
      router.push('/dashboard/blood-donate');
    } catch (error: any) {
      sonnerToast.error(error.response?.data?.message || 'Failed to record blood issue');
    }
  };

  const unitsNeeded = parseInt(formData.units) || 0;
  const availableCount = availablePacks.filter(p => p.status === 'AVAILABLE').length;
  const hasEnoughStock = availableCount >= unitsNeeded;

  if (packsLoading) {
    return (
      <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 animate-spin rounded-full border-4 border-red-200 border-t-red-800 mb-4"></div>
          <p className="text-sm font-semibold text-slate-600">Loading blood packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
      {/* Breadcrumbs */}
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
              <BreadcrumbLink href="/dashboard/blood-donate">Blood Donations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Issue Blood</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Donations
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Blood Issue Form</h1>
          <p className="text-sm text-slate-500 mt-1">Record blood issuance and select specific blood packs</p>
          
          {/* Blood Request Badge */}
          {bloodRequest && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Fulfilling Blood Request from {bloodRequest.name}
                </span>
                {bloodRequest.urgency === 'EMERGENCY' && (
                  <Badge className="bg-red-600">EMERGENCY</Badge>
                )}
                {bloodRequest.urgency === 'URGENT' && (
                  <Badge className="bg-orange-600">URGENT</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipient Information</CardTitle>
              <CardDescription className="text-xs">Enter details of the blood recipient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donationType">
                  Donation Type <span className="text-red-600">*</span>
                </Label>
                <Select 
                  value={formData.donationType} 
                  onValueChange={(value: 'person' | 'organization') => 
                    setFormData({ ...formData, donationType: value })
                  }
                >
                  <SelectTrigger id="donationType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {formData.donationType === 'person' ? 'Name' : 'Organization Name'} <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={formData.donationType === 'person' ? 'Enter recipient name' : 'Enter organization name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">
                    Blood Group <span className="text-red-600">*</span>
                  </Label>
                  <Select 
                    value={formData.bloodGroup} 
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                    disabled={packsLoading || availableBloodGroups.length === 0}
                  >
                    <SelectTrigger id="bloodGroup">
                      <SelectValue placeholder={
                        packsLoading 
                          ? "Loading..." 
                          : availableBloodGroups.length === 0 
                          ? "No stock available" 
                          : "Select blood group"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBloodGroups.length > 0 ? (
                        availableBloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                            <span className="ml-2 text-xs text-slate-500">
                              ({(Array.isArray(allBloodPacks) ? allBloodPacks : allBloodPacks?.data || []).filter(p => 
                                p.bloodGroup === group.replace('+', '_POSITIVE').replace('-', '_NEGATIVE') && 
                                p.status === 'AVAILABLE'
                              ).length} available)
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No blood groups with available stock
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!packsLoading && availableBloodGroups.length === 0 && (
                    <p className="text-xs text-red-600">
                      No blood groups have available stock. Please check blood collection.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">
                    Units <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">
                  Contact <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="contact"
                  placeholder="Phone number or email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  placeholder="Any additional notes about the blood issue (optional)"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-20 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500">
                  Include any special instructions, medical conditions, or other relevant information
                </p>
              </div>

              {/* Stock Status Alert */}
              {formData.bloodGroup && formData.units && (
                <div className={`p-3 rounded-lg border ${
                  hasEnoughStock 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {hasEnoughStock ? (
                      <CheckCircle2 size={16} className="text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${
                        hasEnoughStock ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {hasEnoughStock 
                          ? `${availableCount} unit(s) available` 
                          : 'Insufficient stock'
                        }
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        hasEnoughStock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {hasEnoughStock 
                          ? `You need ${unitsNeeded} unit(s), ${availableCount} available`
                          : `You need ${unitsNeeded} unit(s), only ${availableCount} available`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Available Packs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Blood Packs</CardTitle>
              <CardDescription className="text-xs">
                {formData.bloodGroup 
                  ? `All available ${formData.bloodGroup} packs • Select ${unitsNeeded} • Sorted by expiry (FIFO)`
                  : 'Select blood group to see available packs'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!formData.bloodGroup ? (
                <div className="text-center py-12 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select blood group and units to see available packs</p>
                </div>
              ) : availablePacks.length === 0 ? (
                <div className="text-center py-12 text-red-400">
                  <AlertCircle size={48} className="mx-auto mb-3" />
                  <p className="text-sm font-semibold">No available packs for {formData.bloodGroup}</p>
                  <p className="text-xs mt-1">Please check blood stock</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {availablePacks.map((pack, index) => {
                    const isSelected = selectedPacks.has(pack.id);
                    const isExpiringSoon = new Date(pack.expiryDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                    const donor = pack.donor;
                    
                    return (
                      <div
                        key={pack.id}
                        onClick={() => handlePackToggle(pack.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePackToggle(pack.id)}
                            className="w-4 h-4 text-red-600 rounded mt-1 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1 min-w-0">
                            {/* Pack Code and Priority Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-bold text-slate-900">
                                {pack.packCode}
                              </span>
                              {index < unitsNeeded && (
                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                  Priority #{index + 1}
                                </Badge>
                              )}
                              {isExpiringSoon && (
                                <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>

                            {/* Donor Name */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs text-slate-500">Donor:</span>
                              <span className="text-xs font-semibold text-slate-700">
                                {donor?.user?.name || 'Unknown'}
                              </span>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Collected</span>
                                <span className="text-xs font-medium text-slate-600">
                                  {new Date(pack.collectionDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Expires</span>
                                <span className={`text-xs font-medium ${
                                  isExpiringSoon ? 'text-orange-600' : 'text-slate-600'
                                }`}>
                                  {new Date(pack.expiryDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Days until expiry */}
                            <div className="mt-1.5">
                              <span className="text-[10px] text-slate-400">
                                {Math.ceil((new Date(pack.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selection Summary */}
              {availablePacks.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Selected Packs:</span>
                    <span className={`font-bold ${
                      selectedPacks.size === unitsNeeded 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {selectedPacks.size} / {unitsNeeded}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => router.back()}
            disabled={createBloodIssue.isPending}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#7F1D1D] hover:bg-[#991B1B]"
            onClick={handleSubmit}
            disabled={
              createBloodIssue.isPending || 
              !hasEnoughStock || 
              selectedPacks.size !== unitsNeeded ||
              !formData.name ||
              !formData.contact
            }
          >
            {createBloodIssue.isPending ? 'Recording...' : 'Record Blood Issue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
