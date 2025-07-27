import React from "react";
import { Phone, Mail, MapPin, Clock, ArrowLeft } from "lucide-react"; // Icons for contact details
import { useNavigate } from "react-router-dom";
import Panglao_lgu_logo from "../components/img/panglao-logo.png"
import Panglao_tourism_logo from "../components/img/Tourism_logo.png"
import BISU_logo from "../components/img/BISU_Logo.png"
import ICpEP_Logo from "../components/img/CpE_Logo.png"

const HelpSupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 p-2 sm:p-8">
      <div className="w-full sm:max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Beach-Inspired Design */}
        <div className="bg-blue-500 p-4 sm:p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-12 bg-white opacity-20 transform skew-y-2"></div>
          <div className="absolute top-8 left-0 w-full h-12 bg-white opacity-10 transform skew-y-4"></div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Login
            </button>
            <div className="flex items-center gap-2">
              <img src={Panglao_tourism_logo} alt="Tourism Logo" className="w-8 h-8" />
              <span className="text-white font-semibold">TDMS</span>
            </div>
          </div>
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

          {/* Significance of the Initiative */}
          <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4">Significance of the Initiative</h4>
          <ul className="list-disc list-inside text-gray-600 mb-4 text-sm sm:text-base">
            <li>
              <strong>For the Panglao LGU & Municipal Tourism Office:</strong> Provides accurate and timely data for planning, marketing strategies, and policy formulation. Helps understand carrying capacity and trends for sustainable tourism development.
            </li>
            <li>
              <strong>For Accommodation Establishments:</strong> Simplifies submission processes, reducing administrative burdens and improving efficiency.
            </li>
          </ul>

          {/* User Guide Section */}
          <div className="mt-8 mb-8">
            <h4 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-6">User Guide</h4>
            
            <div className="space-y-6">
              {/* Guide Item 1 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    1
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Registration</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      As illustrated in Screen View 1, new users representing accommodation establishments start by filling out a User Registration Form with the necessary details.
                    </p>
                    {/* Screen View 1 Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 1: User Registration Form</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📝</div>
                          <p className="text-sm">Registration Form Screenshot</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 2 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    2
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Approved Account and Login</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      Once the admin approves the request, the user receives confirmation (Screen View 4) and can now log in to the system using their credentials (Screen View 5).
                    </p>
                    {/* Screen View 4 & 5 Images */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 4: Approval Confirmation</h6>
                        <div className="bg-gray-100 rounded-lg h-40 sm:h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <div className="text-3xl mb-2">✅</div>
                            <p className="text-sm">Confirmation Screen</p>
                            <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 5: Login Form</h6>
                        <div className="bg-gray-100 rounded-lg h-40 sm:h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <div className="text-3xl mb-2">🔐</div>
                            <p className="text-sm">Login Form</p>
                            <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 3 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    3
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">User Dashboard Access</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      After a successful login, users are redirected to their personalized User Dashboard. The dashboard features a clear and structured navigation panel designed to simplify the user experience.
                    </p>
                    {/* Dashboard Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">User Dashboard Overview</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-sm">Dashboard Interface</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 4 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    4
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Municipal Ordinance Section</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      This section provides an overview of the system's purpose and includes a visible summary of the Municipal Ordinance No. 04, Series of 2020 (Screen View 6). This ordinance mandates the submission of tourist accommodation data, and its placement on the dashboard reinforces the legal responsibility of each establishment to comply with the data reporting process.
                    </p>
                    {/* Screen View 6 Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 6: Municipal Ordinance Display</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📜</div>
                          <p className="text-sm">Ordinance Section</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 5 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    5
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Submission Input Section</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      This module is the core functionality of the user side. It allows establishments to input their tourist accommodation data. Users select a month and year and proceed to enter daily records for guest check-ins. For each day, they input the necessary data as illustrated in the Screen View 7, 8, and 9, they input data such as Length of Overnight Stay, Gender, Age, Marital Status, and Nationality. This automated feature reduces manual work and ensures accuracy in consolidation.
                    </p>
                    {/* Screen View 7, 8, 9 Images */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 7: Month/Year Selection</h6>
                        <div className="bg-gray-100 rounded-lg h-40 sm:h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <div className="text-3xl mb-2">📅</div>
                            <p className="text-sm">Date Selection</p>
                            <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 8: Daily Input Form</h6>
                        <div className="bg-gray-100 rounded-lg h-40 sm:h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="text-sm">Input Form</p>
                            <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <h6 className="text-sm font-semibold text-sky-800 mb-2">Screen View 9: Guest Data Entry</h6>
                        <div className="bg-gray-100 rounded-lg h-40 sm:h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <div className="text-3xl mb-2">👥</div>
                            <p className="text-sm">Guest Details</p>
                            <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 6 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    6
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Submission History Section</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      Once submitted, the system automatically consolidates and calculates total metrics for the month, such as Total Guest Check-Ins, Total Guests Staying Overnight, Estimated Room Occupancy Rate, Guest Demographic Distribution, Top Foreign Markets. This section provides users access to all previous submissions. Records are arranged by month and include all submitted details, allowing establishments to cross-check or print reports when needed.
                    </p>
                    {/* Submission History Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">Submission History & Reports</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📈</div>
                          <p className="text-sm">History & Analytics</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 7 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    7
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Profile Management Section</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      Allows the establishment to update their basic information of relevant administrative details. This ensures that all records are attributed to the correct business entity.
                    </p>
                    {/* Profile Management Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">Profile Management Interface</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">👤</div>
                          <p className="text-sm">Profile Settings</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 8 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    8
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Panglao Statistics Section</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      While this module is primarily for the Admin Dashboard, users are granted viewing access. It allows establishments to see real-time tourist statistics of Panglao. This feature helps them analyze their own performance in relation to broader trends—whether they are aligned with peak seasons or falling behind. By doing so, establishments are encouraged to improve their service or marketing strategy.
                    </p>
                    {/* Statistics Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">Panglao Tourism Statistics</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">🏝️</div>
                          <p className="text-sm">Regional Statistics</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide Item 9 */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                    9
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg sm:text-xl font-semibold text-sky-900 mb-2">Help and Support Section</h5>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      This module offers a contact form for technical support, a list of frequently asked questions (FAQs), and system guides. It ensures that users can resolve issues quickly and effectively without interrupting their workflow.
                    </p>
                    {/* Help Support Image */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h6 className="text-sm font-semibold text-sky-800 mb-2">Help & Support Interface</h6>
                      <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">❓</div>
                          <p className="text-sm">Support Center</p>
                          <p className="text-xs text-gray-400 mt-1">Upload image here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          {/* Back to Login Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage; 