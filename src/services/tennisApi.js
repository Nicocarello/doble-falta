// NOTA: Se está llamando directamente a la API externa desde el frontend porque las Cloud Functions
// requieren subir el proyecto al Plan Blaze de Firebase.
const API_KEY = 'd46d92e3827836bf3ce38f94eda654e1769077e4ed7e044eeae45fbbfa8f0024'
const API_URL = 'https://api.api-tennis.com/tennis/'

export { API_KEY, API_URL }

export const fetchFromApi = async (method, params = {}) => {
  const query = new URLSearchParams({ method, APIkey: API_KEY, ...params }).toString()
  const response = await fetch(`${API_URL}?${query}`)

  if (!response.ok) {
    throw new Error(`Error en la API: ${response.statusText}`)
  }

  return response.json()
}
