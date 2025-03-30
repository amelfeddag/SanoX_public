import React, { useState, useEffect } from 'react';
import map from './../../assets/maps.png'; 
import Navbar from '../../component/navbar';
import Footer from '../../component/footer';
import DoctorPin from './../../assets/Doctormarkerpin.svg';

const DoctorMap = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch doctors from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/doctors');
        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return ( 
    <div className="flex flex-col justify-center align-center">
      <Navbar />
      <h1 className="text-xl font-semibold text-gray-800">Sélectionner un médecin</h1>

      {/* Main content */}
      <div className="flex-1 relative">
        <div className="w-full h-full bg-blue-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={map} alt='map image' />
            {/* Doctor markers */}
            {doctors.map((doctor) => (
              <div
                key={doctor.doctor_id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${(doctor.latitude - 48.85) * 1000}px`,
                  left: `${(doctor.longitude - 2.34) * 1000}px`
                }}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <img src={DoctorPin} alt="Doctor Location" width={24} />
              </div>
            ))}
          </div>
        </div>

        {/* Doctor info panel - shows when a doctor is selected */}
        {selectedDoctor && (
          <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <h2 className="font-semibold">{selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
            <p className="text-sm text-gray-600">
              Specialty: {selectedDoctor.specialty}
            </p>
            <p className="text-sm text-gray-600">
              Location: {selectedDoctor.latitude.toFixed(4)}, {selectedDoctor.longitude.toFixed(4)}
            </p>
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              onClick={() => alert(`Booking appointment with ${selectedDoctor.first_name}`)}
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DoctorMap;
