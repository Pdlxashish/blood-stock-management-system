import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, MapPin } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { EventStatus } from "@/lib/queries/events";
import type { EventFormState } from "./types";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const ALL_STATUSES: EventStatus[] = ["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"];

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: EventFormState;
  onFormChange: (nextForm: EventFormState) => void;
  onCreate: () => void;
  isCreating?: boolean;
}

export function EventCreateDialog({ open, onOpenChange, form, onFormChange, onCreate, isCreating = false }: EventCreateDialogProps) {
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFormChange({ ...form, banner: file });
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFormChange({ ...form, poster: file });
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    onFormChange({ 
      ...form, 
      latitude: lat, 
      longitude: lng, 
      location: address 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new blood donation event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="event-title">Title <span className="text-red-600">*</span></Label>
            <Input
              id="event-title"
              type="text"
              placeholder="Event title"
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event-date">Date <span className="text-red-600">*</span></Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={form.eventDate}
                onChange={(event) => onFormChange({ ...form, eventDate: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => onFormChange({ ...form, status: value as EventStatus })}
              >
                <SelectTrigger id="event-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location with Map Picker */}
          <div>
            <Label htmlFor="event-location">
              Location <span className="text-red-600">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="event-location"
                type="text"
                placeholder="Venue / Address"
                value={form.location}
                onChange={(event) => onFormChange({ ...form, location: event.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMapPicker(!showMapPicker)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {showMapPicker ? 'Hide Map' : 'Pick on Map'}
              </Button>
            </div>
            {form.latitude && form.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {showMapPicker && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <MapPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          )}

          <div>
            <Label htmlFor="event-capacity">Capacity</Label>
            <Input
              id="event-capacity"
              type="number"
              placeholder="Max participants"
              value={form.capacity ?? ""}
              onChange={(event) => onFormChange({ ...form, capacity: event.target.value ? parseInt(event.target.value) : undefined })}
            />
          </div>

          {/* Banner Upload */}
          <div>
            <Label htmlFor="event-banner">Event Banner</Label>
            <div className="mt-2">
              {bannerPreview ? (
                <div className="relative">
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-40 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setBannerPreview(null);
                      onFormChange({ ...form, banner: null });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="event-banner"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload banner</span>
                  <input
                    id="event-banner"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Poster Upload */}
          <div>
            <Label htmlFor="event-poster">Event Poster</Label>
            <div className="mt-2">
              {posterPreview ? (
                <div className="relative">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-40 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPosterPreview(null);
                      onFormChange({ ...form, poster: null });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="event-poster"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload poster</span>
                  <input
                    id="event-poster"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Optional details about the event…"
              value={form.description}
              onChange={(event) => onFormChange({ ...form, description: event.target.value })}
            />
          </div>

          <Button 
            type="button" 
            onClick={onCreate} 
            disabled={isCreating}
            className="w-full bg-red-800 text-white hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating Event..." : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
