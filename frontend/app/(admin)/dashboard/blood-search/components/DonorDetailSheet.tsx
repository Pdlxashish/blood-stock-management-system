import { X, Droplets, Award, Phone, MapPin, Calendar, User, ChevronRight, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCityCoordinates, getInitials, getDonorTier, haversineKm } from "@/lib/data";

interface DonorDetailSheetProps {
  donor: any | null;
  clickedPos: { lat: number; lng: number } | null;
  onClose: () => void;
  onCall: (donorId: string, phoneNumber: string, donorName: string) => void;
  onNotify: (donorId: string, donorName: string) => void;
}

export function DonorDetailSheet({ donor, clickedPos, onClose, onCall, onNotify }: DonorDetailSheetProps) {
  const router = useRouter();

  if (!donor) return null;

  const name = donor.user?.name || 'Unknown Donor';
  const phone = donor.user?.phone || 'N/A';
  const fullAddress = donor.address || donor.location || donor.city || 'N/A';
  const bloodGroupDisplay = donor.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
  const lastDonation = donor.lastDonationDate 
    ? new Date(donor.lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';
  
  const tier = getDonorTier(donor.totalDonations);
  
  // Get coordinates for distance calculation
  let coords = donor.latitude && donor.longitude
    ? { lat: donor.latitude, lng: donor.longitude }
    : getCityCoordinates(donor.city || donor.location);
  
  // Normalize coordinate format (getCityCoordinates returns {latitude, longitude})
  if (coords && 'latitude' in coords) {
    coords = { lat: coords.latitude, lng: coords.longitude };
  }
  
  const dist = clickedPos && coords
    ? haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng)
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-end z-[9999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="relative bg-gradient-to-br from-red-800 via-red-900 to-red-950 p-6 pb-10 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full bg-white/10 border-[3px] border-white/25 flex items-center justify-center text-[26px] font-bold text-white mx-auto mb-3">
            {getInitials(name)}
          </div>

          <h2 className="text-xl font-bold text-white mb-2.5">{name}</h2>

          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 bg-white/15 border border-white/25 rounded-full px-2.5 py-1 text-xs font-bold text-white">
              <Droplets size={11} /> {bloodGroupDisplay}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold bg-white ${tier.styles}`}>
              <Award size={11} /> {tier.label} Donor
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-around bg-white border border-slate-100 rounded-xl mx-4 -mt-5 p-4 shadow-lg relative z-10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-red-800">{donor.totalDonations}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Donations</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-red-800">{donor.totalDonations * 450} ml</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Blood Given</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <span className={`text-lg font-bold ${dist != null ? "text-red-800" : "text-slate-400"}`}>
              {dist != null ? `${dist.toFixed(1)} km` : "—"}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Distance</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Contact Information
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
              {[
                { icon: <Phone size={13} className="text-red-800" />, label: "Phone", value: phone },
                { icon: <MapPin size={13} className="text-red-800" />, label: "Full Address", value: fullAddress },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-[30px] h-[30px] rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs text-slate-500">{row.label}</span>
                      <span className="block text-sm font-semibold text-slate-900 break-words">{row.value}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-slate-100 mx-3" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Donation History
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
              {[
                { icon: <Calendar size={13} className="text-red-800" />, label: "Last Donation", value: lastDonation },
                { icon: <Droplets size={13} className="text-red-800" />, label: "Blood Group", value: bloodGroupDisplay },
                { icon: <Award size={13} className="text-red-800" />, label: "Total Donations", value: String(donor.totalDonations), highlight: true },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-[30px] h-[30px] rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs text-slate-500">{row.label}</span>
                      <span className={`block text-sm font-semibold truncate ${row.highlight ? "text-red-800" : "text-slate-900"}`}>
                        {row.value}
                      </span>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-slate-100 mx-3" />}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                router.push(`/dashboard/donors/${donor.id}`);
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              <User size={14} /> View Full Profile
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onCall(donor.id, phone, name)}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Phone size={14} /> Call
              </button>
              <button
                onClick={() => onNotify(donor.id, name)}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Bell size={14} /> Notify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
