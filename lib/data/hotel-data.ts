

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
  hours: string;
  price?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  bio: string;
}



export const services: Service[] = [
  {
    id: '1',
    name: 'Luxury Spa & Wellness',
    description: 'Rejuvenate your mind, body, and soul at our world-class spa. Our expert therapists offer a range of treatments using premium products and ancient wellness techniques.',
    icon: 'Waves',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
    features: ['Massage Therapy', 'Facial Treatments', 'Aromatherapy', 'Steam Room', 'Sauna', 'Meditation Garden'],
    hours: '6:00 AM - 10:00 PM',
    price: 'From $120'
  },
  {
    id: '2',
    name: 'Fine Dining Restaurant',
    description: 'Experience culinary excellence at our signature restaurant. Our award-winning chefs create innovative dishes using the finest local and international ingredients.',
    icon: 'ChefHat',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    features: ['Michelin-starred Chef', 'Wine Pairing', 'Private Dining', 'Tasting Menu', 'Live Cooking Shows'],
    hours: '6:30 AM - 11:00 PM',
    price: 'À la carte'
  },
  {
    id: '3',
    name: 'Conference & Events',
    description: 'Host memorable events in our state-of-the-art conference facilities. From intimate meetings to grand celebrations, we provide comprehensive event management services.',
    icon: 'Users',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    features: ['Modern AV Equipment', 'Flexible Layouts', 'Catering Services', 'Event Coordination', 'Valet Parking'],
    hours: '24/7 Available',
    price: 'Custom packages'
  },
  {
    id: '4',
    name: 'Infinity Pool & Deck',
    description: 'Relax and unwind at our stunning rooftop infinity pool with panoramic city views. Complete with poolside service and comfortable lounging areas.',
    icon: 'Waves',
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    features: ['Infinity Edge Design', 'Panoramic Views', 'Poolside Bar', 'Comfortable Loungers', 'Towel Service'],
    hours: '5:00 AM - 11:00 PM',
    price: 'Complimentary for guests'
  },
  {
    id: '5',
    name: 'Fitness Center',
    description: 'Maintain your fitness routine in our fully-equipped gym featuring the latest exercise equipment and personal training services.',
    icon: 'Dumbbell',
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg',
    features: ['Latest Equipment', 'Personal Trainers', 'Group Classes', 'Yoga Studio', 'Changing Rooms'],
    hours: '24/7 Access',
    price: 'Complimentary for guests'
  },
  {
    id: '6',
    name: 'Concierge Services',
    description: 'Our dedicated concierge team is available to assist with reservations, tours, transportation, and any special requests to enhance your stay.',
    icon: 'Bell',
    image: 'https://images.pexels.com/photos/618613/pexels-photo-618613.jpeg',
    features: ['Tour Bookings', 'Restaurant Reservations', 'Transportation', 'Ticket Services', 'Local Recommendations'],
    hours: '24/7 Available',
    price: 'Complimentary service'
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Victoria Sterling',
    position: 'General Manager',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'With over 15 years in luxury hospitality, Victoria leads our team with passion for excellence and guest satisfaction.'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    position: 'Executive Chef',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    bio: 'Marcus brings Michelin-starred experience to our kitchen, creating innovative dishes that celebrate local and international cuisines.'
  },
  {
    id: '3',
    name: 'Isabella Rodriguez',
    position: 'Spa Director',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Isabella curates our wellness experiences with expertise in holistic therapies and luxury spa management.'
  },
  {
    id: '4',
    name: 'James Mitchell',
    position: 'Guest Relations Manager',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    bio: 'James ensures every guest receives personalized attention and memorable experiences throughout their stay.'
  }
];