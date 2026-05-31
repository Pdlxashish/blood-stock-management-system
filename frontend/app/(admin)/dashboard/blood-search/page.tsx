'use client';
import { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDonors, useCallDonor, useNotifyDonor } from "@/lib/queries/donors";
import { useBloodSearchStore, useToast } from "@/lib/store";
import { getCityCoordinates, BLOOD_GROUPS, LOW_STOCK_GROUPS, DEFAULT_MAP_CENTER, haversineKm } from "@/lib/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PageHeader,
  LocationStatus,
  LowStockSuggestions,
  SearchFilters,
  MapPanel,
  DonorGrid,
  FullMapModal,
  DonorDetailSheet,
  useMapSetup,
} from "./components";

export default function BloodSearchPage() {
  const router = useRouter();
  
  // Zustand stores
  const selectedGroup = useBloodSearchStore((state) => state.selectedBloodGroup);
  const setSelectedGroup = useBloodSearchStore((state) => state.setSelectedBloodGroup);
  const locationQuery = useBloodSearchStore((state) => state.locationQuery);
  const setLocationQuery = useBloodSearchStore((state) => state.setLocationQuery);
  const radius = useBloodSearchStore((state) => state.radius);
  const setRadius = useBloodSearchStore((state) => state.setRadius);
  const clickedPos = useBloodSearchStore((state) => state.clickedPosition);
  const setClickedPos = useBloodSearchStore((state) => state.setClickedPosition);
  const fullMapOpen = useBloodSearchStore((state) => state.fullMapOpen);
  const setFullMapOpen = useBloodSearchStore((state) => state.setFullMapOpen);
  const sheetDonor = useBloodSearchStore((state) => state.selectedDonor);
  const setSheetDonor = useBloodSearchStore((state) => state.setSelectedDonor);
  const userLocation = useBloodSearchStore((state) => state.userLocation);
  const setUserLocation = useBloodSearchStore((state) => state.setUserLocation);
  const locationError = useBloodSearchStore((state) => state.locationError);
  const setLocationError = useBloodSearchStore((state) => state.setLocationError);
  const locationLoading = useBloodSearchStore((state) => state.locationLoading);
  const setLocationLoading = useBloodSearchStore((state) => state.setLocationLoading);
  const clearPin = useBloodSearchStore((state) => state.clearPin);
  
  // Local state
  const [mapReady, setMapReady] = useState(false);

  const { toast } = useToast();

  // Fetch donors using TanStack Query
  const { data: donors = [], isLoading, error } = useDonors();

  // Mutations for call and notify
  const callDonorMutation = useCallDonor();
  const notifyDonorMutation = useNotifyDonor();

  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast('Failed to load donors. Please refresh the page.', 'error');
    }
  }, [error, toast]);

  // Get user's current location
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationLoading(false);
      setUserLocation(DEFAULT_MAP_CENTER);
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationLoading(false);
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Using default location.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Using default location.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Using default location.';
              break;
          }
          
          setLocationError(errorMessage);
          setUserLocation(DEFAULT_MAP_CENTER);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    };

    getLocation();
  }, []);

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // Filter donors
  const donorsArray = Array.isArray(donors) ? donors : donors?.data || [];
  const filtered = donorsArray.filter((d) => {
    // Filter by blood group
    if (selectedGroup !== "all") {
      const dbFormat = selectedGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
      if (d.bloodGroup !== dbFormat) return false;
    }
    
    // Filter by location query
    const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
    if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return false;
    
    // Filter by radius if pin is clicked
    if (clickedPos) {
      let coords = d.latitude && d.longitude
        ? { lat: d.latitude, lng: d.longitude }
        : getCityCoordinates(d.city || d.location);
      
      if (coords && 'latitude' in coords) {
        coords = { lat: coords.latitude, lng: coords.longitude };
      }
      
      if (coords) {
        const dist = haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng);
        if (dist > radius) return false;
      } else {
        return false;
      }
    }
    
    return true;
  });

  // Setup map with custom hook
  const { mapRef, mapObjRef } = useMapSetup({
    mapReady,
    userLocation,
    locationLoading,
    locationError,
    donors: donorsArray,
    selectedGroup,
    locationQuery,
    clickedPos,
    radius,
    onClickedPosChange: setClickedPos,
    onDonorClick: setSheetDonor,
  });

  const useMyLocation = () => {
    if (userLocation) {
      setClickedPos(userLocation);
      toast('Using your current location');
      
      if (mapObjRef.current) {
        mapObjRef.current.setView([userLocation.lat, userLocation.lng], 14);
      }
    } else {
      toast('Location not available. Please enable location access.', 'error');
    }
  };

  const handleCall = async (donorId: string, phoneNumber: string, donorName: string) => {
    try {
      const result = await callDonorMutation.mutateAsync({ donorId });
      
      // Copy phone number to clipboard
      if (phoneNumber && navigator.clipboard) {
        await navigator.clipboard.writeText(phoneNumber);
        toast(`📋 Phone number copied: ${phoneNumber}`, 'success');
      } else {
        // Fallback: show phone number in toast
        toast(`📞 Call ${donorName} at: ${phoneNumber}`, 'info');
      }
      
      // Try to open phone dialer (works on mobile devices)
      if (phoneNumber && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `tel:${phoneNumber}`;
      }
    } catch (error: any) {
      console.error('Failed to call donor:', error);
      toast(error.response?.data?.message || 'Failed to get phone number', 'error');
    }
  };

  const handleNotify = async (donorId: string, donorName: string) => {
    try {
      const result = await notifyDonorMutation.mutateAsync({
        donorId,
        title: 'Blood Donation Request',
        message: `You have been contacted regarding a blood donation request. Your contribution can save lives!`,
      });
      
      toast(result.message || `Notification sent to ${donorName}`, 'success');
    } catch (error: any) {
      console.error('Failed to notify donor:', error);
      toast(error.response?.data?.message || 'Failed to send notification', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-[1300px] mx-auto">
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
                <BreadcrumbPage>Blood Search</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <PageHeader
          filteredCount={filtered.length}
          clickedPos={clickedPos}
          userLocation={userLocation}
          onUseMyLocation={useMyLocation}
        />

        {/* Location Status */}
        <LocationStatus locationError={locationError} userLocation={userLocation} />

        {/* Low Stock Suggestions */}
        <LowStockSuggestions
          lowStockGroups={LOW_STOCK_GROUPS}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />

        {/* Filters Card */}
        <SearchFilters
          selectedGroup={selectedGroup}
          locationQuery={locationQuery}
          radius={radius}
          clickedPos={clickedPos}
          bloodGroups={BLOOD_GROUPS}
          onGroupChange={setSelectedGroup}
          onLocationChange={setLocationQuery}
          onRadiusChange={setRadius}
          onClearPin={clearPin}
        />

        {/* Map Panel */}
        <MapPanel
          mapRef={mapRef}
          mapReady={mapReady}
          locationLoading={locationLoading}
          filteredCount={filtered.length}
          radius={radius}
          clickedPos={clickedPos}
          onFullMapOpen={() => setFullMapOpen(true)}
        />

        {/* Donor Cards Grid */}
        <DonorGrid
          donors={filtered}
          isLoading={isLoading}
          clickedPos={clickedPos}
          onDonorClick={setSheetDonor}
          onCall={handleCall}
          onNotify={handleNotify}
        />

        {/* Full Map Modal */}
        <FullMapModal
          isOpen={fullMapOpen}
          mapRef={mapRef}
          filteredCount={filtered.length}
          onClose={() => setFullMapOpen(false)}
        />

        {/* Donor Detail Sheet */}
        <DonorDetailSheet
          donor={sheetDonor}
          clickedPos={clickedPos}
          onClose={() => setSheetDonor(null)}
          onCall={handleCall}
          onNotify={handleNotify}
        />
      </div>
    </div>
  );
}
