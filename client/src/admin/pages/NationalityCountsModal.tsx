import { Modal, ListGroup, Button } from "react-bootstrap";

interface NationalityCountsModalProps {
  show: boolean;
  onHide: () => void;
  nationalityCounts: Record<string, number>; // { [nationality: string]: number }
}

const NationalityCountsModal = ({ show, onHide, nationalityCounts }: NationalityCountsModalProps) => (
  <Modal show={show} onHide={onHide} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Nationality Counts (Check-Ins Only)</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ListGroup>
        {Object.entries(nationalityCounts).map(([nationality, count]) => (
          <ListGroup.Item key={nationality}>
            {nationality}: {count}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default NationalityCountsModal;