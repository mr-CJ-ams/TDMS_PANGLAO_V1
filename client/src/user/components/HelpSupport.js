import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react"; // Icons for contact details
import Panglao_lgu_logo from "./panglao-logo.png"
import Panglao_tourism_logo from "./Tourism_logo.png"
import BISU_logo from "./BISU_Logo.png"
import ICpEP_Logo from "./CpE_Logo.png"

const HelpSupport = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Beach-Inspired Design */}
        <div className="bg-blue-500 p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-12 bg-white opacity-20 transform skew-y-2"></div>
          <div className="absolute top-8 left-0 w-full h-12 bg-white opacity-10 transform skew-y-4"></div>
          <h3 className="text-4xl font-bold text-white mb-4">Help and Support</h3>
          <p className="text-lg text-blue-100">
            We're here to help you! Reach out to us for any inquiries or assistance.
          </p>
        </div>

          {/* Contact Details Section */}
          <div className="p-8">
          <h4 className="text-2xl font-semibold text-sky-900 mb-6">
            Contact the Tourism Office
          </h4>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="flex items-center bg-sky-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                <Phone size={24} />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-sky-900">Phone</h5>
                <p className="text-gray-600">+1 (123) 456-7890</p>
                <p className="text-gray-600">+1 (987) 654-3210</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center bg-sky-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                <Mail size={24} />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-sky-900">Email</h5>
                <p className="text-gray-600">info@tourismoffice.com</p>
                <p className="text-gray-600">support@tourismoffice.com</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center bg-sky-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                <MapPin size={24} />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-sky-900">Address</h5>
                <p className="text-gray-600">
                  123 Ocean Drive, Beach City, BC 12345
                </p>
              </div>
            </div>

            {/* Office Hours */}
            <div className="flex items-center bg-sky-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                <Clock size={24} />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-sky-900">Office Hours</h5>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-gray-600">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration and System Information Section */}
        <div className="p-8">
          <h4 className="text-2xl font-semibold text-sky-900 mb-6">
            About the System
          </h4>
          <p className="text-gray-600 mb-4">
            This system is developed by students from <strong>Bohol Island State University (BISU) Main Campus</strong> under the <strong>Computer Engineering Department</strong> as part of their research. It is a collaboration between the <strong>Panglao Local Government Unit (LGU)</strong>, the <strong>Panglao Municipal Tourism Office</strong>, and <strong>Bohol Island State University</strong>.
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Bohol Island State University</strong> aims to help communities solve problems through innovation. The <strong>Panglao LGU</strong> and <strong>Panglao Municipal Tourism Office</strong> are committed to adopting innovative solutions to enhance their operations and services.
          </p>
          <p className="text-gray-600 mb-4">
            Their research focuses on designing and developing an <strong>Integrated Tourist Data Management System</strong>. This system aims to streamline and enhance the process of collecting, managing, and organizing tourist accommodation data, which serves as a critical source of information for the Local Government Unit and the Municipal Tourism Office of Panglao, Bohol. Furthermore, the researchers will utilize a machine learning model trained to forecast accommodation demand, enabling the system to provide accurate and timely predictions for better decision-making and resource allocation.
          </p>

          {/* Significance of the Study */}
          <h4 className="text-2xl font-semibold text-sky-900 mb-4">
            Significance of the Study
          </h4>
          <p className="text-gray-600 mb-4">
            This study is beneficial to the following:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>
              <strong>For the LGU and Municipal Tourism Office:</strong> It provides a reliable and timely source of data for planning, marketing strategies, policy formulation, and decision-making processes. The availability of accurate and up-to-date tourist arrival information is crucial for the effective promotion and development of the tourism sector. Moreover, by facilitating an understanding of the carrying capacity and current tourism trends, the system will empower the LGU to allocate resources more effectively, ensuring sustainable tourism development.
            </li>
            <li>
              <strong>For the Accommodation Establishments:</strong> It simplifies the submission process, saving time and resources.
            </li>
          </ul>

          {/* Logos of Collaborating Organizations */}
          <div className="mt-8">
            <h4 className="text-2xl font-semibold text-sky-900 mb-6">
              Our Collaborators
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Placeholder for Panglao LGU Logo */}
              <div className="flex items-center justify-center bg-sky-50 p-6 rounded-lg shadow-sm">
                <img
                  src={Panglao_lgu_logo} // Replace with actual logo path
                  alt="Panglao LGU Logo"
                  className="h-20"
                />
              </div>
              {/* Placeholder for Panglao Municipal Tourism Office Logo */}
              <div className="flex items-center justify-center bg-sky-50 p-6 rounded-lg shadow-sm">
                <img
                  src={Panglao_tourism_logo} // Replace with actual logo path
                  alt="Panglao Municipal Tourism Office Logo"
                  className="h-20"
                />
              </div>
              {/* Placeholder for Bohol Island State University Logo */}
              <div className="flex items-center justify-center bg-sky-50 p-6 rounded-lg shadow-sm">
                <img
                  src={BISU_logo} // Replace with actual logo path
                  alt="Bohol Island State University Logo"
                  className="h-20"
                />
              </div>
              {/* Placeholder for Computer Engineering Department Logo */}
              <div className="flex items-center justify-center bg-sky-50 p-6 rounded-lg shadow-sm">
                <img
                  src={ICpEP_Logo} // Replace with actual logo path
                  alt="Computer Engineering Department Logo"
                  className="h-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;