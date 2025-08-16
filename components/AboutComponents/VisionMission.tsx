import { Target, Eye, Gem, HeartHandshake, Award, Sparkles, Leaf, UserRound } from "lucide-react";

export default function VisionMission() {
  const cards = [
    {
      icon: <Eye className="w-6 h-6" strokeWidth={1.5} />,
      title: "Our Vision",
      content: "To become a trusted and preferred hospitality destination in Pune by delivering warm service, exceptional comfort, and memorable experiences.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <Target className="w-6 h-6" strokeWidth={1.5} />,
      title: "Our Mission",
      content: "To provide every guest with superior hospitality, personalized care, and a welcoming atmosphere through our commitment to quality, service, and integrity.",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter rounded-[25px] sm:rounded-[50px] border border-gray-200 mt-10">
      <div className="max-w-6xl mx-auto ">
        <div className="text-center mb-8 ">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">Our Guiding Principles</h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            The foundation of Hotel Aaditya Inn's exceptional hospitality experience
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <div 
              key={index}
              className={`rounded-xl p-6 border ${card.bgColor} ${card.borderColor} hover:shadow-md transition-shadow duration-300 h-full flex flex-col`}
            >
              <div className={`w-12 h-12 rounded-full ${card.bgColor.replace('50', '100')} flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-md sm:text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
              
              {card.content ? (
                <p className="text-xs sm:text-sm text-gray-700 mb-4 flex-grow">{card.content}</p>
              ) : (
                <div className="flex-grow">
                  <ul className="space-y-3">
                    {card.items?.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className={`mt-0.5 p-1 rounded-full ${card.bgColor.replace('50', '100')}`}>
                          {item.icon}
                        </span>
                        <span className="text-gray-700 text-sm">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Core Values Details */}
        <div className="mt-5 sm:mt-12 bg-gray-50 rounded-xl p-5 border border-gray-200 font-inter">
          <h3 className="text-xl font-semibold text-center mb-3">Our Core Values </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <UserRound className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Guest First</h4>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm ">We prioritize the comfort and satisfaction of our guests in everything we do.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <HeartHandshake className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">Integrity</h4>
              </div>
            <p className="text-gray-600 text-xs sm:text-sm ">We maintain transparency, honesty, and fairness in all interactions.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">Excellence</h4>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm ">We strive for perfection in our service, cleanliness, and hospitality standards.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium">Innovation</h4>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm ">We continuously improve to meet evolving guest needs and expectations.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <UserRound className="w-5 h-5 text-red-600" />
                <h4 className="font-medium">Respect</h4>
              </div>
         <p className="text-gray-600 text-xs sm:text-sm ">We value and respect every guest, team member, and partner alike.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h4 className="font-medium">Sustainability</h4>
              </div>
               <p className="text-gray-600 text-xs sm:text-sm ">We are committed to eco-friendly practices and responsible tourism.</p>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="text-center mt-8 px-3">
          <p className="text-sm sm:text-lg font-medium text-gray-900">
            Come, experience the perfect stay at Hotel Aaditya Inn — where every detail is designed to delight.
          </p>
        </div>
      </div>
    </div>
  );
}
