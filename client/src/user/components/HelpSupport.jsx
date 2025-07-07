
import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react"; // Icons for contact details
import Panglao_lgu_logo from "./img/panglao-logo.png"
import Panglao_tourism_logo from "./img/Tourism_logo.png"
import BISU_logo from "./img/BISU_Logo.png"
import ICpEP_Logo from "./img/CpE_Logo.png"

const HelpSupport = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 p-2 sm:p-8">
      <div className="w-full sm:max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Beach-Inspired Design */}
        <div className="bg-blue-500 p-4 sm:p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-12 bg-white opacity-20 transform skew-y-2"></div>
          <div className="absolute top-8 left-0 w-full h-12 bg-white opacity-10 transform skew-y-4"></div>
          <h3 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Help and Support</h3>
          <p className="text-base sm:text-lg text-blue-100">
            We're here to help you! Reach out to us for any inquiries or assistance.
          </p>
        </div>

        {/* Contact Details Section */}
        <div className="p-4 sm:p-8">
          <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4 sm:mb-6">
            Contact the Tourism Office
          </h4>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Phone */}
            <div className="flex flex-col bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <div className="bg-blue-500 p-3 rounded-full text-white flex items-center justify-center mr-3">
                  <Phone size={24} />
                </div>
                <h5 className="text-base sm:text-lg font-semibold text-sky-900">Phone</h5>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">+1 (123) 456-7890</p>
              <p className="text-gray-600 text-sm sm:text-base">+1 (987) 654-3210</p>
            </div>

            {/* Email */}
            <div className="flex flex-col bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <div className="bg-blue-500 p-3 rounded-full text-white flex items-center justify-center mr-3">
                  <Mail size={24} />
                </div>
                <h5 className="text-base sm:text-lg font-semibold text-sky-900">Email</h5>
              </div>
              <p className="text-gray-600 text-sm sm:text-base break-words whitespace-normal">tourismpanglaocentral@gmail.com</p>
              <p className="text-gray-600 text-sm sm:text-base break-words whitespace-normal">statistics.tourismpanglao@gmail.com</p>
            </div>

            {/* Address */}
            <div className="flex flex-col bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <div className="bg-blue-500 p-3 rounded-full text-white flex items-center justify-center mr-3">
                  <MapPin size={24} />
                </div>
                <h5 className="text-base sm:text-lg font-semibold text-sky-900">Address</h5>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Poblacion, Panglao, Bohol
              </p>
            </div>

            {/* Office Hours */}
            <div className="flex flex-col bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <div className="bg-blue-500 p-3 rounded-full text-white flex items-center justify-center mr-3">
                  <Clock size={24} />
                </div>
                <h5 className="text-base sm:text-lg font-semibold text-sky-900">Office Hours</h5>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Monday - Friday: 8:00 AM - 5:00 PM</p>
              <p className="text-gray-600 text-sm sm:text-base">Saturday & Sunday: Closed</p>
            </div>
          </div>
        </div>

       {/* Collaboration and System Information Section */} 
       <div className="p-4 sm:p-8">
          <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4 sm:mb-6">
            About the System
          </h4>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            In pursuit of a smarter and more efficient tourism management system, the <strong>Integrated Tourist Data Management System (ITDMS)</strong> has been developed by students from the <strong>Computer Engineering Department of Bohol Island State University (BISU) Main Campus.</strong> This initiative is a product of <strong>innovation, research, and collaboration</strong> between the <strong>Panglao Local Government Unit (LGU), the Panglao Municipal Tourism Office, and BISU</strong> to address the evolving needs of the tourism sector.
          </p>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Embracing modern <strong>technology and data-driven solutions</strong>, this system is designed to <strong>streamline, digitize, and enhance</strong> the collection, management, and organization of tourist accommodation data. It replaces the <strong>traditional manual recording system</strong> with an <strong>automated, real-time platform</strong> that ensures accuracy, efficiency, and accessibility.
          </p>

          {/* Innovative Features */}
          <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4">Innovative Features of the System</h4>
          <ul className="list-disc list-inside text-gray-600 mb-4 text-sm sm:text-base">
            <li><strong>Automated Tourist Data Collection & Management:</strong> Streamlines the process for accommodation establishments.</li>
            <li><strong>Real-Time Monitoring & Reporting:</strong> Provides up-to-date insights into accommodation trends.</li>
            <li><strong>Machine Learning-Powered Forecasting:</strong> Predicts tourist accommodation demand for data-driven decision-making.</li>
            <li><strong>Sustainable & Smart Tourism Approach:</strong> Reduces reliance on paper-based logs, promoting eco-friendly tourism.</li>
          </ul>

          {/* Significance of the Study */}
          <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4">Significance of the Initiative</h4>
          <ul className="list-disc list-inside text-gray-600 mb-4 text-sm sm:text-base">
            <li>
              <strong>For the Panglao LGU & Municipal Tourism Office:</strong> Provides accurate and timely data for planning, marketing strategies, and policy formulation. Helps understand carrying capacity and trends for sustainable tourism development.
            </li>
            <li>
              <strong>For Accommodation Establishments:</strong> Simplifies submission processes, reducing administrative burdens and improving efficiency.
            </li>
          </ul>

          {/* Logos of Collaborating Organizations */}
          <div className="mt-8">
            <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4 sm:mb-6">Our Collaborators</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center justify-center bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm">
                <img src={Panglao_lgu_logo} alt="Panglao LGU Logo" className="h-20" />
              </div>
              <div className="flex items-center justify-center bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm">
                <img src={Panglao_tourism_logo} alt="Panglao Municipal Tourism Office Logo" className="h-20" />
              </div>
              <div className="flex items-center justify-center bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm">
                <img src={BISU_logo} alt="Bohol Island State University Logo" className="h-20" />
              </div>
              <div className="flex items-center justify-center bg-sky-50 p-3 sm:p-6 rounded-lg shadow-sm">
                <img src={ICpEP_Logo} alt="Computer Engineering Department Logo" className="h-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;