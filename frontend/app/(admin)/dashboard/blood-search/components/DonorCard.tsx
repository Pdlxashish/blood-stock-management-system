import { MapPin, Phone, Bell } from "lucide-react";
import { getCityCoordinates, getInitials, haversineKm } from "@/lib/data";

interface DonorCardProps {
  donor: any;
  clickedPos: { lat: number; lng: number } | null;
  onDonorClick: (donor: any) => void;
  onCall: (donorId: string, phoneNumber: string, donorName: string) => void;
  onNotify: (donorId: string, donorName: string) => void;
}

export function DonorCard({ donor, clickedPos, onDonorClick, onCall, onNotify }: DonorCardProps) {
  const name = donor.user?.name || 'Unknown Donor';
  const phoneNumber = donor.user?.phone || '';
  const fullAddress = donor.address || donor.location || donor.city || 'N/A';
  const bloodGroupDisplay = donor.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
  const lastDonation = donor.lastDonationDate 
    ? new Date(donor.lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';
  
  // Get coordinates for distance calculation
  let coords = donor.latitude && donor.longitude
    ? { lat: donor.latitude, lng: donor.longitude }
    : getCityCoordinates(donor.city || donor.location);
  
  // Normalize coordinate format (getCityCoordinates returns {latitude, longitude})
  if (coords && 'latitude' in coords) {
    coords = { lat: coords.latitude, lng: coords.longitude };
  }
  
  // Check if donor has precise coordinates
  const hasPreciseCoords = !!(donor.latitude && donor.longitude);
  const locationBadge = hasPreciseCoords 
    ? { text: 'Precise', color: 'bg-green-50 text-green-700 border-green-200' }
    : { text: 'Approx', color: 'bg-orange-50 text-orange-700 border-orange-200' };
  
  return (
    <div
      onClick={() => onDonorClick(donor)}
      className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
    >
      {/* Header with name and blood group */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-sm font-bold text-red-800 flex-shrink-0">
            {getInitials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate" title={name}>{name}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`px-2 py-0.5 border rounded text-[10px] font-medium ${locationBadge.color} flex-shrink-0`} title={hasPreciseCoords ? 'Exact location from interactive map' : 'Approximate location based on city'}>
                {locationBadge.text}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-500">{donor.totalDonations}× donated</span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm font-bold flex-shrink-0 ml-2">
          {bloodGroupDisplay}
        </span>
      </div>

      {/* Location - Full width with proper truncation */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-600 leading-relaxed break-words" title={fullAddress}>
              {fullAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span>Last: {lastDonation}</span>
        {clickedPos && coords && (
          <span className="text-red-800 font-semibold">
            {haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng).toFixed(1)} km away
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCall(donor.id, phoneNumber, name);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Phone size={12} /> Call
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNotify(donor.id, name);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-800 rounded-lg text-xs font-semibold text-white hover:bg-red-900 transition-colors"
        >
          <Bell size={12} /> Notify
        </button>
      </div>
    </div>
  );
}
