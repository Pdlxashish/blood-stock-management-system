"use client";

import { Award, Calendar, CalendarDays, Building2, Droplets, Heart, MapPin, Users, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDonationsByUser } from "@/lib/queries/donations";
import { DonationRecord, DonorProfile } from "./types";

const DonorMap = dynamic(() => import("@/components/DonorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-75 items-center justify-center rounded-lg bg-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  ),
});

interface DonationHistoryListProps {
  userId: string;
}

function DonationHistoryList({ userId }: DonationHistoryListProps) {
  return <DonationHistoryListInner userId={userId} />;
}

function DonationHistoryListInner({ userId }: DonationHistoryListProps) {
  const { data: donations, isLoading } = useDonationsByUser(userId);
  const donationItems = (donations || []) as DonationRecord[];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (donationItems.length === 0) {
    return (
      <div className="py-8 text-center">
        <Heart className="mx-auto mb-3 h-12 w-12 text-slate-300" />
        <p className="text-sm text-slate-600">No donation history yet</p>
      </div>
    );
  }

  const formatBloodGroup = (bg: string) => {
    const mapping: Record<string, string> = {
      A_POSITIVE: "A+",
      A_NEGATIVE: "A-",
      B_POSITIVE: "B+",
      B_NEGATIVE: "B-",
      AB_POSITIVE: "AB+",
      AB_NEGATIVE: "AB-",
      O_POSITIVE: "O+",
      O_NEGATIVE: "O-",
    };

    return mapping[bg] || bg;
  };

  const getCollectionTypeIcon = (type: string) => {
    if (type === "EVENT") return <CalendarDays className="h-4 w-4" />;
    if (type === "ORGANIZATION") return <Building2 className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const getCollectionTypeLabel = (type: string) => {
    if (type === "EVENT") return "Event";
    if (type === "ORGANIZATION") return "Organization";
    return "Walk-in";
  };

  const getCollectionTypeBadge = (type: string) => {
    if (type === "EVENT") return "bg-blue-100 text-blue-800 border-blue-200";
    if (type === "ORGANIZATION") return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getContactPerson = (notes: string | undefined | null) => {
    if (!notes) return null;
    const match = notes.match(/Contact:\s*(.+)$/);
    return match ? match[1] : null;
  };

  const getOrganizationName = (notes: string | undefined | null) => {
    if (!notes) return null;
    const match = notes.match(/Bulk collection from\s+(.+?)\s*-\s*Contact:/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-2.5 max-h-112.5 overflow-y-auto">
      {donationItems.map((donation, index: number) => {
        const contactPerson = getContactPerson(donation.notes);
        const orgName = getOrganizationName(donation.notes);

        return (
          <div
            key={donation.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
          >
            <div className="flex flex-1 items-start gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Droplets className="h-4 w-4 text-[#7F1D1D]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">Donation #{(donations?.length || 0) - index}</p>
                  <Badge variant="outline" className={`text-xs ${getCollectionTypeBadge(donation.location || "WALK_IN")}`}>
                    {getCollectionTypeIcon(donation.location || "WALK_IN")}
                    <span className="ml-1">{getCollectionTypeLabel(donation.location || "WALK_IN")}</span>
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(donation.donationDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      {donation.units} unit{donation.units > 1 ? "s" : ""}
                    </span>
                  </div>
                  {(orgName || contactPerson) && (
                    <div className="text-xs text-slate-700">
                      {orgName && <span className="font-medium">🏢 {orgName}</span>}
                      {contactPerson && (
                        <span className="ml-2">
                          👤 <span className="font-medium">{contactPerson}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {donation.notes && !orgName && !contactPerson && (
                    <span className="truncate text-xs text-slate-600" title={donation.notes}>
                      📝 {donation.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-xs font-bold">
                {formatBloodGroup(donation.bloodGroup)}
              </Badge>
              <span className="text-xs capitalize text-slate-500">{donation.status.toLowerCase()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DonorProfileActivityProps {
  donor: DonorProfile;
  name: string;
  bloodGroup: string;
  coordinates: { lat: number; lng: number } | null;
  hasLocation: boolean;
  hasPreciseLocation: boolean;
}

export function DonorProfileActivity({ donor, name, bloodGroup, coordinates, hasLocation, hasPreciseLocation }: DonorProfileActivityProps) {
  return (
    <div className="space-y-5 lg:col-span-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-linear-to-br from-red-50 to-white">
          <CardContent className="px-4 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Total Donations</p>
                <p className="text-2xl font-bold text-[#7F1D1D]">{donor.totalDonations}</p>
                <p className="mt-0.5 text-xs text-slate-500">Blood donation sessions</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7F1D1D]/10">
                <Droplets className="h-6 w-6 text-[#7F1D1D]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-linear-to-br from-pink-50 to-white">
          <CardContent className="px-4 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Blood Donated</p>
                <p className="text-2xl font-bold text-[#7F1D1D]">
                  {donor.totalDonations * 450}
                  <span className="ml-1 text-base">ml</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Approximately</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-linear-to-br from-amber-50 to-white">
          <CardContent className="px-4 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Total Donations</p>
                <p className="text-2xl font-bold text-amber-700">{donor.totalDonations}</p>
                <p className="mt-0.5 text-xs text-slate-500">Lifetime contributions</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="px-4 pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7F1D1D]/10">
              <Calendar className="h-3.5 w-3.5 text-[#7F1D1D]" />
            </div>
            Donation History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {donor.totalDonations === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Heart className="h-7 w-7 text-slate-300" />
              </div>
              <p className="mb-1 text-sm font-medium text-slate-600">No donation history yet</p>
              <p className="text-xs text-slate-500">This donor hasn&apos;t made any donations</p>
            </div>
          ) : (
            <DonationHistoryList userId={donor.userId} />
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="px-4 pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7F1D1D]/10">
              <MapPin className="h-3.5 w-3.5 text-[#7F1D1D]" />
            </div>
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {hasLocation && coordinates ? (
            <div className="relative">
              <DonorMap
                latitude={coordinates.lat}
                longitude={coordinates.lng}
                donorName={name}
                bloodGroup={bloodGroup}
                donorType={donor.donorType}
              />
              <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">{donor.city || donor.location || "Location"}</span>
                  {!hasPreciseLocation && (
                    <span className="text-slate-400">(Approximate location based on city)</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-70 items-center justify-center rounded-lg border border-slate-200 bg-slate-100">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200">
                  <MapPin className="h-7 w-7 text-slate-400" />
                </div>
                <p className="mb-1 text-sm font-medium text-slate-600">Location not available</p>
                <p className="text-xs text-slate-500">{donor.city || donor.location || "No location data"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
