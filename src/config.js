// Este archivo determina automáticamente hacia dónde deben ir las peticiones.
// En desarrollo (Vite) VITE_API_URL no existe, por lo que usará '/api' (que Vite redirige a localhost)
// En producción (Netlify), leerá la URL de Render que configures en Netlify.
export const API_URL = import.meta.env.VITE_API_URL || '/api';
