import React from "react";

const Ordinance = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
        Municipal Ordinance No. 04, Series of 2020
      </h1>

      {/* Section 1: Title */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 1: Title</h2>
        <p className="text-gray-700">
          This ordinance shall be known as the <strong>Tourist Arrival Monitoring Ordinance of Panglao, Bohol</strong>.
        </p>
      </section>

      {/* Section 2: Declaration of Policy */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 2: Declaration of Policy</h2>
        <p className="text-gray-700">
          It is the declared policy of the municipal government of Panglao to develop Municipality of Panglao as a{" "}
          <strong>primary tourist attraction area and destination</strong> with the goal of promoting investment for the municipality.
        </p>
      </section>

      {/* Section 3: Definition of Terms */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 3: Definition of Terms</h2>
        <p className="text-gray-700 mb-4">
          For the purpose of this Ordinance, the terms and phrases enumerated in this Section shall be construed or interpreted to mean or to refer to, as follows:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            <strong>Tourism Enterprises</strong>: Facilities, services, and attractions involved in tourism, such as, but not limited to:
            <ul className="list-disc list-inside ml-8">
              <li>Travel and tour services</li>
              <li>Tourist transport services (land, sea, air)</li>
              <li>Tour guides</li>
              <li>Adventure sports services (e.g., mountaineering, spelunking, scuba diving)</li>
              <li>Convention organizers</li>
              <li>Accommodation establishments (e.g., hotels, resorts, apartelles, tourist inns, motels, pension houses, home stay operators)</li>
              <li>Tourism estate management services</li>
              <li>Restaurants, shops, department stores</li>
              <li>Sports and recreational centers, spas, museums, galleries, theme parks, convention centers</li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Primary Tourism Enterprises</strong>: Refers to:
            <ul className="list-disc list-inside ml-8">
              <li>Travel and tour services</li>
              <li>Land, sea, and air transport services exclusively for tourist use</li>
              <li>Accommodation establishments</li>
              <li>Convention and exhibition organizers</li>
              <li>Tourism estate management services</li>
              <li>Other enterprises identified by the Secretary after consultation</li>
            </ul>
          </li>
          <li>
            <strong>Secondary Tourism Enterprises</strong>: Refers to all other tourism enterprises not covered under primary tourism enterprises.
          </li>
        </ul>
      </section>

      {/* Section 4: General Provisions */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 4: General Provisions</h2>
        <p className="text-gray-700 mb-4">
          a. All tourism accommodation establishments such as, but not limited to, beaches, mountain resorts, theme and leisure parks, government establishments catering day tourists, museums, convention centers and facilities, sports centers, recreational centers and facilities, and such other private establishments and travel agency operators in the municipality of Panglao are hereby required to submit regular monthly reports on tourist statistical data to the{" "}
          <strong>Product Development, Planning, and Research Section of Panglao Municipal Tourism Office (PMTO)</strong>.
        </p>
        <p className="text-gray-700 mb-4">
          b. The said report shall be submitted <strong>not later than every 10th day of the month</strong>.
        </p>
        <p className="text-gray-700 mb-4">
          c. The imposition of fines shall be determined by the <strong>Tourism Statistician</strong>, duly approved upon review by the <strong>Municipal Tourism Officer</strong>. Such fines shall be paid at the <strong>Municipal Treasurer's Office</strong>. An <strong>Official Receipt</strong> shall be presented during the renewal of the <strong>Business Permit</strong> for the issuance of the <strong>Tourism Compliance Certificate</strong>.
        </p>
        <p className="text-gray-700">
          d. All tourism accommodation establishments such as, but not limited to, beaches, mountain resorts, theme and leisure parks, government establishments catering day tourists, museums, convention centers and facilities, sports centers, recreational centers and facilities, and such other private establishments and travel agency operators in the municipality of Panglao shall be provided with a <strong>standard tourist statistics data format</strong> from the <strong>Panglao Municipal Tourism Office (PMTO)</strong> to ensure concise and comprehensive reporting.
        </p>
      </section>

      {/* Section 5: Statistical Forms and Details of Report */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 5: Statistical Forms and Details of Report</h2>
        <p className="text-gray-700 mb-4">
          Accommodation establishments shall report regularly <strong>Form A-DAE 1A</strong> on a monthly basis with the following data:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            <strong>Total Number of Tourists by Nationality</strong>
          </li>
          <li className="mb-2">
            <strong>Total Number of Guest Check-ins</strong>
          </li>
          <li className="mb-2">
            <strong>Average Guest Nights</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>Formula: <code>Average Guest Nights = Total Number of Guest Nights / Total Number of Guest Check-ins</code></li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Average Number of Guests per Room</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>Formula: <code>Average Number of Guests per Room = Total Number of Guest Nights / Total Number of Rooms Occupied by Guests</code></li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Average Room Occupancy Rate</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>Formula: <code>Average Room Occupancy Rate = Total Number of Rooms Occupied during the Month / Total Number of Rooms Available during the Month</code></li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Visitors Arrival Report Form 1 (VAR 1)</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>Used by theme and leisure parks, government and private establishments catering day tourists, and museums.</li>
              <li>Shall be reported every <strong>10th of the month</strong>.</li>
            </ul>
          </li>
          <li>
            <strong>Convention Utilization Survey Form (CUS Form)</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>Used by convention centers and facilities, sports centers, recreational centers, and event organizers.</li>
              <li>Shall be reported <strong>right after the event has been conducted</strong>.</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Section 6: Conduct of Surveys */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 6: Conduct of Surveys</h2>
        <p className="text-gray-700 mb-4">
          The <strong>Municipal Tourism Office</strong> shall conduct periodic <strong>Tourist Profiling and Characteristics Survey</strong> or data gathering to ensure quality standards of services and:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            <strong>Departure Point Visitor Survey</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>To be conducted in all departure terminals of airports and bus stations.</li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Tourist Attraction Visitor Survey</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>To be conducted in all identified tourist attractions such as, but not limited to, theme and leisure parks, government and private establishments catering day tourists, and museums.</li>
            </ul>
          </li>
          <li>
            <strong>Accommodation Establishment Visitor Survey</strong>:
            <ul className="list-disc list-inside ml-8">
              <li>To be conducted on selected accommodation establishments. A quarterly survey that provides information about short-term commercial accommodation activity.</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Section 7: Violations */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 7: Violations</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">Reporting <strong>inaccurate, fictitious, fabricated, and under-declared data/reports</strong>.</li>
          <li className="mb-2"><strong>Disobliging and uncooperative establishments</strong> during the conduct of surveys.</li>
          <li><strong>Late submission of reports</strong> duly required by the Tourism Office.</li>
        </ul>
      </section>

      {/* Section 8: Penalty */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 8: Penalty</h2>
        <p className="text-gray-700 mb-4">
          Tourism establishments which fail to comply with the requirements and mitigating procedure under this ordinance shall be fined upon conviction of the court depending on the following circumstances:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            <strong>Late submission</strong> shall be fined <strong>Two Thousand Five Hundred Pesos (Php 2,500.00)</strong> per monthly submission.
          </li>
          <li className="mb-2">
            <strong>Disobliging and uncooperative establishments</strong> during the conduct of surveys shall be fined <strong>Two Thousand Five Hundred Pesos (Php 2,500.00)</strong> per violation.
          </li>
          <li className="mb-2">
            Establishment found reporting <strong>inaccurate, fictitious, fabricated, and under-declared data/reports</strong> shall be fined:
            <ul className="list-disc list-inside ml-8">
              <li><strong>First Offense</strong>: Two Thousand Pesos (Php 2,000.00)</li>
              <li><strong>Second Offense</strong>: Two Thousand Five Hundred Pesos (Php 2,500.00)</li>
              <li><strong>Third Offense</strong>: <strong>Revocation of Business Permit</strong></li>
            </ul>
          </li>
          <li>
            Those establishments which shall incur more than three offenses under this Ordinance shall be classified as <strong>notorious violators</strong> and shall suffer the penalty of <strong>imprisonment of not less than 10 days or not more than 30 days</strong> and a fine of <strong>Two Thousand Five Hundred Pesos (Php 2,500.00)</strong> for every violation incurred, respectively.
          </li>
        </ul>
      </section>

      {/* Section 9: Administrative Penalty */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 9: Administrative Penalty</h2>
        <p className="text-gray-700">
          Violators who have received a <strong>Notice of Violation</strong> from the Municipal Mayor and who do not wish to contest the violation may opt to pay the <strong>administrative fine of One Thousand Pesos (Php 1,000.00)</strong> per violation within <strong>seven (7) days</strong> from receipt of such notice.
        </p>
      </section>

      {/* Section 10: Mitigating Procedure for Violations */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 10: Mitigating Procedure for Violations</h2>
        <p className="text-gray-700 mb-4">
          a. Upon determining that the report being submitted is <strong>inaccurate, fictitious, fabricated, and/or under-declared</strong>, the <strong>Municipal Tourism Officer</strong> shall require a <strong>written explanation</strong> from the concerned establishment.
        </p>
        <p className="text-gray-700 mb-4">
          b. If the response of the concerned establishment is unsatisfactory, the <strong>Municipal Tourism Officer</strong> shall hereby call for a <strong>dialogue</strong> with the violator to reconcile and rectify the data and will be given <strong>fifteen (15) days</strong> to comply.
        </p>
        <p className="text-gray-700">
          c. If the rectification process is ineffective and is undeniably found to be and insisting non-compliant, the <strong>Municipal Tourism Officer</strong> shall hereby recommend to the <strong>Mayor</strong> the issuance of a <strong>Notice of Violation</strong> to the concerned establishment, and be given a period of <strong>seven (7) days</strong> within which to opt to pay the administrative fine as provided in <strong>Section 9</strong> above.
        </p>
      </section>

      {/* Section 11: Separability Clause */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 11: Separability Clause</h2>
        <p className="text-gray-700">
          In the event that a provision of this Ordinance is found or decreed to be invalid or unconstitutional, all other provisions hereof not affected by such pronouncement or decree shall remain to be in full force and effect.
        </p>
      </section>

      {/* Section 12: Effectivity Clause */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Section 12: Effectivity Clause</h2>
        <p className="text-gray-700">
          This Ordinance shall take effect after <strong>15 days</strong> following the completion of its full publication in any newspaper of general circulation within the province of Bohol.
        </p>
      </section>

      {/* Approval Section */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Approval</h2>
        <p className="text-gray-700 mb-4">
          <strong>Unanimously Approved</strong>: This <strong>21st day of September 2020</strong> at Panglao, Bohol.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Certified by</strong>:<br />
          Hon. Briceio D. Velasco<br />
          Vice Mayor/Presiding Officer
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Attested by</strong>:<br />
          Analyn Alcala-Apduhan<br />
          SB Secretary
        </p>
        <p className="text-gray-700">
          <strong>Approved by</strong>:<br />
          Hon. Leonila P. Montero<br />
          Municipal Mayor
        </p>
      </section>
    </div>
  );
};

export default Ordinance;