import React from 'react';
import { 
  FiWifi, FiCoffee, FiShield, FiBriefcase, FiThermometer, 
  FiBell, FiTv, FiHome, FiWind, FiLayers,  
} from 'react-icons/fi';
import { FaChalkboardTeacher, FaBriefcase  } from "react-icons/fa";
import { 
  MdLocalLaundryService, MdRestaurant, MdEvent, 
  MdBusinessCenter, MdSmokeFree, MdMedicalServices 
} from 'react-icons/md';
import { 
  FaParking, FaBed, FaBath, FaGlassCheers, 
  FaBirthdayCake, FaMicrophone, FaSwimmingPool 
} from 'react-icons/fa';
import { GiOfficeChair, GiPartyFlags, GiSofa } from 'react-icons/gi';
import { BiDrink } from 'react-icons/bi';

const PropertyAmenities = () => {
  const propertyAmenities = [
    { 
      id: 'parking', 
      name: 'Private Parking', 
      icon: <FaParking className="text-blue-500 text-xl" />,
      description: 'Complimentary secured parking for all guests'
    },
    { 
      id: 'wifi', 
      name: 'High-Speed WiFi', 
      icon: <FiWifi className="text-blue-500 text-xl" />,
      description: 'Free unlimited high-speed internet throughout property'
    },
    { 
      id: 'breakfast', 
      name: 'Complimentary Breakfast', 
      icon: <FiCoffee className="text-blue-500 text-xl" />,
      description: 'Daily buffet breakfast included with stay'
    },
    { 
      id: 'security', 
      name: '24/7 Security', 
      icon: <FiShield className="text-blue-500 text-xl" />,
      description: 'Round-the-clock security and reception'
    },
  {
      id: 'conference',
      name: 'Conference Facilities',
      icon: <FaChalkboardTeacher className="text-blue-500 text-xl" />,
        description: 'Ideal spaces for meetings, seminars, & corporate gatherings',
    },
     {
      id: 'business-center',
      name: 'Business Center with Internet Access',
      description: 'Stay productive with access to professional business facilities',
      icon: <FaBriefcase className="text-blue-500 text-xl" />,
    },
   
  ];

  const roomAmenities = [
    { 
      id: 'ac', 
      name: 'Air Conditioning', 
      icon: <FiThermometer className="text-green-500 text-xl" />,
      description: 'Individually controlled climate system'
    },
    { 
      id: 'tv', 
      name: 'Smart TV', 
      icon: <FiTv className="text-green-500 text-xl" />,
      description: '40" flat-screen with streaming services'
    },
    { 
      id: 'beds', 
      name: 'Premium Beds', 
      icon: <FaBed className="text-green-500 text-xl" />,
      description: 'Orthopedic mattresses for perfect sleep'
    },
    { 
      id: 'bathroom', 
      name: 'Luxury Bathroom', 
      icon: <FaBath className="text-green-500 text-xl" />,
      description: 'Rain shower with premium Bathtubs'
    },
  {
    id:'wifi',
    name: 'WiFi',
    icon:<FiWifi className="text-green-500 text-xl"/>,
    description:'Free unlimited high-speed internet throughout property'
  },
    { 
      id: 'service', 
      name: '24/7 Room Service', 
      icon: <FiBell className="text-green-500 text-xl" />,
      description: 'All-day dining available in your room'
    }
  ];

  const eventAmenities = [
    { 
      id: 'corporate', 
      name: 'Corporate Events', 
      icon: <GiOfficeChair className="text-purple-500 text-xl" />,
      description: 'Professional setup for meetings and conferences'
    },
    { 
      id: 'weddings', 
      name: 'Weddings', 
      icon: <FaGlassCheers className="text-purple-500 text-xl" />,
      description: 'Elegant spaces for memorable weddings'
    },
    { 
      id: 'conferences', 
      name: 'Conferences', 
      icon: <FaMicrophone className="text-purple-500 text-xl" />,
      description: 'State-of-the-art AV equipment available'
    },
    { 
      id: 'banquet', 
      name: 'Banquet Hall', 
      icon: <MdEvent className="text-purple-500 text-xl" />,
      description: 'Spacious hall for up to 300 guests'
    },
    { 
      id: 'catering', 
      name: 'In-house Catering', 
      icon: <MdRestaurant className="text-purple-500 text-xl" />,
      description: 'Custom menus for all occasions'
    },
    { 
      id: 'planning', 
      name: 'Event Planning', 
      icon: <GiPartyFlags className="text-purple-500 text-xl" />,
      description: 'Dedicated coordinator for your event'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-inter">
      {/* Header */}
      

      {/* Property Amenities Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-1">Property Features</h3>
          <p className="text-gray-500 text-xs sm:text-sm">Facilities available throughout our property</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyAmenities.map((amenity) => (
            <div 
              key={amenity.id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-200 transition-all hover:shadow-sm flex items-start space-x-4"
            >
              <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
                {amenity.icon}
              </div>
              <div>
                <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-1">{amenity.name}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm ">{amenity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Amenities Section */}
      <div className="space-y-6">
        <div className="text-center">
           <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-1">Room Amenities</h3>
          <p className="text-gray-500 text-xs sm:text-sm">Comforts and conveniences in your private space</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomAmenities.map((amenity) => (
            <div 
              key={amenity.id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-green-200 transition-all hover:shadow-sm flex items-start space-x-4"
            >
              <div className="bg-green-50 p-3 rounded-lg flex-shrink-0">
                {amenity.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{amenity.name}</h4>
                <p className="text-sm text-gray-600 mt-1 text-xs sm:text-sm">{amenity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default PropertyAmenities;
