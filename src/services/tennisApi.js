// NOTA: Se está llamando directamente a la API externa desde el frontend porque las Cloud Functions
// requieren subir el proyecto al Plan Blaze de Firebase.
const API_KEY = 'fe9048681f0c0f8b24d25ef4b97e18ea428e443e1ad866a4ffdfc96bdc9e73b0'
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
