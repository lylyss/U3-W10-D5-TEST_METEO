import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function MyNavBar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Home
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"></Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavBar;
