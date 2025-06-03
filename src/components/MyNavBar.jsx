import { Navbar, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../App.css";

function MyNavBar() {
  return (
    <Navbar className="custom-color p-0" expand="lg">
      <Container className="justify-content-center">
        <Navbar.Brand as={Link} to="/" className="text-center">
          <img src="src/assets/skysunlogo.png" width="150" className="d-inline-block align-top" alt="SkySun logo" />
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default MyNavBar;
