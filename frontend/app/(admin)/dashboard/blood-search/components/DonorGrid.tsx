import { Droplets } from "lucide-react";
import { DonorCard } from "./DonorCard";

interface DonorGridProps {
  donors: any[];
  isLoading: boolean;
  clickedPos: { lat: number; lng: number } | null;
  onDonorClick: (donor: any) => void;
  onCall: (donorId: string, phoneNumber: string, donorName: string) => void;
  onNotify: (donorId: string, donorName: string) => void;
}

export function DonorGrid({ donors, isLoading, clickedPos, onDonorClick, onCall, onNotify }: DonorGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-900">
          {clickedPos ? 'Donors Within Radius' : 'All Available Donors'}
        </h2>
        <span className="text-sm text-slate-600">{donors.length} found</span>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-slate-200 border-t-red-800 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading donors...</p>
          </div>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Droplets size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No donors found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or radius</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {donors.map((donor) => (
            <DonorCard
              key={donor.id}
              donor={donor}
              clickedPos={clickedPos}
              onDonorClick={onDonorClick}
              onCall={onCall}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}
    </div>
  );
}
