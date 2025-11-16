// Add type annotations for props
interface MetricsDisplayProps {
  averageLengthOfStay: string;
  averageRoomOccupancyRate: string;
  averageGuestsPerRoom: string;
}

const MetricsDisplay = ({ averageLengthOfStay, averageRoomOccupancyRate, averageGuestsPerRoom }: MetricsDisplayProps) => {
  return (
    <div className="mt-4">
      <h3>Calculated Results</h3>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Avg. Length of Stay</h5>
              <p className="card-text">{averageLengthOfStay}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Avg. Room Occupancy Rate</h5>
              <p className="card-text">{averageRoomOccupancyRate}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Avg. Guests per Room</h5>
              <p className="card-text">{averageGuestsPerRoom}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
