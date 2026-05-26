'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Droplet, Calendar, Weight, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { FullAddressAutocomplete } from "@/components/ui/full-address-autocomplete";
import { BirthdayPicker } from "@/components/ui/birthday-picker";
import { InteractiveLocationMap } from "@/components/ui/interactive-location-map";
import { geocodeLocationWithFallback } from "@/lib/geocoding";

export default function DonorFormPage() {
  const router = useRouter();
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  const [form, setForm] = useState({
    bloodGroup: "",
    dateOfBirth: "",
    weight: "",
    city: "",
    address: "",
    hasMedicalCondition: "no",
    medicalConditionDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  // Show map when both city and address are provided
  useEffect(() => {
    if ((form.city && form.city.length > 2) || (form.address && form.address.length > 3)) {
      setShowLocationMap(true);
    } else {
      setShowLocationMap(false);
      setManualCoordinates(null);
    }
  }, [form.city, form.address]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setManualCoordinates({ lat, lng });
    console.log(`📍 User selected coordinates: ${lat}, ${lng}`);
  };

  const handleAddressUpdate = (newAddress: string, newCity: string) => {
    console.log(`🔄 Updating address from coordinates: ${newAddress}, ${newCity}`);
    setForm(prev => ({
      ...prev,
      address: newAddress,
      city: newCity,
    }));
  };

  const handleCloseMap = () => {
    setShowLocationMap(false);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate age
    if (form.dateOfBirth) {
      const age = calculateAge(form.dateOfBirth);
      if (age < 18 || age > 65) {
        setError("You must be between 18 and 65 years old to donate blood.");
        setLoading(false);
        return;
      }
    }

    // Validate weight
    if (parseFloat(form.weight) < 50) {
      setError("You must weigh at least 50 kg to donate blood.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convert blood group format (A+ -> A_POSITIVE)
      const bloodGroupMap: Record<string, string> = {
        'A+': 'A_POSITIVE',
        'A-': 'A_NEGATIVE',
        'B+': 'B_POSITIVE',
        'B-': 'B_NEGATIVE',
        'AB+': 'AB_POSITIVE',
        'AB-': 'AB_NEGATIVE',
        'O+': 'O_POSITIVE',
        'O-': 'O_NEGATIVE',
      };

      // Use manual coordinates if user selected them, otherwise geocode
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (manualCoordinates) {
        // User manually selected coordinates from map
        latitude = manualCoordinates.lat;
        longitude = manualCoordinates.lng;
        console.log(`✅ Using manual coordinates: ${latitude}, ${longitude}`);
      } else if (form.address && form.city) {
        // Fallback to automatic geocoding
        const fullAddress = `${form.address}, ${form.city}`;
        console.log(`🔍 Attempting to geocode: "${fullAddress}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(fullAddress);
          
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
            console.log(`✅ Geocoded address: ${fullAddress} → ${coords.latitude}, ${coords.longitude}`);
          } else {
            console.log(`⚠️ Could not geocode address: ${fullAddress}`);
          }
        } catch (geocodeError) {
          console.error('Geocoding failed:', geocodeError);
        }
      } else if (form.city) {
        // Try geocoding just the city if no full address
        console.log(`🔍 Geocoding city only: "${form.city}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(form.city);
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
            console.log(`✅ Geocoded city: ${form.city} → ${coords.latitude}, ${coords.longitude}`);
          }
        } catch (geocodeError) {
          console.error('City geocoding failed:', geocodeError);
        }
      } else {
        console.log('⚠️ No address or city provided for geocoding');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/donors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          bloodGroup: bloodGroupMap[form.bloodGroup],
          dateOfBirth: form.dateOfBirth,
          weight: parseFloat(form.weight),
          location: form.city, // Use city as location
          city: form.city,
          address: form.address,
          latitude, // Add geocoded latitude
          longitude, // Add geocoded longitude
          medicalNotes: form.hasMedicalCondition === 'yes' ? form.medicalConditionDetails : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create donor profile');
      }

      // Update user data in localStorage
      const updatedUser = { ...user, isVerified: false }; // Keep as false until admin verifies
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Success! Redirect to verification request page
      router.push('/verification-request');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Droplet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Donor Profile</h1>
          <p className="text-gray-600">Welcome, {user.name}! Just a few more details to get started.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-green-600">Account Info</span>
            </div>
            <div className="w-16 h-1 bg-red-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-red-600">Medical Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Verification</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Step 2: Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-red-600" />
                  Required Medical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-gray-700">Blood Group *</Label>
                    <Select
                      value={form.bloodGroup}
                      onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                      required
                      disabled={loading}
                    >
                      <SelectTrigger id="bloodGroup" className="h-11">
                        <SelectValue placeholder="Select your blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <BirthdayPicker
                    id="dateOfBirth"
                    label="Date of Birth"
                    value={form.dateOfBirth}
                    onChange={(value) => setForm({ ...form, dateOfBirth: value })}
                    placeholder="Select your date of birth"
                    required
                    disabled={loading}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-700">Weight (kg) *</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="weight"
                        type="number"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        placeholder="70"
                        min="50"
                        step="0.1"
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Minimum 50 kg required</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationAutocomplete
                    id="city"
                    label="City"
                    value={form.city}
                    onChange={(value) => setForm({ ...form, city: value })}
                    placeholder="Start typing city name..."
                    required
                    disabled={loading}
                    className="text-gray-700"
                  />

                  <FullAddressAutocomplete
                    id="address"
                    label="Full Address"
                    value={form.address}
                    onChange={(value) => setForm({ ...form, address: value })}
                    placeholder="Street, area, or landmark..."
                    cityContext={form.city}
                    required
                    disabled={loading}
                    className="text-gray-700"
                  />

                  {/* Interactive Location Map */}
                  {showLocationMap && (
                    <div className="md:col-span-2">
                      <InteractiveLocationMap
                        address={form.address}
                        city={form.city}
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
              </div>

              {/* Medical Condition */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Medical History
                </h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-gray-700">Do you have any medical conditions? *</Label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value="no"
                          checked={form.hasMedicalCondition === 'no'}
                          onChange={(e) => setForm({ ...form, hasMedicalCondition: e.target.value, medicalConditionDetails: '' })}
                          className="w-4 h-4 text-red-600"
                          disabled={loading}
                          required
                        />
                        <span className="text-sm font-medium text-gray-700">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value="yes"
                          checked={form.hasMedicalCondition === 'yes'}
                          onChange={(e) => setForm({ ...form, hasMedicalCondition: e.target.value })}
                          className="w-4 h-4 text-red-600"
                          disabled={loading}
                          required
                        />
                        <span className="text-sm font-medium text-gray-700">Yes</span>
                      </label>
                    </div>
                  </div>

                  {form.hasMedicalCondition === 'yes' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="medicalConditionDetails" className="text-gray-700">
                        Please describe your medical condition(s) *
                      </Label>
                      <textarea
                        id="medicalConditionDetails"
                        value={form.medicalConditionDetails}
                        onChange={(e) => setForm({ ...form, medicalConditionDetails: e.target.value })}
                        placeholder="Please provide details about your medical condition(s)..."
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        required={form.hasMedicalCondition === 'yes'}
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500">
                        This information helps us ensure your safety during blood donation
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Eligibility Info */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Eligibility Requirements
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Age between 18-65 years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Weight at least 50 kg (110 lbs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Good general health condition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>No recent illness, surgery, or tattoos (within 6 months)</span>
                  </li>
                </ul>
              </div>

              {/* Confirmation */}
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 rounded border-gray-300" required disabled={loading} />
                <span className="text-sm text-gray-600">
                  I confirm that I meet all the eligibility requirements and the information provided is accurate.
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Completing Registration..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
