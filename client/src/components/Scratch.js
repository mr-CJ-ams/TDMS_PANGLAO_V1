const AdminDashboard = () => {
  
  return (
  <div className="container-fluid">
    {/* ... your existing sidebar */}
    
    <div className="col-md-9">
      {/* ... your existing sections */}
      
      {activeSection === "drafts" && (
        <div className="p-4">
          <h3>In-Progress Submissions</h3>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Establishment</th>
                  <th>Month/Year</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(draft => (
                  <tr key={draft.draft_id}>
                    <td>{draft.company_name}</td>
                    <td>{`${getMonthName(draft.month)} ${draft.year}`}</td>
                    <td>{new Date(draft.last_updated).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => viewDraftDetails(draft.draft_id)}
                        className="btn btn-info btn-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

    {/* Draft Details Modal */}
    <Modal 
      show={showDraftModal} 
      onHide={() => setShowDraftModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Draft Submission - {selectedDraft?.company_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedDraft && (
          <div>
            <h5>
              {getMonthName(selectedDraft.month)} {selectedDraft.year}
            </h5>
            
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Total Check-Ins</h6>
                    <p className="card-text display-6">
                      {calculateDraftMetrics(selectedDraft).totalCheckIns}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Total Overnight</h6>
                    <p className="card-text display-6">
                      {calculateDraftMetrics(selectedDraft).totalOvernight}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Occupied Rooms</h6>
                    <p className="card-text display-6">
                      {calculateDraftMetrics(selectedDraft).totalOccupied}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h5>Daily Data</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Check-Ins</th>
                    <th>Overnight</th>
                    <th>Occupied</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDraft.days.map(day => (
                    <tr key={day.day}>
                      <td>{day.day}</td>
                      <td>{day.check_ins}</td>
                      <td>{day.overnight}</td>
                      <td>{day.occupied}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => setShowDraftModal(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
);
};

export default AdminDashboard;