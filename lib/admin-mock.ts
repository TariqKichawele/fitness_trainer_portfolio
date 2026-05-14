/** Mock admin data — replace with Supabase queries when designs are approved. */

export type MockSessionType = {
  id: string;
  slug: string;
  title: string;
  category: string;
  defaultDurationMin: number;
  defaultMaxSlots: number;
  defaultPriceCents: number;
  isActive: boolean;
};

export type MockClient = {
  id: string;
  displayName: string;
  email: string;
  role: "user" | "client";
  status: "active" | "rejected" | "banned";
  joinedAt: string;
};

export type MockBooking = {
  id: string;
  clientName: string;
  sessionTitle: string;
  startsAt: string;
  status: "pending" | "confirmed" | "cancelled_by_client" | "cancelled_by_admin";
};

export const mockDashboardStats = {
  upcomingSessions: 14,
  activeClients: 38,
  openBookings: 6,
  revenueThisWeekCents: 124000,
} as const;

export const mockSessionTypes: MockSessionType[] = [
  {
    id: "1",
    slug: "strength-foundation",
    title: "Strength Foundation",
    category: "Strength",
    defaultDurationMin: 60,
    defaultMaxSlots: 12,
    defaultPriceCents: 2500,
    isActive: true,
  },
  {
    id: "2",
    slug: "mobility-reset",
    title: "Mobility Reset",
    category: "Mobility",
    defaultDurationMin: 45,
    defaultMaxSlots: 10,
    defaultPriceCents: 2000,
    isActive: true,
  },
  {
    id: "3",
    slug: "hiit-beach",
    title: "HIIT Beach",
    category: "Conditioning",
    defaultDurationMin: 50,
    defaultMaxSlots: 16,
    defaultPriceCents: 2200,
    isActive: false,
  },
];

export const mockClients: MockClient[] = [
  {
    id: "c1",
    displayName: "Jordan Lee",
    email: "jordan@example.com",
    role: "client",
    status: "active",
    joinedAt: "2026-04-02",
  },
  {
    id: "c2",
    displayName: "Sam Rivera",
    email: "sam@example.com",
    role: "client",
    status: "active",
    joinedAt: "2026-04-18",
  },
  {
    id: "c3",
    displayName: "Taylor Kim",
    email: "taylor@example.com",
    role: "user",
    status: "active",
    joinedAt: "2026-05-01",
  },
];

export const mockBookings: MockBooking[] = [
  {
    id: "b1",
    clientName: "Jordan Lee",
    sessionTitle: "Strength Foundation",
    startsAt: "2026-05-16T09:00:00Z",
    status: "confirmed",
  },
  {
    id: "b2",
    clientName: "Sam Rivera",
    sessionTitle: "Mobility Reset",
    startsAt: "2026-05-17T17:30:00Z",
    status: "pending",
  },
  {
    id: "b3",
    clientName: "Taylor Kim",
    sessionTitle: "HIIT Beach",
    startsAt: "2026-05-18T07:00:00Z",
    status: "cancelled_by_client",
  },
];
