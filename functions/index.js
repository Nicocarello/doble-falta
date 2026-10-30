const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

// Guardando la llave en el backend. 
// Para ser 100% estrictos se usa Google Secret Manager, pero tenerla acá escrita
// YA soluciona el problema crítico: jamás llegará al navegador del usuario.
const TENNIS_API_KEY = "7008b428b2fe82e9d128a01fee42f16d6f4cf158e061da1c99ba52b6a98fc224";
const TENNIS_API_URL = "https://api.api-tennis.com/tennis/";

exports.tennisapi = onRequest({
  maxInstances: 10,
  region: "us-central1"
}, (req, res) => {
  // CORS permite que el navegador acepte la respuesta
  cors(req, res, async () => {
    try {
      // Tomamos todos los parámetros que mande React (?method=get_fixtures&date=...)
      const queryParams = new URLSearchParams(req.query);

      // Y le inyectamos a escondidas LA LLAVE MAESTRA
      queryParams.set('APIkey', TENNIS_API_KEY);

      const targetUrl = `${TENNIS_API_URL}?${queryParams.toString()}`;

      // Hacemos el fetch desde EL SERVIDOR hacia la API de Tenis
      const apiRes = await fetch(targetUrl);
      const data = await apiRes.json();

      // Devolvemos el resultado al frontend (React)
      res.status(200).json(data);
    } catch (error) {
      logger.error("Error consumiendo la API de tenis", error);
      res.status(500).json({ error: "No se pudo comunicar con el proveedor externo" });
    }
  });
});
