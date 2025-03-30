import React from 'react';
import logowhite from './../../assets/logos/logo_white.png';
import { Icon } from 'lucide-react';

const RecommendationPage = () => {
  const recommendations = [
    {
      type: "consulting",
      message: "vous devez consulter chez un \"cardiologue/hépatologue/pneumologue\" (spécifier le service) dans maximum \"1 semaine / 2 jours...\""
    },
    {
      type: "suggestions",
      items: [
        "1 bla bla",
        "2 bla",
        "3 bla bla bla",
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {/* Urgent Consultation Card */}
      <div className="bg-green-500 rounded-lg p-4 text-white relative">
        <div className="flex items-start gap-3">
          
          <p className="text-sm leading-relaxed">
            {recommendations[0].message}
          </p>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="bg-[#2D2654] rounded-lg p-4 text-white">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <img src={logowhite} ></img>
            <p className="text-sm font-medium">we recommend</p>
          </div>
          <ul className="space-y-2 pl-9">
            {recommendations[1].items.map((item, index) => (
              <li key={index} className="text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <button 
        className="
          w-full 
          bg-[#40CBC4] 
          text-white 
          rounded-lg 
          py-3 
          px-4 
          text-center 
          hover:bg-[#35ABA4] 
          transition-colors
          font-medium
        "
      >
        Voir les médecins à proximité.
      </button>
    </div>
  );
};

export default RecommendationPage;