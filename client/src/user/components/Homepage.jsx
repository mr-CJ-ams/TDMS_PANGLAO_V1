import React, { useEffect, useRef, useState } from "react";

const Homepage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const sectionsRef = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      Object.keys(sectionsRef.current).forEach(key => {
        const element = sectionsRef.current[key];
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
          setIsVisible(prev => ({ ...prev, [key]: isVisible }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/src/user/components/files/Panglao-Municipal-Ordinance-No_04.pdf';
    link.download = 'Panglao-Municipal-Ordinance-No_04.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      {/* Animated Beach Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Seashells */}
        <div 
          className="absolute top-20 left-10 w-16 h-12 opacity-30 animate-pulse"
          style={{ 
            transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath d='M20,30 Q40,10 60,30 Q80,50 60,30 Q40,10 20,30 Z' fill='%23fbbf24'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute top-40 right-20 w-20 h-14 opacity-25 animate-pulse delay-1000"
          style={{ 
            transform: `translateY(${scrollY * -0.15}px) rotate(${scrollY * -0.03}deg)`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath d='M25,25 Q45,5 65,25 Q85,45 65,25 Q45,5 25,25 Z' fill='%23f59e0b'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Floating Starfish */}
        <div 
          className="absolute bottom-40 left-20 w-24 h-24 opacity-20 animate-pulse delay-2000"
          style={{ 
            transform: `translateY(${scrollY * 0.08}px) rotate(${scrollY * 0.05}deg)`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50,20 L60,40 L80,40 L65,55 L70,75 L50,65 L30,75 L35,55 L20,40 L40,40 Z' fill='%23f97316'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Ocean Waves */}
        <div 
          className="absolute bottom-0 left-0 w-full h-32 opacity-20"
          style={{ 
            transform: `translateY(${scrollY * 0.05}px)`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,60 Q300,40 600,60 Q900,80 1200,60 L1200,120 L0,120 Z' fill='%230ea5e9'/%3E%3C/svg%3E")`,
            backgroundSize: '1200px 120px',
            backgroundRepeat: 'repeat-x',
            animation: 'wave 8s ease-in-out infinite'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div 
            ref={el => sectionsRef.current['hero'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['hero'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            {/* Beach Elements Accent */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-3">
                <div className="w-6 h-6 bg-amber-400 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-6 h-6 bg-orange-400 rounded-full animate-bounce delay-100 shadow-lg"></div>
                <div className="w-6 h-6 bg-cyan-400 rounded-full animate-bounce delay-200 shadow-lg"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce delay-300 shadow-lg"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-cyan-600 bg-clip-text text-transparent">
              Panglao Tourist Data Management System
            </h1>
            
            {/* Download Button with Beach Theme */}
            <div className="mb-12">
              <button
                onClick={handleDownload}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-6 h-6 mr-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="relative z-10">Download Municipal Ordinance No. 04</span>
              </button>
              <p className="text-sm text-gray-600 mt-3">
                🐚 Download the original ordinance document for reference
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['overview'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['overview'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              System Overview
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-amber-100 relative overflow-hidden">
              {/* Sand Texture Overlay */}
              <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-amber-200 to-yellow-300"></div>
              <div className="relative z-10">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  The <strong className="text-cyan-600">Tourism Data Management System (TDMS)</strong> is a comprehensive digital platform designed to streamline 
                  tourism data collection, analysis, and reporting for the Municipality of Panglao, Bohol. This system modernizes 
                  the traditional paper-based reporting process mandated by Municipal Ordinance No. 04, Series of 2020(Tourist Arrival Monitoring Ordinance of Panglao, Bohol), providing 
                  real-time insights and automated compliance monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose and Objectives */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['objectives'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['objectives'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              Purpose and Objectives
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-cyan-50 p-8 md:p-12 rounded-3xl shadow-2xl border border-amber-200 relative overflow-hidden">
              {/* Seashell Pattern */}
              <div className="absolute top-4 right-4 w-16 h-12 opacity-10">
                <div className="w-full h-full bg-amber-400 rounded-full transform rotate-45"></div>
              </div>
              <h3 className="text-2xl font-bold text-amber-700 mb-6 text-center">Primary Objectives</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                    <span className="text-gray-700"><strong>Digital Transformation:</strong> Convert manual tourism data collection to automated digital processes</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                    <span className="text-gray-700"><strong>Real-time Analytics:</strong> Provide instant access to tourism statistics and trends</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                    <span className="text-gray-700"><strong>Compliance Management:</strong> Ensure timely submission of required reports</span>
                  </li>
                </ul>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                    <span className="text-gray-700"><strong>Data Accuracy:</strong> Minimize human errors through standardized digital forms</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                    <span className="text-gray-700"><strong>Strategic Planning:</strong> Enable data-driven decision making for tourism development</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                    <span className="text-gray-700"><strong>Resource Optimization:</strong> Reduce administrative overhead and improve efficiency</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Information */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['compliance'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['compliance'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              Compliance Information
            </h2>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 md:p-12 rounded-3xl shadow-2xl border border-orange-200 relative overflow-hidden">
              {/* Sunset Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-red-200/20"></div>
              <div className="relative z-10">
                <p className="text-lg text-gray-700 mb-6 text-center">
                  This system implements the requirements of <strong className="text-orange-600">Municipal Ordinance No. 04, Series of 2020</strong> 
                  (Tourist Arrival Monitoring Ordinance of Panglao, Bohol).
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-orange-700 mb-4">All tourism establishments are required to:</h4>
                    <ul className="space-y-3">
                      {[
                        "Submit monthly reports not later than the 10th day of each month",
                        "Provide accurate and complete tourism statistical data",
                        "Cooperate with tourism office surveys and data collection efforts",
                        "Maintain proper records of all tourism-related activities"
                      ].map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0 mt-1 shadow-sm"></div>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                    <h4 className="font-bold text-orange-700 mb-3">Important Note:</h4>
                    <p className="text-gray-700">
                      Failure to comply may result in penalties as specified in the ordinance. 
                      The TDMS system helps ensure compliance and provides tools for timely and accurate reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['features'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['features'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              System Features
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* User Features */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-3xl shadow-2xl border border-cyan-200 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                {/* Water Ripple Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-cyan-700 mb-6 text-center">For Tourism Establishments</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-cyan-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Digital Submission Forms:</strong> Easy-to-use online forms for monthly reports</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-cyan-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Automated Calculations:</strong> Built-in formulas for guest nights and occupancy rates</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-cyan-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Submission History:</strong> Track all previous submissions and their status</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-cyan-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Real-time Validation:</strong> Immediate feedback on data accuracy</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-cyan-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Mobile Responsive:</strong> Access the system from any device</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Admin Features */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl shadow-2xl border border-amber-200 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                {/* Sand Texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-orange-200/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-amber-700 mb-6 text-center">For Tourism Office</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Dashboard Analytics:</strong> Comprehensive overview of tourism metrics</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Data Visualization:</strong> Charts and graphs for trend analysis</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Compliance Monitoring:</strong> Track submission status and identify late reporters</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>Export Capabilities:</strong> Generate reports in various formats</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex-shrink-0 mt-1 shadow-md"></div>
                      <span className="text-gray-700"><strong>User Management:</strong> Manage establishment accounts and permissions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Tracked */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['metrics'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['metrics'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              Key Metrics Tracked
            </h2>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 md:p-12 rounded-3xl shadow-2xl border border-teal-200 relative overflow-hidden">
              {/* Starfish Pattern */}
              <div className="absolute top-4 right-4 w-20 h-20 opacity-10">
                <div className="w-full h-full bg-orange-400 transform rotate-45 rounded-full"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-teal-700 mb-8 text-center">Accommodation Metrics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Guest Arrivals", desc: "Total number of tourists by nationality", color: "amber" },
                    { title: "Check-ins", desc: "Total number of guest check-ins", color: "cyan" },
                    { title: "Guest Nights", desc: "Total number of nights stayed", color: "blue" },
                    { title: "Average Guest Nights", desc: "Average length of stay per guest", color: "teal" },
                    { title: "Room Occupancy Rate", desc: "Percentage of rooms occupied", color: "orange" },
                    { title: "Average Guests per Room", desc: "Guest density per occupied room", color: "indigo" }
                  ].map((metric, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                      {/* Seashell Icon */}
                      <div className={`w-12 h-12 bg-${metric.color}-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-800 text-center mb-2">{metric.title}</h4>
                      <p className="text-gray-600 text-sm text-center">{metric.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['benefits'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['benefits'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              System Benefits
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-3xl shadow-2xl border border-cyan-200 transform hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-bold text-cyan-700 mb-6 text-center">For Tourism Establishments</h3>
                <ul className="space-y-3">
                  {["Reduced administrative burden", "Faster report submission", "Elimination of manual calculations", "Improved data accuracy", "Compliance with regulations", "Access to own performance metrics"].map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-cyan-600 rounded-full shadow-sm"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl shadow-2xl border border-amber-200 transform hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-bold text-amber-700 mb-6 text-center">For Tourism Office</h3>
                <ul className="space-y-3">
                  {["Real-time data access", "Automated compliance monitoring", "Enhanced data quality", "Improved decision-making", "Reduced processing time", "Better resource allocation"].map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-amber-600 rounded-full shadow-sm"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-8 rounded-3xl shadow-2xl border border-teal-200 transform hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-700 mb-6 text-center">For Municipality</h3>
                <ul className="space-y-3">
                  {["Data-driven tourism planning", "Improved visitor experience", "Enhanced destination marketing", "Economic impact assessment", "Infrastructure planning support", "Competitive advantage"].map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-teal-600 rounded-full shadow-sm"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Data Privacy Notice */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={el => sectionsRef.current['privacy'] = el}
            className={`transition-all duration-1000 ease-out ${
              isVisible['privacy'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-20'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">
              Data Privacy Notice
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 md:p-12 rounded-3xl shadow-2xl border-l-4 border-blue-500 relative overflow-hidden">
              {/* Ocean Wave Pattern */}
              <div className="absolute top-0 left-0 w-full h-4 opacity-10">
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-b-full"></div>
              </div>
              <div className="relative z-10 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The Panglao Municipal Tourism Office, in line with Republic Act 10173 or the Data Privacy Act of 2012, 
                  is committed to protect and secure personal information obtained in the performance of its mandate under 
                  The Tourism Act of 2009.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In compliance with the requirements of Data Privacy Act of 2012, the Office commits to ensure that all 
                  personal information obtained will be secured and remain confidential.
                </p>
                <div className="bg-blue-100 p-6 rounded-2xl">
                  <p className="text-blue-800 font-medium text-center">
                    <strong>Contact for Privacy Concerns:</strong><br />
                    tourismpanglaocentral@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-800 via-blue-900 to-cyan-900 text-white mt-16 relative overflow-hidden">
        {/* Ocean Floor Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-200 to-yellow-300"></div>
        </div>
        
        {/* Top Section - TDMS & Tourism Agencies */}
        <div className="container mx-auto px-8 py-12 relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Collaborating for a stronger community impact
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full p-2 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img src="/src/user/components/img/Tourism_logo_1.png" alt="Tourism Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs md:text-sm leading-tight">Panglao Municipal Tourism Office</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full p-2 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img src="/src/user/components/img/panglao-logo.png" alt="Panglao Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs md:text-sm leading-tight">Municipality of Panglao</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full p-2 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img src="/src/user/components/img/BISU_Logo.png" alt="BISU Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs md:text-sm leading-tight">Bohol Island State University-Main Campus</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full p-2 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img src="/src/user/components/img/CEAID_logo.png" alt="CEAID Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs md:text-sm leading-tight">CEAID Extension and Training - BISU MC</p>
              </div>
            </div>
          </div>

          {/* Mid Section - About & Links */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Side - About TDMS */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-cyan-400">About TDMS</h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Tourism Data Management System (TDMS) is a digital platform developed for the Municipality of Panglao, Bohol 
                to streamline tourism data collection, analysis, and reporting. This system modernizes traditional paper-based 
                processes and provides real-time insights for sustainable tourism development.
              </p>
            </div>

            {/* Right Side - Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-cyan-400">Quick Links</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2 text-white">Panglao LGU Services</h5>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Municipality of Panglao</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Panglao Online Business Permit</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Applicant Registration</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Establishment Registration</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Registration</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2 text-white">Government Links</h5>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Office of the President</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Office of the Vice President</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Senate of the Philippines</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">House of Representatives</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Supreme Court</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Court of Appeals</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Sandiganbayan</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Government Info */}
          <div className="border-t border-gray-700 pt-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Republic of the Philippines */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <img src="/src/user/components/img/Coat_of_arms_of_the_Philippines.png" alt="Philippine Tourism" className="w-12 h-12 mr-3" />
                  <div>
                    <h5 className="font-semibold text-cyan-400">Republic of the Philippines</h5>
                    <p className="text-sm text-gray-300">Department of Tourism</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  All content is in the public domain unless otherwise stated.
                </p>
              </div>

              {/* About Gov.Ph */}
              <div className="text-center md:text-right">
                <h5 className="font-semibold mb-2 text-cyan-400">About Gov.Ph</h5>
                <p className="text-sm text-gray-300 mb-3">
                  Learn more about the Philippine government and its structure.
                </p>
                <div className="space-y-1 text-sm">
                  <div><a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">GOV.PH</a></div>
                  <div><a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Open Data Portal</a></div>
                  <div><a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Official Gazette</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-black/50 py-4 relative z-10">
          <div className="container mx-auto px-8 text-center">
            <p className="text-sm text-gray-400">
              Copyright © 2025 Tourism Data Management System (TDMS) - Municipality of Panglao, Bohol. All Rights Reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Developed in partnership with Bohol Island State University (BISU) | <span className="text-cyan-400">Beach Paradise</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for wave animation */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-25px); }
        }
      `}</style>
    </div>
  );
};

export default Homepage;