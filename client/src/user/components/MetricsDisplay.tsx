// Add type annotations for props
interface MetricsDisplayProps {
  averageGuestNights: string;
  averageRoomOccupancyRate: string;
  averageGuestsPerRoom: string;
}

const MetricsDisplay = ({ averageGuestNights, averageRoomOccupancyRate, averageGuestsPerRoom }: MetricsDisplayProps) => {
  return (
    <div className="mt-4">
      <h3>Calculated Results</h3>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Guest Nights</h5>
              <p className="card-text">{averageGuestNights}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Room Occupancy Rate</h5>
              <p className="card-text">{averageRoomOccupancyRate}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Guests per Room</h5>
              <p className="card-text">{averageGuestsPerRoom}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
