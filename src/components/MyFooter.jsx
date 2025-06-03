import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer className="custom-color text-light py-3">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; 2025 SkySun. Tutti i diritti riservati.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
