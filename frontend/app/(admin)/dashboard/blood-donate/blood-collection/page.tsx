'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Droplets,
  User,
  Search,
  CheckCircle,
  Loader2,
  Building2,
  AlertCircle,
  Calendar,
  Weight,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchDonors, useRecordBloodCollection } from '@/lib/queries/bloodCollection';
import { useEvents } from '@/lib/queries/events';
import { useDonorEligibility } from '@/lib/queries/donors';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { FullAddressAutocomplete } from '@/components/ui/full-address-autocomplete';
import { InteractiveLocationMap } from '@/components/ui/interactive-location-map';
import { BirthdayPicker } from '@/components/ui/birthday-picker';
import { geocodeLocationWithFallback } from '@/lib/geocoding';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodCollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');
  
  const [mounted, setMounted] = useState(false);
  const [donorSearch, setDonorSearch] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [selectedDonorUserId, setSelectedDonorUserId] = useState<string>('');
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  // Eligibility error dialog state
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<{
    message: string;
    lastDonationDate?: string;
    nextEligibleDate?: string;
    daysRemaining?: number;
    cooldownPeriod?: number;
  } | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    bloodGroup: '',
    dateOfBirth: '',
    weight: '',
    city: '',
    address: '',
    units: '1', // Fixed at 1 for individual donors
    collectionDate: new Date().toISOString().split('T')[0],
    collectionLocation: 'WALK_IN', // Default to Walk-in (Office)
    selectedEventId: eventIdFromUrl || '', // Auto-select event from URL
    storageLocation: '',
    notes: '',
    hasMedicalCondition: 'no',
    medicalConditionDetails: '',
  });

  // Auto-select event and set collection type when coming from event page
  useEffect(() => {
    if (eventIdFromUrl) {
      setFormData(prev => ({
        ...prev,
        collectionLocation: 'EVENT',
        selectedEventId: eventIdFromUrl
      }));
    }
  }, [eventIdFromUrl]);

  // Show map when city OR address is provided
  useEffect(() => {
    if ((formData.city && formData.city.length > 2) || (formData.address && formData.address.length > 3)) {
      setShowLocationMap(true);
    } else {
      setShowLocationMap(false);
      setManualCoordinates(null);
    }
  }, [formData.city, formData.address]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setManualCoordinates({ lat, lng });
    console.log(`📍 User selected coordinates: ${lat}, ${lng}`);
  };

  const handleAddressUpdate = (newAddress: string, newCity: string) => {
    console.log(`🔄 Updating address from coordinates: ${newAddress}, ${newCity}`);
    setFormData(prev => ({
      ...prev,
      address: newAddress,
      city: newCity,
    }));
  };

  const handleCloseMap = () => {
    setShowLocationMap(false);
  };

  // Query hooks
  const { data: searchResults, isLoading: isSearching } = useSearchDonors(donorSearch, searchEnabled);
  const { data: events = [] } = useEvents({ status: 'RUNNING' }); // Only get running events
  const { data: donorEligibility, isLoading: isCheckingEligibility } = useDonorEligibility(selectedDonorUserId);
  const recordCollection = useRecordBloodCollection();

  const handleSearchDonor = () => {
    if (donorSearch.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }
    setSearchEnabled(true);
  };

  const handleSelectDonor = (donor: any) => {
    setSelectedDonor(donor);
    setSelectedDonorUserId(donor.userId); // Set userId to trigger eligibility check
    
    // Convert blood group from DB format to display format
    const bloodGroupMap: Record<string, string> = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-',
    };

    setFormData({
      ...formData,
      donorName: donor.user.name,
      donorPhone: donor.user.phone,
      donorEmail: donor.user.email,
      bloodGroup: bloodGroupMap[donor.bloodGroup] || donor.bloodGroup,
      dateOfBirth: donor.dateOfBirth ? new Date(donor.dateOfBirth).toISOString().split('T')[0] : '',
      weight: donor.weight ? donor.weight.toString() : '',
      city: donor.city || '',
      address: donor.address || '',
    });

    toast.success(`Selected donor: ${donor.user.name}`);
    setDonorSearch('');
    setSearchEnabled(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.donorName || !formData.donorPhone || !formData.bloodGroup || !formData.collectionLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Use manual coordinates if user selected them, otherwise geocode
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (manualCoordinates) {
        // User manually selected coordinates from map
        latitude = manualCoordinates.lat;
        longitude = manualCoordinates.lng;
        console.log(`✅ Using manual coordinates: ${latitude}, ${longitude}`);
      } else if (formData.address && formData.city) {
        // Fallback to automatic geocoding
        const fullAddress = `${formData.address}, ${formData.city}`;
        console.log(`🔍 Attempting to geocode: "${fullAddress}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(fullAddress);
          
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
            console.log(`✅ Geocoded address: ${fullAddress} → ${coords.latitude}, ${coords.longitude}`);
            toast.success(`Address geocoded successfully`, {
              description: `Location: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
            });
          } else {
            console.log(`⚠️ Could not geocode address: ${fullAddress}`);
            toast.error('Could not find precise location', {
              description: 'Using city coordinates as fallback',
            });
          }
        } catch (geocodeError) {
          console.error('Geocoding failed:', geocodeError);
          toast.error('Geocoding service unavailable', {
            description: 'Proceeding with city coordinates',
          });
        }
      } else if (formData.city) {
        // Try geocoding just the city if no full address
        console.log(`🔍 Geocoding city only: "${formData.city}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(formData.city);
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
            console.log(`✅ Geocoded city: ${formData.city} → ${coords.latitude}, ${coords.longitude}`);
          }
        } catch (geocodeError) {
          console.error('City geocoding failed:', geocodeError);
        }
      } else {
        console.log('⚠️ No address or city provided for geocoding');
      }

      console.log('📤 Submitting blood collection with data:', {
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        bloodGroup: formData.bloodGroup,
        city: formData.city,
        address: formData.address,
        latitude,
        longitude,
        units: formData.units,
        apiUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/donations/collect`,
      });

      const result = await recordCollection.mutateAsync({
        donorId: selectedDonor?.id,
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        donorEmail: formData.donorEmail,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        location: formData.city, // Use city as location
        city: formData.city,
        address: formData.address,
        latitude, // Add geocoded latitude
        longitude, // Add geocoded longitude
        units: '1', // Always 1 unit for individual donors
        collectionDate: formData.collectionDate,
        collectionLocation: formData.collectionLocation,
        eventId: formData.collectionLocation === 'EVENT' ? formData.selectedEventId : undefined, // Add event ID
        storageLocation: formData.storageLocation,
        notes: formData.notes,
        medicalNotes: formData.hasMedicalCondition === 'yes' ? formData.medicalConditionDetails : null,
      });

      console.log('✅ Blood collection recorded successfully:', result);
      toast.success('Blood donation recorded successfully!', {
        description: `Blood pack ${result.data.bloodPack.packCode} created`,
      });

      // Redirect back to blood stock
      router.push('/dashboard/blood-stock');
    } catch (error: any) {
      console.error('❌ Blood collection submission failed:', error);
      
      // Enhanced error handling with safe property access
      let errorMessage = 'Failed to record donation';
      let errorDescription = 'Please try again';
      
      try {
        if (error?.response) {
          // Server responded with error
          const status = error.response.status;
          const data = error.response.data || {};
          
          console.error('Server error response:', { 
            status, 
            data,
            url: error.config?.url,
            method: error.config?.method 
          });
          
          switch (status) {
            case 400:
              // Check if it's a donation eligibility error
              if (data?.errorType === 'DONOR_NOT_ELIGIBLE' && data?.eligibilityData) {
                // Show eligibility dialog instead of toast
                setEligibilityError({
                  message: data.message,
                  lastDonationDate: data.eligibilityData.lastDonationDate,
                  nextEligibleDate: data.eligibilityData.nextEligibleDate,
                  daysRemaining: data.eligibilityData.daysRemaining,
                  cooldownPeriod: data.eligibilityData.cooldownPeriod,
                });
                setShowEligibilityDialog(true);
                return; // Don't show toast, dialog will handle it
              } else if (data?.message && data.message.includes('not eligible to donate')) {
                errorMessage = '🚫 Donor Not Eligible';
                errorDescription = data.message;
              } else {
                errorMessage = 'Invalid data provided';
                errorDescription = data?.message || 'Please check your input and try again';
              }
              break;
            case 401:
              errorMessage = 'Authentication required';
              errorDescription = 'Please login and try again';
              break;
            case 500:
              errorMessage = 'Server error occurred';
              errorDescription = 'Please try again later or contact support';
              break;
            default:
              errorMessage = data?.message || 'Failed to record donation';
              errorDescription = 'Please check your connection and try again';
          }
        } else if (error?.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout';
          errorDescription = 'The request took too long. Please try again';
        } else if (error?.request) {
          errorMessage = 'Network error';
          errorDescription = 'Unable to connect to server. Check your internet connection';
        } else {
          errorMessage = 'Unexpected error';
          errorDescription = error?.message || 'Something went wrong';
        }
      } catch (errorParsingError) {
        console.error('Error parsing error response:', errorParsingError);
        errorMessage = 'Unexpected error occurred';
        errorDescription = 'Please try again or contact support';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {!mounted ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1400px] mx-auto p-6 md:p-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/blood-stock">Blood Stock</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blood Collection</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/blood-stock')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div className="w-10 h-10 rounded-lg bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
              <Droplets size={18} className="text-[#7F1D1D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Record Blood Donation</h1>
              <p className="text-sm text-slate-600">Collect blood from donor and create blood pack</p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/dashboard/blood-donate/blood-collection/bulk-collection')}
            className="bg-[#7F1D1D] hover:bg-[#991B1B] gap-2"
          >
            <Building2 size={16} />
            Bulk Collection
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Donor Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Donor Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-[#7F1D1D]" />
                    Search Existing Donor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search by name, phone, or email..."
                      value={donorSearch}
                      onChange={(e) => {
                        setDonorSearch(e.target.value);
                        if (e.target.value.length === 0) {
                          setSearchEnabled(false);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSearchDonor}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Search size={16} className="mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {searchEnabled && searchResults && searchResults.length > 0 && (
                    <div className="mt-3 border rounded-lg divide-y max-h-60 overflow-y-auto">
                      {searchResults.map((donor) => (
                        <button
                          key={donor.id}
                          type="button"
                          onClick={() => handleSelectDonor(donor)}
                          className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{donor.user.name}</p>
                              <p className="text-sm text-slate-600">{donor.user.phone}</p>
                              {donor.user.email && (
                                <p className="text-xs text-slate-500">{donor.user.email}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                {donor.bloodGroup.replace('_', ' ')}
                              </span>
                              <p className="text-xs text-slate-500 mt-1">
                                {donor.totalDonations} donations
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchEnabled && searchResults && searchResults.length === 0 && (
                    <p className="text-sm text-slate-500 mt-3">
                      No donors found. Enter details below to create new donor record.
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    Search for registered donors or enter new donor details below
                  </p>
                </CardContent>
              </Card>

              {/* Donor Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#7F1D1D]" />
                    Donor Information
                    {selectedDonor && (
                      <span className="ml-auto text-sm font-normal text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} />
                        Existing Donor Selected
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>

                {/* 90-Day Eligibility Warning */}
                {selectedDonor && donorEligibility && !donorEligibility.isEligible && (
                  <div className="mx-6 mb-4">
                    <div className="flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-red-800 text-lg">⚠️ Donor Not Eligible</p>
                        <p className="text-sm text-red-700 mt-1">
                          This donor has already donated blood recently and must wait 90 days between donations.
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-red-600" />
                            <span className="text-red-700">
                              <span className="font-semibold">Last Donation:</span>{' '}
                              {donorEligibility.lastDonationDate
                                ? new Date(donorEligibility.lastDonationDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-red-600" />
                            <span className="text-red-700">
                              <span className="font-semibold">Next Eligible Date:</span>{' '}
                              {donorEligibility.nextEligibleDate
                                ? new Date(donorEligibility.nextEligibleDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-md border border-red-300">
                              <AlertCircle className="h-5 w-5 text-red-700" />
                              <span className="font-bold text-red-800 text-lg">
                                {donorEligibility.daysRemaining} day{donorEligibility.daysRemaining !== 1 ? 's' : ''} remaining
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-red-600 mt-3 font-medium">
                          ⛔ The system will block this donation if you attempt to submit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility Check Loading */}
                {selectedDonor && isCheckingEligibility && (
                  <div className="mx-6 mb-4">
                    <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
                      <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                      <span className="text-sm text-gray-700">Checking donor eligibility...</span>
                    </div>
                  </div>
                )}

                {/* Eligible Donor Confirmation */}
                {selectedDonor && donorEligibility && donorEligibility.isEligible && donorEligibility.lastDonationDate && (
                  <div className="mx-6 mb-4">
                    <div className="flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 p-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-800">✓ Donor is Eligible</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Last donation: {new Date(donorEligibility.lastDonationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} — More than 90 days have passed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="donorName">
                        Full Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="donorName"
                        value={formData.donorName}
                        onChange={(e) =>
                          setFormData({ ...formData, donorName: e.target.value })
                        }
                        placeholder="Enter donor name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorPhone">
                        Phone Number <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="donorPhone"
                        value={formData.donorPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, donorPhone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorEmail">Email (Optional)</Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        value={formData.donorEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, donorEmail: e.target.value })
                        }
                        placeholder="Enter email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">
                        Blood Group <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bloodGroup: value })
                        }
                        required
                      >
                        <SelectTrigger id="bloodGroup">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <BirthdayPicker
                      id="dateOfBirth"
                      label="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={(value) =>
                        setFormData({ ...formData, dateOfBirth: value })
                      }
                      placeholder="Select date of birth"
                      required
                    />

                    <div className="space-y-2">
                      <Label htmlFor="weight">
                        Weight (kg) <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="weight"
                          type="number"
                          min="50"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          placeholder="70"
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500">Minimum 50 kg required</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <LocationAutocomplete
                        id="city"
                        label="City"
                        value={formData.city}
                        onChange={(value) =>
                          setFormData({ ...formData, city: value })
                        }
                        placeholder="Start typing city name..."
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <FullAddressAutocomplete
                        id="address"
                        label="Full Address"
                        value={formData.address}
                        onChange={(value) =>
                          setFormData({ ...formData, address: value })
                        }
                        placeholder="Street, area, or landmark..."
                        cityContext={formData.city}
                        required
                      />
                    </div>

                    {/* Interactive Location Map */}
                    {showLocationMap && (
                      <div className="md:col-span-2">
                        <InteractiveLocationMap
                          address={formData.address}
                          city={formData.city}
                          onLocationSelect={handleLocationSelect}
                          onAddressUpdate={handleAddressUpdate}
                          onClose={handleCloseMap}
                          initialLat={manualCoordinates?.lat}
                          initialLng={manualCoordinates?.lng}
                        />
                        {manualCoordinates && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-800 font-medium">
                                Precise location selected: {manualCoordinates.lat.toFixed(6)}, {manualCoordinates.lng.toFixed(6)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Condition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#7F1D1D]" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>
                      Does the donor have any medical conditions? <span className="text-red-600">*</span>
                    </Label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value="no"
                          checked={formData.hasMedicalCondition === 'no'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasMedicalCondition: e.target.value,
                              medicalConditionDetails: '',
                            })
                          }
                          className="w-4 h-4 text-red-600"
                          required
                        />
                        <span className="text-sm font-medium">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value="yes"
                          checked={formData.hasMedicalCondition === 'yes'}
                          onChange={(e) =>
                            setFormData({ ...formData, hasMedicalCondition: e.target.value })
                          }
                          className="w-4 h-4 text-red-600"
                          required
                        />
                        <span className="text-sm font-medium">Yes</span>
                      </label>
                    </div>
                  </div>

                  {formData.hasMedicalCondition === 'yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="medicalConditionDetails">
                        Medical Condition Details <span className="text-red-600">*</span>
                      </Label>
                      <textarea
                        id="medicalConditionDetails"
                        value={formData.medicalConditionDetails}
                        onChange={(e) =>
                          setFormData({ ...formData, medicalConditionDetails: e.target.value })
                        }
                        placeholder="Please describe the medical condition(s)..."
                        className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        required={formData.hasMedicalCondition === 'yes'}
                      />
                      <p className="text-xs text-slate-500">
                        This information helps ensure donor safety
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Donation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-[#7F1D1D]" />
                    Donation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="units">
                        Units Collected <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="units"
                        type="number"
                        min="1"
                        max="1"
                        value="1"
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                        required
                      />
                      <p className="text-xs text-slate-500">
                        Individual donors can only donate 1 unit (450ml) per session
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">
                        Collection Date <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        value={formData.collectionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, collectionDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionLocation">
                        Collection Type <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={formData.collectionLocation}
                        onValueChange={(value) => {
                          setFormData({ ...formData, collectionLocation: value });
                          // Clear event selection if switching away from EVENT
                          if (value !== 'EVENT') {
                            setFormData(prev => ({ ...prev, selectedEventId: '' }));
                          }
                        }}
                        required
                      >
                        <SelectTrigger id="collectionLocation">
                          <SelectValue placeholder="Select collection type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EVENT">Event</SelectItem>
                          <SelectItem value="WALK_IN">Walk-in (Office)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Event Selection - Only show when collection type is EVENT */}
                    {formData.collectionLocation === 'EVENT' && (
                      <div className="space-y-2">
                        <Label htmlFor="selectedEvent">
                          Select Event <span className="text-red-600">*</span>
                        </Label>
                        <Select
                          value={formData.selectedEventId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, selectedEventId: value })
                          }
                          required={formData.collectionLocation === 'EVENT'}
                        >
                          <SelectTrigger id="selectedEvent">
                            <SelectValue placeholder="Choose running event..." />
                          </SelectTrigger>
                          <SelectContent>
                            {events.length > 0 ? (
                              events.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.title} - {new Date(event.eventDate).toLocaleDateString()}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-events" disabled>
                                No running events available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                          Only events with "RUNNING" status are shown
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="storageLocation">Storage Location</Label>
                      <Input
                        id="storageLocation"
                        value={formData.storageLocation}
                        onChange={(e) =>
                          setFormData({ ...formData, storageLocation: e.target.value })
                        }
                        placeholder="Refrigerator-A1"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Any additional notes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Donor:</span>
                      <span className="font-medium">
                        {formData.donorName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Blood Group:</span>
                      <span className="font-medium">
                        {formData.bloodGroup || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Units:</span>
                      <span className="font-medium">{formData.units}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Collection Date:</span>
                      <span className="font-medium">
                        {new Date(formData.collectionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Expiry Date:</span>
                      <span className="font-medium">
                        {new Date(
                          new Date(formData.collectionDate).getTime() +
                            35 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">What will be created:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">Donation record</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">
                          Blood pack with unique code
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">
                          Update blood stock (+{formData.units})
                        </span>
                      </div>
                      {selectedDonor && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-slate-600">
                            Update donor profile
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#7F1D1D] hover:bg-[#991B1B]"
                    disabled={
                      recordCollection.isPending || 
                      (selectedDonor && donorEligibility && !donorEligibility.isEligible)
                    }
                  >
                    {recordCollection.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : selectedDonor && donorEligibility && !donorEligibility.isEligible ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Donor Not Eligible ({donorEligibility.daysRemaining} days remaining)
                      </>
                    ) : (
                      'Record Donation'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/blood-stock')}
                    disabled={recordCollection.isPending}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
        </div>
      )}
      
      {/* Donor Not Eligible Dialog */}
      <Dialog open={showEligibilityDialog} onOpenChange={setShowEligibilityDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-red-800">
                Donor Not Eligible
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-700 mt-4">
              {eligibilityError?.message || 'This donor is not eligible to donate at this time.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Eligibility Details Card */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 space-y-4">
              <h3 className="font-semibold text-red-900 text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Donation Eligibility Information
              </h3>
              
              <div className="space-y-3">
                {/* Last Donation Date */}
                {eligibilityError?.lastDonationDate && (
                  <div className="flex items-start gap-3 bg-white rounded-md p-3 border border-red-200">
                    <Calendar className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">Last Donation Date</p>
                      <p className="text-lg font-bold text-red-800">
                        {new Date(eligibilityError.lastDonationDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Next Eligible Date */}
                {eligibilityError?.nextEligibleDate && (
                  <div className="flex items-start gap-3 bg-white rounded-md p-3 border border-red-200">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">Next Eligible Date</p>
                      <p className="text-lg font-bold text-green-700">
                        {new Date(eligibilityError.nextEligibleDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Days Remaining */}
                {eligibilityError?.daysRemaining !== undefined && (
                  <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-md p-4 border-2 border-red-300">
                    <AlertCircle className="h-8 w-8 text-red-700" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">Days Remaining</p>
                      <p className="text-3xl font-bold text-red-800">
                        {eligibilityError.daysRemaining}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        day{eligibilityError.daysRemaining !== 1 ? 's' : ''} until eligible
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Cooldown Period Info */}
                {eligibilityError?.cooldownPeriod && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">ℹ️ Safety Requirement:</span> Blood donors must wait{' '}
                      <span className="font-bold">{eligibilityError.cooldownPeriod} days</span> between donations 
                      to ensure their health and safety.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Warning Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Important</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    The system will not allow this donation to proceed. Please wait until the donor is eligible 
                    or select a different donor.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowEligibilityDialog(false)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
