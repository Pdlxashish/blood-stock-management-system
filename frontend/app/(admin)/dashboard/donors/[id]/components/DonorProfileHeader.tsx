import { ArrowLeft, CheckCircle, Droplets, Home, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { DonorProfile, RegistrationInfo } from "./types";

interface DonorProfileHeaderProps {
  donor: DonorProfile;
  name: string;
  bloodGroup: string;
  age: number | null;
  registrationInfo: RegistrationInfo;
  onBack: () => void;
}

export function DonorProfileHeader({
  donor,
  name,
  bloodGroup,
  age,
  registrationInfo,
  onBack,
}: DonorProfileHeaderProps) {
  const isVerified = donor.user?.isVerified || false;

  return (
    <>
      <div className="mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 text-xs">
                <Home size={12} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/donors" className="text-xs">
                Donors
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-2 h-9 px-3 -ml-2" size="sm">
          <ArrowLeft size={16} />
          Back to Donors
        </Button>
      </div>

      <div className="mb-5 overflow-hidden border-0 shadow-md card">
        <div className="bg-gradient-to-r from-[#7F1D1D] to-[#991B1B] px-5 py-6">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/30 bg-white/20">
              <span className="text-3xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <h1 className="truncate text-2xl font-bold text-white">{name}</h1>
                {isVerified && (
                  <Badge className="flex-shrink-0 bg-green-500 hover:bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
                <div className="flex items-center gap-1.5">
                  <Droplets size={14} />
                  <span className="font-semibold">{bloodGroup}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span className="truncate">{donor.city || donor.location || "N/A"}</span>
                </div>
                {age && (
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>{age} years old</span>
                  </div>
                )}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">
                <span className="text-sm">{registrationInfo.icon}</span>
                <span className="text-xs font-medium text-white/90">{registrationInfo.label}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="mb-1 text-sm text-white/80">Total Donations</div>
              <div className="text-4xl font-bold text-white">{donor.totalDonations}</div>
              <div className="text-xs text-white/80">Lifetime donations</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
