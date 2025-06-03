import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Col } from "react-bootstrap";
import MyNavBar from "./components/MyNavBar";
import MyFooter from "./components/MyFooter";
import HomePage from "./components/HomePage";
import DetailsPage from "./components/DetailsPage";

function App() {
  return (
    <Router>
      <Col className="d-flex flex-column min-vh-100">
        <MyNavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/details/:city" element={<DetailsPage />} />
        </Routes>
        <MyFooter />
      </Col>
    </Router>
  );
}

export default App;
