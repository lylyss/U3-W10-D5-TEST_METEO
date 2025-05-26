import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert, Card, CloseButton } from "react-bootstrap";

const ApiKey = "afef81ecca186c79293fbc7be8e48057";

function HomePage() {
  const [city, setCity] = useState("");
  const [recentCities, setRecentCities] = useState([]);
  const [cityTemperatures, setCityTemperatures] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCities = localStorage.getItem("recentCities");
    if (savedCities) {
      const cities = JSON.parse(savedCities);
      setRecentCities(cities);
      fetchTemperatures(cities);
    }
  }, []);

  const fetchTemperatures = async (cities) => {
    const temperatures = {};
    for (const cityName of cities) {
      try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${ApiKey}`);
        const geoData = await geoRes.json();

        if (geoData.length > 0) {
          const { lat, lon } = geoData[0];
          const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKey}&units=metric&lang=it`);
          const weatherData = await weatherRes.json();
          temperatures[cityName] = {
            temp: Math.round(weatherData.main.temp),
            tempMin: Math.round(weatherData.main.temp_min),
            tempMax: Math.round(weatherData.main.temp_max),
          };
        }
      } catch {
        temperatures[cityName] = { temp: "--", tempMin: "--", tempMax: "--" };
      }
    }
    setCityTemperatures(temperatures);
  };

  const saveCity = (cityName) => {
    const cleanCity = cityName.trim();
    if (cleanCity === "") return;
    let nuoveCitta = recentCities.filter((city) => city.toLowerCase() !== cleanCity.toLowerCase());
    nuoveCitta.unshift(cleanCity);
    if (nuoveCitta.length > 5) {
      nuoveCitta = nuoveCitta.slice(0, 5);
    }
    setRecentCities(nuoveCitta);
    localStorage.setItem("recentCities", JSON.stringify(nuoveCitta));
    fetchTemperatures(nuoveCitta);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (city.trim() !== "") {
      try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city.trim()}&limit=1&appid=${ApiKey}`);
        const geoData = await geoRes.json();
        if (geoData.length === 0) {
          setError("❌ La città inserita non esiste. Riprova.");
          return;
        }
        setError("");
        saveCity(city);
        navigate(`/details/${city.trim()}`);
      } catch {
        setError("⚠️ Si è verificato un errore. Riprova più tardi.");
      }
    }
  };

  const handleRecentClick = (cityName) => {
    navigate(`/details/${cityName}`);
  };

  const handleRemoveCity = (cityName) => {
    const nuoveCitta = recentCities.filter((city) => city !== cityName);
    setRecentCities(nuoveCitta);
    localStorage.setItem("recentCities", JSON.stringify(nuoveCitta));
    fetchTemperatures(nuoveCitta);
  };

  return (
    <Container>
      <Row className="justify-content-center mb-4">
        <Col md={10} lg={12}>
          <h1 className="mb-4 fw-bold text-primary">Cerca le previsioni meteo</h1>
          <Form onSubmit={handleSubmit} className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Aggiungi una città"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              aria-label="Inserisci una città"
              autoFocus
            />
            <Button type="submit" variant="primary" className="d-flex align-items-center">
              ➕
            </Button>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Col>
      </Row>
      {recentCities.length > 0 && (
        <Row className="justify-content-center">
          <Col md={10} lg={12} className="text-center">
            <h4 className="mb-3 text-secondary">Meteo città recenti</h4>
            <Row className="g-2">
              {recentCities.map((cityName) => (
                <Col xs={12} md={6} lg={6} key={cityName}>
                  <Card>
                    <Card.Body>
                      <Card.Title className="text-capitalize">{cityName}</Card.Title>
                      <Card.Text>
                        <strong>Temperatura: {cityTemperatures[cityName]?.temp || "--"}°C</strong>
                        <br />
                        <small>
                          Min: {cityTemperatures[cityName]?.tempMin || "--"}°C | Max: {cityTemperatures[cityName]?.tempMax || "--"}°C
                        </small>
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <Button variant="primary" onClick={() => handleRecentClick(cityName)}>
                          Dettagli
                        </Button>
                        <CloseButton onClick={() => handleRemoveCity(cityName)} aria-label={`Rimuovi ${cityName}`} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default HomePage;
