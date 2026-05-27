import type { ReactNode } from "react";
import type { EventStatus } from "@/lib/queries/events";

export interface EventFormState {
  title: string;
  eventDate: string;
  location: string;
  description: string;
  status: EventStatus;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  banner?: File | null;
  poster?: File | null;
}

export interface StatusConfigItem {
  label: string;
  styles: string;
  icon: ReactNode;
  barColor: string;
}
