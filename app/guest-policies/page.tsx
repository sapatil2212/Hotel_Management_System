"use client"

import { useHotel } from "@/contexts/hotel-context"
import Link from "next/link"

export default function GuestPoliciesPage() {
  const { hotelInfo } = useHotel()
  const content = hotelInfo.guestPolicies?.trim()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Guest Policies</h1>
          <p className="text-slate-600 mt-2">Please review our policies to ensure a smooth and comfortable stay.</p>
        </div>

        {/* Dynamic content from backend if available */}
        {content ? (
          <div className="prose prose-slate max-w-none bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <pre className="whitespace-pre-wrap font-sans text-slate-700 text-[15px] leading-7">{content}</pre>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2>General Booking Policy</h2>
          <p>Travel guidelines may vary based on destination and season; guests are responsible for complying with all applicable laws.</p>
          <p>Booking-specific policies will be informed at the time of reservation or check-in.</p>
          <p>For booking assistance, modifications, or cancellations, please contact our customer support team.</p>

          <h2>Check-in & Identification</h2>
          <ul>
            <li>The primary guest must be at least 18 years old.</li>
            <li>Standard check-in time is 12:00 PM; check-out is at 11:00 AM (unless otherwise stated in your booking).</li>
            <li>Valid government-approved photo ID (Aadhar Card, Passport, Voter ID, or Driving License) is required for all guests above 18 years. PAN cards are not accepted.</li>
            <li>Without a valid ID, check-in will be denied.</li>
          </ul>

          <h2>Early Check-in / Late Check-out</h2>
          <ul>
            <li>Early Check-in: Subject to availability and may incur additional charges.</li>
            <li>Late Check-out: Subject to availability; charges may apply.</li>
          </ul>

          <h2>Booking Extension</h2>
          <p>Extensions are subject to room availability and prevailing rates at the time of request.</p>

          <h2>Cancellation Policy</h2>
          <ul>
            <li>Cancellations can be made via our website, app, or customer support. Refunds (if applicable) will be processed within 7–14 working days.</li>
            <li>Bookings from unmarried couples or guests with local ID may be denied at the discretion of the property without refund.</li>
            <li>No-shows or failure to meet check-in requirements will result in forfeiture of booking amount.</li>
          </ul>

          <h2>Occupancy & Visitors</h2>
          <ul>
            <li>Triple occupancy may be allowed with an extra mattress at an additional charge.</li>
            <li>Visitors are generally allowed during the day; overnight stays are not permitted. Visitor ID is required.</li>
          </ul>

          <h2>Child Policy</h2>
          <ul>
            <li>One child up to 5 years of age can stay free without an extra mattress.</li>
            <li>Breakfast charges may apply for the child.</li>
          </ul>

          <h2>Pet Policy (Applicable at select properties)</h2>
          <ul>
            <li>Only vaccinated pet cats or dogs are allowed (certificate required).</li>
            <li>Maximum 1 pet per booking. Pets must be leashed in public areas.</li>
            <li>Pets are not allowed on beds, in swimming pools, or restaurants.</li>
            <li>Additional cleaning/damage charges may apply.</li>
          </ul>

          <h2>Code of Conduct</h2>
          <ul>
            <li>Illegal activities, disorderly behavior, and property damage are strictly prohibited.</li>
            <li>Guests are responsible for maintaining cleanliness and hygiene.</li>
            <li>Alcohol consumption is restricted to permitted areas; smoking rules vary by property.</li>
            <li>Drug use is strictly prohibited and will be reported to authorities.</li>
          </ul>

          <h2>Safety & Security</h2>
          <ul>
            <li>Follow fire safety and emergency instructions provided by staff.</li>
            <li>The property is not liable for lost, stolen, or damaged belongings.</li>
          </ul>

          <h2>Contact & Communication</h2>
          <ul>
            <li>Guests may be contacted before arrival for confirmation of stay. Non-response may lead to cancellation.</li>
            <li>Feedback requests may be shared post-stay to improve service quality.</li>
          </ul>

          <h2>Fraud Awareness</h2>
          <ul>
            <li>Payments should only be made via secure, authorized channels.</li>
            <li>The property is not responsible for losses due to payments made through unauthorized methods.</li>
          </ul>

          <h2>Grievances</h2>
          <p>For assistance during your stay, please contact the front desk or customer support immediately. Post check-out complaints may not be entertained.</p>
        </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link href="/rooms" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to Rooms</Link>
          <span className="text-xs text-slate-500">Last updated: {hotelInfo.updatedAt ? new Date(hotelInfo.updatedAt).toLocaleDateString() : "—"}</span>
        </div>
      </div>
    </div>
  )
}


