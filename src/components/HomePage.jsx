import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Alert, Card, CloseButton, ListGroup } from "react-bootstrap";
import "../App.css";

const ApiKey = "afef81ecca186c79293fbc7be8e48057";
const PixabayApiKey = "50060060-a0b6bfa38db8f4d3d8815a519";

function HomePage() {
  const [city, setCity] = useState("");
  const [recentCities, setRecentCities] = useState([]);
  const [cityTemperatures, setCityTemperatures] = useState({});
  const [cityImages, setCityImages] = useState({});
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCities = localStorage.getItem("recentCities");
    if (savedCities) {
      const cities = JSON.parse(savedCities);
      setRecentCities(cities);
      fetchTemperatures(cities);
      fetchCityImages(cities).then((images) => setCityImages(images));
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

  const fetchCityImages = async (cities) => {
    const images = {};
    for (const cityName of cities) {
      try {
        console.log(`Recupero immagine per: ${cityName}`);
        const pixabayRes = await fetch(`https://pixabay.com/api/?key=${PixabayApiKey}&q=${cityName}&image_type=photo&orientation=horizontal`);
        const pixabayData = await pixabayRes.json();
        console.log(`Risultati Pixabay per ${cityName}:`, pixabayData);

        if (pixabayData.hits.length > 0) {
          images[cityName] = pixabayData.hits[0].largeImageURL;
          console.log(`Immagine trovata per ${cityName}: ${images[cityName]}`);
        } else {
          console.warn(`Nessuna immagine trovata per ${cityName}`);
          images[cityName] = "/assets/78791.jpg";
        }
      } catch (error) {
        console.error(`Errore nel recupero dell'immagine per ${cityName}:`, error);
        images[cityName] = "/assets/78791.jpg";
      }
    }
    console.log("Immagini finali:", images);
    return images;
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
    fetchCityImages(nuoveCitta).then((images) => setCityImages(images));
  };

  const handleSearch = async (query) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${ApiKey}`);
      const geoData = await geoRes.json();
      setSearchResults(geoData);
    } catch {
      setSearchResults([]);
    }
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
    fetchCityImages(nuoveCitta).then((images) => setCityImages(images));
  };

  const handleAddCityFromSearch = (cityName) => {
    saveCity(cityName);
    setSearchResults([]);
  };

  return (
    <Col className="myBg m-0">
      <Row className="justify-content-center mb-4 d-flex flex-column align-items-center">
        <Col md={10} lg={12} className="text-center ">
          <h1 className="mb-4 fw-bold text-primary">Cerca le previsioni meteo</h1>
          <div className="d-flex justify-content-center px-5">
            <Form onSubmit={handleSubmit} className="d-flex gap-2 " style={{ width: "50%" }}>
              <Form.Control
                type="text"
                placeholder="Aggiungi una città"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  handleSearch(e.target.value);
                }}
                required
                aria-label="Inserisci una città"
                autoFocus
              />
            </Form>
          </div>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          {searchResults.length > 0 && (
            <ListGroup className="mt-3">
              {searchResults.map((result, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAddCityFromSearch(result.name)}
                >
                  <span>{result.name}</span>
                  <small>{result.country}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
      {recentCities.length > 0 && (
        <Row className="justify-content-center">
          <Col md={10} lg={10} className="text-start">
            <h4 className="mb-3 text-light">Meteo città recenti</h4>
            <Row className="g-3">
              {recentCities.map((cityName) => (
                <Col xs={12} md={6} lg={6} key={cityName}>
                  <Card
                    className="text-white"
                    style={{
                      backgroundImage: `url(${cityImages[cityName] || "https://via.placeholder.com/600x400?text=No+Image"})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      minHeight: "200px",
                    }}
                  >
                    <Card.Body
                      className="d-flex flex-column justify-content-between rounded-3"
                      style={{ backdropFilter: "blur(1px)", backgroundColor: "rgba(0, 0, 0, 0.32)" }}
                    >
                      <Card.Title className="text-capitalize">{cityName}</Card.Title>
                      <Card.Text>
                        <strong>Temperatura: {cityTemperatures[cityName]?.temp || "--"}°C</strong>
                        <br />
                        <small>
                          Min: {cityTemperatures[cityName]?.tempMin || "--"}°C | Max: {cityTemperatures[cityName]?.tempMax || "--"}°C
                        </small>
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <Button variant="light" onClick={() => handleRecentClick(cityName)}>
                          Dettagli
                        </Button>
                        <CloseButton onClick={() => handleRemoveCity(cityName)} aria-label={`Rimuovi ${cityName}`} style={{ color: "white" }} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}
    </Col>
  );
}

export default HomePage;
