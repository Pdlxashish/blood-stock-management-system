import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface GenerateCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donors: any[] | { data: any[] };
  events: any[];
  donorsLoading: boolean;
  isCreating: boolean;
  onCreateCertificate: (data: CertificateFormData) => void;
}

export interface CertificateFormData {
  type: "DONATION" | "VOLUNTEER";
  recipientId: string;
  recipientName: string;
  eventTitle: string;
  volunteerId: string;
  date: string;
}

export function GenerateCertificateDialog({
  open,
  onOpenChange,
  donors,
  events,
  donorsLoading,
  isCreating,
  onCreateCertificate,
}: GenerateCertificateDialogProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    type: "DONATION",
    recipientId: "",
    recipientName: "",
    eventTitle: "",
    volunteerId: "",
    date: new Date().toISOString().split('T')[0],
  });
  
  const [donorSearchQuery, setDonorSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDonorSelect = (donor: any) => {
    if (donor && donor.user) {
      setFormData({ ...formData, recipientId: donor.user.id, recipientName: donor.user.name });
      setDonorSearchQuery(donor.user.name);
      setSelectedDonor(donor);
      setShowSearchResults(false);
    }
  };
  
  // Filter donors based on search query
  const filteredDonors = (() => {
    const donorsArray = Array.isArray(donors) ? donors : donors?.data || [];
    if (!donorSearchQuery.trim()) return donorsArray;
    
    const query = donorSearchQuery.toLowerCase();
    return donorsArray.filter((d) => 
      d.user?.name?.toLowerCase().includes(query) || 
      d.bloodGroup?.toLowerCase().includes(query)
    );
  })();

  const handleCreate = () => {
    if (!formData.recipientName.trim()) {
      toast.error("Recipient name is required");
      return;
    }
    
    if (!formData.recipientId.trim()) {
      toast.error("Please select a recipient");
      return;
    }
    
    if (formData.type === "VOLUNTEER" && !formData.eventTitle.trim()) {
      toast.error("Event title is required for volunteer certificates");
      return;
    }

    onCreateCertificate(formData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        type: "DONATION",
        recipientId: "",
        recipientName: "",
        eventTitle: "",
        volunteerId: "",
        date: new Date().toISOString().split('T')[0],
      });
      setDonorSearchQuery("");
      setShowSearchResults(false);
      setSelectedDonor(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md z-[10000]">
        <DialogHeader>
          <DialogTitle>Generate New Certificate</DialogTitle>
          <DialogDescription>
            Create a donation certificate or volunteer ID card for a recipient
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-semibold text-slate-700">Certificate Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v) => setFormData({ ...formData, type: v as "DONATION" | "VOLUNTEER" })}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value="DONATION">Donation Certificate</SelectItem>
                <SelectItem value="VOLUNTEER">Volunteer Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-700">Recipient</Label>
            <div className="space-y-2 mt-1.5 relative" ref={searchContainerRef}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name or blood group..."
                  value={donorSearchQuery}
                  onChange={(e) => {
                    setDonorSearchQuery(e.target.value);
                    setShowSearchResults(true);
                    if (!e.target.value.trim()) {
                      setSelectedDonor(null);
                      setFormData({ ...formData, recipientId: "", recipientName: "" });
                    }
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Instant Search Results Dropdown */}
              {showSearchResults && donorSearchQuery.trim() && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[10001]">
                  {filteredDonors.length === 0 ? (
                    <div className="p-4 text-sm text-center text-gray-500">
                      No donors found matching "{donorSearchQuery}"
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredDonors.map((donor) => (
                        <button
                          key={donor.id}
                          type="button"
                          onClick={() => handleDonorSelect(donor)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedDonor?.id === donor.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {donor.user?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {donor.bloodGroup} • {donor.location || 'No location'}
                              </p>
                            </div>
                            <div className="ml-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {donor.bloodGroup}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Selected Donor Display */}
              {selectedDonor && !showSearchResults && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">
                        {selectedDonor.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDonor.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedDonor.bloodGroup} • Selected
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDonor(null);
                      setDonorSearchQuery("");
                      setFormData({ ...formData, recipientId: "", recipientName: "" });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Change
                  </Button>
                </div>
              )}
              
              {/* Search Helper Text */}
              {!selectedDonor && !donorSearchQuery && (
                <p className="text-xs text-gray-500">
                  Start typing to search for donors by name or blood group
                </p>
              )}
            </div>
          </div>
          
          {formData.type === "VOLUNTEER" && (
            <div>
              <Label className="text-sm font-semibold text-slate-700">Event</Label>
              <Select 
                value={formData.eventTitle} 
                onValueChange={(v) => setFormData({ ...formData, eventTitle: v })}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent className="z-[10001]">
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.title}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-semibold text-slate-700">Date</Label>
            <Input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
              className="mt-1.5" 
            />
          </div>
          
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || donorsLoading}
            className="w-full bg-red-800 hover:bg-red-900 disabled:opacity-50"
          >
            {isCreating ? "Generating..." : "Generate Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
