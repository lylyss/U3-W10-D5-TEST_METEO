import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "../App.css";

const ApiKey = "afef81ecca186c79293fbc7be8e48057";
const PixabayApiKey = "50060060-a0b6bfa38db8f4d3d8815a519";

function PaginaDettagli() {
  const { city } = useParams();
  const [meteo, setMeteo] = useState(null);
  const [previsioni, setPrevisioni] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [giornoSelezionato, setGiornoSelezionato] = useState(null);
  const [mostraTutte, setMostraTutte] = useState(false);

  useEffect(() => {
    const recuperaMeteo = async () => {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${ApiKey}`);
      const geoData = await geoRes.json();
      if (!geoData[0]) return;
      const { lat, lon } = geoData[0];

      /* API meteo attuale */
      const meteoRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKey}&units=metric&lang=it`);
      const datiMeteo = await meteoRes.json();
      setMeteo(datiMeteo);

      /* API previsioni 5 giorni */
      const previsioniRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${ApiKey}&units=metric&lang=it`);
      const datiPrevisioni = await previsioniRes.json();
      setPrevisioni(datiPrevisioni.list);

      /* API Pixabay per immagine di sfondo */
      const pixabayRes = await fetch(`https://pixabay.com/api/?key=${PixabayApiKey}&q=${city}&image_type=photo&orientation=horizontal`);
      const pixabayData = await pixabayRes.json();
      if (pixabayData.hits.length > 0) {
        const randomIndex = Math.floor(Math.random() * pixabayData.hits.length);
        setBackgroundImage(pixabayData.hits[randomIndex].largeImageURL);
      }
    };

    recuperaMeteo();
  }, [city]);

  /* Raggruppa le previsioni per giorno della settimana */
  const previsioniRaggruppate = previsioni.reduce((acc, item) => {
    const giorno = new Date(item.dt * 1000).toLocaleDateString("it-IT", {
      weekday: "long",
    });
    if (!acc[giorno]) {
      acc[giorno] = [];
    }
    acc[giorno].push(item);
    return acc;
  }, {});

  const previsioni24Ore = previsioni.filter((item, index) => index % 2 === 0).slice(0, 12);

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <Container className="py-4">
        <Row className="justify-content-center ">
          {/* Colonna sinistra: Informazioni città */}
          <Col xs={12} md={6} className="text-start BgCitta mt-3">
            <h1 className="display-4">{city}</h1>
            <p className="lead">
              {new Date().toLocaleDateString("it-IT", {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <h2 className="display-1">{meteo ? `${Math.round(meteo.main.temp)}°C` : "--"}</h2>
            <div className="d-flex align-items-center">
              {meteo && (
                <img
                  src={`https://openweathermap.org/img/wn/${meteo.weather[0].icon}@2x.png`}
                  alt={meteo.weather[0].description}
                  style={{ width: "50px", height: "50px", marginRight: "10px" }}
                />
              )}
              <p className="lead">{meteo ? meteo.weather[0].description : "Caricamento..."}</p>
            </div>
          </Col>

          {/* Colonna destra: Previsioni nelle prossime 24 ore */}
          <Col xs={12} md={6} className="mt-3 pt-0">
            <Card className="Prevesioni text-black satin-bg">
              <Card.Body>
                <h4 className="text-center">Previsioni nelle prossime 24 ore</h4>
                <ul className="list-unstyled">
                  {(mostraTutte ? previsioni24Ore : previsioni24Ore.slice(0, 4)).map((item, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <span>
                        <strong>
                          {new Date(item.dt * 1000).toLocaleTimeString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </strong>
                      </span>
                      <span>{Math.round(item.main.temp)}°C</span>
                      <img
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                        alt={item.weather[0].description}
                        style={{ width: "40px", height: "40px" }}
                      />
                    </li>
                  ))}
                </ul>
                <Button variant="black" className="mt-3" onClick={() => setMostraTutte(!mostraTutte)}>
                  {mostraTutte ? "Mostra meno" : "Mostra tutte"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Colonna inferiore: Giorni della settimana */}
        <Row className="mt-5">
          <Col xs={12} md={4} className="pt-0">
            <Card className="Prevesioni text-black satin-bg">
              <Card.Body>
                <h4 className="text-center">Giorni della settimana</h4>
                <ul className="list-unstyled">
                  {Object.keys(previsioniRaggruppate).map((giorno, index) => {
                    return (
                      <li
                        key={index}
                        className={`my-3 d-flex justify-content-between align-items-center ${giornoSelezionato === giorno ? "text-primary" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setGiornoSelezionato(giorno)}
                      >
                        <span>
                          <strong>{giorno}</strong>
                        </span>
                        {previsioniRaggruppate[giorno][0]?.weather[0]?.icon && (
                          <img
                            src={`https://openweathermap.org/img/wn/${previsioniRaggruppate[giorno][0].weather[0].icon}@2x.png`}
                            alt={previsioniRaggruppate[giorno][0].weather[0].description}
                            style={{ width: "40px", height: "40px" }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card.Body>
            </Card>
          </Col>

          {/* Colonna destra: Previsioni per il giorno selezionato */}
          <Col xs={12} md={8} className="pt-1">
            <Card className="Prevesioni text-black satin-bg">
              <Card.Body>
                <h4 className="text-center">
                  {giornoSelezionato
                    ? `Previsioni per ${giornoSelezionato}`
                    : Object.keys(previsioniRaggruppate)[1]
                    ? `Previsioni per ${Object.keys(previsioniRaggruppate)[1]}`
                    : "Nessuna previsione disponibile"}
                </h4>
                <Row>
                  {(giornoSelezionato ? previsioniRaggruppate[giornoSelezionato] : previsioniRaggruppate[Object.keys(previsioniRaggruppate)[1]])
                    ?.slice(0, 6)
                    .map((item, index) => (
                      <Col xs={6} md={4} key={index} className="mb-3">
                        <Card className="text-center bg-dark text-light">
                          <Card.Body>
                            <p>
                              <strong>
                                {new Date(item.dt * 1000).toLocaleTimeString("it-IT", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </strong>
                            </p>
                            <p>{Math.round(item.main.temp)}°C</p>
                            <img
                              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                              alt={item.weather[0].description}
                              style={{ width: "40px", height: "40px" }}
                            />
                            <p>{item.weather[0].description}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PaginaDettagli;
