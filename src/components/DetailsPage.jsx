import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Accordion } from "react-bootstrap";
import "./DetailsPage.css";

const ApiKey = "afef81ecca186c79293fbc7be8e48057";

function PaginaDettagli() {
  const { city } = useParams();
  const [meteo, setMeteo] = useState(null);
  const [previsioni, setPrevisioni] = useState([]);

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

  return (
    <Container className="contenitore-dettagli py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <div className="text-center">
            <h1 className="mb-4">{city}</h1>
            <p className="text-muted mb-4">
              {new Date().toLocaleDateString("it-IT", {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <div className="info-meteo">
              <h2>{meteo ? `${Math.round(meteo.main.temp)}°C` : "--"}</h2>
              <p>{meteo ? meteo.weather[0].description : "Caricamento..."}</p>
            </div>
            <div className="info-vento mt-4">
              <h5>Velocità del vento</h5>
              <p>{meteo ? `${meteo.wind.speed} m/s` : "--"}</p>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col xs={12}>
          <h3 className="text-center mb-4">Previsioni per i prossimi 5 giorni</h3>
          <Accordion>
            {Object.keys(previsioniRaggruppate).map((giorno, index) => (
              <Accordion.Item eventKey={index} key={index}>
                <Accordion.Header>{giorno}</Accordion.Header>
                <Accordion.Body>
                  {previsioniRaggruppate[giorno].map((item, orarioIndex) => (
                    <div key={orarioIndex} className="d-flex justify-content-between mb-2">
                      <span>{new Date(item.dt * 1000).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>
                        <strong>T:</strong> {Math.round(item.main.temp)}°C
                      </span>
                      <span>
                        <strong>Min:</strong> {Math.round(item.main.temp_min)}°C | <strong>Max:</strong> {Math.round(item.main.temp_max)}°C
                      </span>
                      <span>{item.weather[0].description}</span>
                    </div>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
}

export default PaginaDettagli;
