import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import MyNavBar from "./components/MyNavBar";
import MyFooter from "./components/MyFooter";
import HomePage from "./components/HomePage";
import DetailsPage from "./components/DetailsPage";

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <MyNavBar />
        <Container className="d-flex flex-grow-1 flex-column align-items-center justify-content-center">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/details/:city" element={<DetailsPage />} />
          </Routes>
        </Container>
        <MyFooter />
      </div>
    </Router>
  );
}

export default App;
