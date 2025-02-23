// client/src/components/GuestDemographics.js
import React from "react";

const GuestDemographics = ({ data, year, month, onExport }) => {
  return (
    <div>
      <h3>Guest Demographics (Check-Ins Only) - {new Date(0, month - 1).toLocaleString("default", { month: "long" })} {year}</h3>
      <button className="btn btn-success mb-3" onClick={onExport}>
        Export Guest Demographics to Excel
      </button>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Gender</th>
              <th>Age Group</th>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((demo, index) => (
              <tr key={index}>
                <td>{demo.gender}</td>
                <td>{demo.age_group}</td>
                <td>{demo.status}</td>
                <td>{demo.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestDemographics;