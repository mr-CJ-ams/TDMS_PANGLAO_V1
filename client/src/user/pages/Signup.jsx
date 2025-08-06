import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Check, X, Mail } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png";
import places from "../../components/places.json";
import DolphinSpinner from "../components/DolphinSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const SIGNUP_TIMEOUT = 30000;
const accommodationTypes = [
  { name: "Hotel", code: "HTL" }, { name: "Condotel", code: "CON" }, { name: "Serviced Residence", code: "SER" },
  { name: "Resort", code: "RES" }, { name: "Apartelle", code: "APA" }, { name: "Motel", code: "MOT" },
  { name: "Pension House", code: "PEN" }, { name: "Home Stay Site", code: "HSS" }, { name: "Tourist Inn", code: "TIN" }, { name: "Other", code: "OTH" }
];

const Signup = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({

    email: "", password: "", confirmPassword: "", phoneNumber: "",
    registeredOwner: "", tin: "", companyName: "", companyAddress: "",
    accommodationType: "", numberOfRooms: "", region: "", province: "", municipality: "", barangay: "", dateEstablished: "",
  });
  const [errors, setErrors] = useState({ numberOfRooms: "" });
  const [regions, setRegions] = useState([]), [provinces, setProvinces] = useState([]),
    [municipalities, setMunicipalities] = useState([]), [barangays, setBarangays] = useState([]);
  const [showPassword, setShowPassword] = useState(false), [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ hasLength: false, hasUpperCase: false, hasLowerCase: false, hasNumber: false });
  const [isSubmitting, setIsSubmitting] = useState(false), [submitError, setSubmitError] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState("checking"); // "checking", "verified", "unverified"
  const navigate = useNavigate();

  // Check if email is verified on component mount
  useEffect(() => {
    if (formData.email) {
      checkEmailVerification(formData.email);
    }
  }, [formData.email]);

  // Pre-fill email if coming from verification
  useEffect(() => {
    if (location.state?.verifiedEmail) {
      setFormData(prev => ({ ...prev, email: location.state.verifiedEmail }));
      setEmailVerified(true);
      setEmailVerificationStatus("verified");
    }
  }, [location.state]);

  const checkEmailVerification = async (email) => {
    if (!email) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email-verification?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.success) {
        setEmailVerified(data.verified);
        setEmailVerificationStatus(data.verified ? "verified" : "unverified");
      } else {
        setEmailVerified(false);
        setEmailVerificationStatus("unverified");
      }
    } catch (error) {
      console.error("Error checking email verification:", error);
      setEmailVerified(false);
      setEmailVerificationStatus("unverified");
    }
  };

  const handleRequestVerification = () => {
    navigate("/email-verification-request", { state: { email: formData.email } });
  };

  useEffect(() => {
    setRegions(Object.keys(places).map(code => ({ code, name: places[code].region_name })));
  }, []);

  const handleRegionChange = e => {
    const regionCode = e.target.value, selectedRegion = places[regionCode];
    setProvinces(selectedRegion ? Object.keys(selectedRegion.province_list).map(name => ({ name })) : []);
    setMunicipalities([]); setBarangays([]);
    setFormData(f => ({ ...f, region: regionCode, province: "", municipality: "", barangay: "" }));
  };
  const handleProvinceChange = e => {
    const provinceName = e.target.value, selectedProvince = places[formData.region]?.province_list[provinceName];
    setMunicipalities(selectedProvince ? Object.keys(selectedProvince.municipality_list).map(name => ({ name })) : []);
    setBarangays([]);
    setFormData(f => ({ ...f, province: provinceName, municipality: "", barangay: "" }));
  };
  const handleMunicipalityChange = e => {
    const municipalityName = e.target.value, selectedMunicipality = places[formData.region]?.province_list[formData.province]?.municipality_list[municipalityName];
    setBarangays(selectedMunicipality ? selectedMunicipality.barangay_list : []);
    setFormData(f => ({ ...f, municipality: municipalityName, barangay: "" }));
  };

  useEffect(() => {
    const p = formData.password;
    setPasswordValidation({
      hasLength: p.length >= 8, hasUpperCase: /[A-Z]/.test(p), hasLowerCase: /[a-z]/.test(p), hasNumber: /[0-9]/.test(p)
    });
  }, [formData.password]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "numberOfRooms") setErrors(prev => ({
      ...prev, numberOfRooms: value === "" || isNaN(value) || parseInt(value) <= 0 ? "Please enter a valid positive number." : ""
    }));
    setFormData(f => ({ ...f, [name]: value }));
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Check if email is verified
    if (!emailVerified) {
      setSubmitError("Please verify your email address before completing registration");
      return;
    }
    
    if (!formData.numberOfRooms || isNaN(formData.numberOfRooms) || parseInt(formData.numberOfRooms) <= 0) {
      setErrors(prev => ({ ...prev, numberOfRooms: "Please enter a valid positive number." })); return;
    }
    if (!isPasswordValid) { setSubmitError("Please ensure password meets all requirements"); return; }
    if (!doPasswordsMatch) { setSubmitError("Passwords do not match"); return; }
    setIsSubmitting(true); setSubmitError(null);
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setSubmitError("Signup is taking longer than expected. Please try again.");
    }, SIGNUP_TIMEOUT);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        
        email: formData.email, password: formData.password,
        phone_number: formData.phoneNumber, registered_owner: formData.registeredOwner, tin: formData.tin,
        company_name: formData.companyName, company_address: formData.companyAddress,
        accommodation_type: formData.accommodationType, number_of_rooms: formData.numberOfRooms,
        region: formData.region, province: formData.province, municipality: formData.municipality,
        barangay: formData.barangay, dateEstablished: formData.dateEstablished,
      });
      clearTimeout(timeoutId);
      
      if (response.data.success) {
        alert(response.data.message);
        navigate("/login");
      } else {
        setSubmitError(response.data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const ValidationIcon = ({ isValid }) => isValid
    ? <Check className="w-4 h-4 text-green-500" />
    : <X className="w-4 h-4 text-red-500" />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src={TourismLogo} alt="Panglao Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">Panglao Tourist Data Management System</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field with verification status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={emailVerified}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all ${
                  emailVerified ? "bg-gray-100" : ""
                }`}
                placeholder="Enter your email address"
              />
              {emailVerified && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600">
                  <Check size={16} />
                  <span className="text-xs">Verified</span>
                </div>
              )}
            </div>
            
            {/* Email verification status */}
            {formData.email && emailVerificationStatus === "unverified" && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Mail size={16} />
                    <span className="text-sm">Email not verified</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestVerification}
                    className="text-sm text-amber-700 hover:text-amber-800 underline"
                  >
                    Verify Email
                  </button>
                </div>
              </div>
            )}
            
            {emailVerificationStatus === "checking" && (
              <div className="mt-2 text-sm text-gray-500">
                Checking email verification status...
              </div>
            )}
          </div>

          {/* Rest of the form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                autoComplete="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                autoComplete="organization"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {/* Registered Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered Owner *</label>
              <input
                type="text"
                name="registeredOwner"
                value={formData.registeredOwner}
                onChange={handleChange}
                required
                autoComplete="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {/* Date Established */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Established *</label>
              <input
                type="date"
                name="dateEstablished"
                value={formData.dateEstablished}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {/* Password (was previously TIN position) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {[
                  { valid: passwordValidation.hasLength, text: "At least 8 characters" },
                  { valid: passwordValidation.hasUpperCase, text: "One uppercase letter" },
                  { valid: passwordValidation.hasLowerCase, text: "One lowercase letter" },
                  { valid: passwordValidation.hasNumber, text: "One number" }
                ].map(({ valid, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm">
                    <ValidationIcon isValid={valid} /><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Confirm Password (was previously Password position) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={doPasswordsMatch} /><span>Passwords match</span>
                </div>
              )}
            </div>
            {/* TIN (was previously Confirm Password position) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Identification No. (TIN) *</label>
              <input
                type="text"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleRegionChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Region</option>
                {regions.map(region => <option key={region.code} value={region.code}>{region.name}</option>)}
              </select>
            </div>
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleProvinceChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Province</option>
                {provinces.map(province => <option key={province.name} value={province.name}>{province.name}</option>)}
              </select>
            </div>
            {/* Municipality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Municipality *</label>
              <select
                name="municipality"
                value={formData.municipality}
                onChange={handleMunicipalityChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Municipality</option>
                {municipalities.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay *</label>
              <select
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Barangay</option>
                {barangays.map(barangay => <option key={barangay} value={barangay}>{barangay}</option>)}
              </select>
            </div>
            {/* Accommodation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Type *</label>
              <select
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Type</option>
                {accommodationTypes.map(type => <option key={type.code} value={type.name}>{type.name} ({type.code})</option>)}
              </select>
            </div>
            {/* Number of Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms *</label>
              <input
                type="number"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
              {errors.numberOfRooms && <p className="text-sm text-red-500 mt-1">{errors.numberOfRooms}</p>}
            </div>
          </div>
          {submitError && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{submitError}</div>}
          
          <button
            type="submit"
            disabled={isSubmitting || !emailVerified}
            className={`w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity ${
              isSubmitting || !emailVerified ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isSubmitting ? (
              <>
                <DolphinSpinner size="sm" />
                Creating Account...
              </>
            ) : !emailVerified ? (
              "Verify Email First"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;