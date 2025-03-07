import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png"
const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    registeredOwner: "",
    tin: "",
    companyName: "",
    companyAddress: "",
    accommodationType: "",
    numberOfRooms: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const barangays = [
    "Bil‑isan",
    "Bolod",
    "Danao",
    "Doljo",
    "Libaong",
    "Looc",
    "Lourdes",
    "Poblacion",
    "Tangnan",
    "Tawala",
  ];
  const accommodationTypes = [
    {
      name: "Hotel",
      code: "HTL",
    },
    {
      name: "Condotel",
      code: "CON",
    },
    {
      name: "Serviced Residence",
      code: "SER",
    },
    {
      name: "Resort",
      code: "RES",
    },
    {
      name: "Apartelle",
      code: "APA",
    },
    {
      name: "Motel",
      code: "MOT",
    },
    {
      name: "Pension House",
      code: "PEN",
    },
    {
      name: "Home Stay Site",
      code: "HSS",
    },
    {
      name: "Tourist Inn",
      code: "TIN",
    },
    {
      name: "Other",
      code: "OTH",
    },
  ];
  useEffect(() => {
    const validatePassword = (password) => {
      setPasswordValidation({
        hasLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
      });
    };
    validatePassword(formData.password);
  }, [formData.password]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = formData.password === formData.confirmPassword;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      alert("Please ensure password meets all requirements");
      return;
    }
    if (!doPasswordsMatch) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phoneNumber,
        registered_owner: formData.registeredOwner,
        tin: formData.tin,
        company_name: formData.companyName,
        company_address: formData.companyAddress,
        accommodation_type: formData.accommodationType,
        number_of_rooms: formData.numberOfRooms,
      });
      alert("Signup successful! Waiting for admin approval.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");
    }
  };
  const ValidationIcon = ({ isValid }) =>
    isValid ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-red-500" />
    );
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
        
            <img
              src={TourismLogo}
              alt="Panglao Logo 2"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">
            Panglao Tourist Data Management System
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasLength} />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasUpperCase} />
                  <span>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasLowerCase} />
                  <span>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasNumber} />
                  <span>One number</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={doPasswordsMatch} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registered Owner *
              </label>
              <input
                type="text"
                name="registeredOwner"
                value={formData.registeredOwner}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Identification No. (TIN) *
              </label>
              <input
                type="text"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address *
              </label>
              <select
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation Type *
              </label>
              <select
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Type</option>
                {accommodationTypes.map((type) => (
                  <option key={type.code} value={type.name}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rooms *
              </label>
              <input
                type="number"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium mt-6"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Signup;
