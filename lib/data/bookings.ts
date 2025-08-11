export type BookingStatus = "confirmed" | "pending" | "cancelled" | "checked_in" | "checked_out"

export type Booking = {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  total: number
  status: BookingStatus
  source: "Website" | "Mobile App" | "Travel Agency" | "Walk-in"
}

export const bookings: Booking[] = [
  {
    id: "BL-10234",
    guestName: "Sarah Johnson",
    checkIn: "2025-08-12",
    checkOut: "2025-08-15",
    nights: 3,
    total: 780,
    status: "confirmed",
    source: "Website",
  },
  {
    id: "BL-10235",
    guestName: "Michael Chen",
    checkIn: "2025-08-18",
    checkOut: "2025-08-20",
    nights: 2,
    total: 2200,
    status: "pending",
    source: "Travel Agency",
  },
  {
    id: "BL-10236",
    guestName: "Emily Rodriguez",
    checkIn: "2025-08-10",
    checkOut: "2025-08-12",
    nights: 2,
    total: 300,
    status: "checked_out",
    source: "Website",
  },
  {
    id: "BL-10237",
    guestName: "David Mitchell",
    checkIn: "2025-08-14",
    checkOut: "2025-08-17",
    nights: 3,
    total: 1500,
    status: "confirmed",
    source: "Mobile App",
  },
  {
    id: "BL-10238",
    guestName: "Anna Smith",
    checkIn: "2025-08-11",
    checkOut: "2025-08-13",
    nights: 2,
    total: 500,
    status: "cancelled",
    source: "Walk-in",
  },
  {
    id: "BL-10239",
    guestName: "Robert Brown",
    checkIn: "2025-08-16",
    checkOut: "2025-08-19",
    nights: 3,
    total: 1800,
    status: "checked_in",
    source: "Website",
  },
]


