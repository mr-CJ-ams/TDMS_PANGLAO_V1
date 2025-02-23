import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Import Link

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registeredOwner, setRegisteredOwner] = useState("");
  const [tin, setTin] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [accommodationType, setAccommodationType] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";


  const barangays = ["Bil‑isan", "Bolod", "Danao", "Doljo", "Libaong", "Looc", "Lourdes", "Poblacion", "Tangnan", "Tawala"]; // Replace with actual barangays
  const accommodationTypes = [
    { name: "Hotel", code: "HTL" },
    { name: "Condotel", code: "CON" },
    { name: "Serviced Residence", code: "SER" },
    { name: "Resort", code: "RES" },
    { name: "Apartelle", code: "APA" },
    { name: "Motel", code: "MOT" },
    { name: "Pension House", code: "PEN" },
    { name: "Home Stay Site", code: "HSS" },
    { name: "Tourist Inn", code: "TIN" },
    { name: "Other", code: "OTH" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        username,
        email,
        password,
        phone_number: phoneNumber,
        registered_owner: registeredOwner,
        tin,
        company_name: companyName,
        company_address: companyAddress,
        accommodation_type: accommodationType,
        number_of_rooms: numberOfRooms,
      });
      alert("Signup successful! Waiting for admin approval.");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Company Name</label>
          <input
            type="text"
            className="form-control"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            className="form-control"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Registered Owner</label>
          <input
            type="text"
            className="form-control"
            value={registeredOwner}
            onChange={(e) => setRegisteredOwner(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Tax Identification No. (TIN)</label>
          <input
            type="text"
            className="form-control"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Company Address</label>
          <select
            className="form-control"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            required
          >
            <option value="">Select Barangay</option>
            {barangays.map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Accommodation Type</label>
          <select
            className="form-control"
            value={accommodationType}
            onChange={(e) => setAccommodationType(e.target.value)}
            required
          >
            <option value="">Select Accommodation Type</option>
            {accommodationTypes.map((type) => (
              <option key={type.code} value={type.name}>
                {type.name} ({type.code})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Number of Rooms</label>
          <input
            type="number"
            className="form-control"
            value={numberOfRooms}
            onChange={(e) => setNumberOfRooms(e.target.value)}
            min="1"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Signup
        </button>
      </form>

      {/* Link for Login */}
      <div className="mt-3">
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;