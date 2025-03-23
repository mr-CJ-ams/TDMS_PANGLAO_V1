import React from "react";
import { Modal } from "react-bootstrap";
import SubmissionDetails from "../pages/SubmissionDetails"

const SubmissionDetailsModal = ({ show, onHide, submissionId }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Submission Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SubmissionDetails submissionId={submissionId} />
      </Modal.Body>
    </Modal>
  );
};

export default SubmissionDetailsModal;