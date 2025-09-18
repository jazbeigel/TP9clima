# Weather App

Aplicación de pronóstico del clima construida con React y Vite siguiendo el challenge de [DevChallenges](https://devchallenges.io/challenge/weather-app). Permite buscar el clima actual y el pronóstico de los próximos días para cualquier ciudad, alternar entre unidades Celsius/Fahrenheit y elegir modo claro/oscuro.

## Requisitos previos

1. Crear una cuenta gratuita en [OpenWeather](https://openweathermap.org/price) y obtener una API Key.
2. Crear un archivo `.env.local` en la raíz del proyecto con la siguiente variable:

```bash
VITE_OPENWEATHER_API_KEY=tu_api_key_aquí
```

La API Key no se versiona. Sin ella la aplicación mostrará un error al intentar obtener el clima.

## Scripts disponibles

- `npm install`: instala las dependencias.
- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la versión optimizada para producción.
- `npm run preview`: sirve la build generada.
- `npm run lint`: ejecuta ESLint sobre el proyecto.

## Funcionalidades principales

- Búsqueda de clima actual por ciudad o por geolocalización del navegador.
- Pronóstico resumido de los próximos 5 días.
- Indicadores destacados (sensación térmica, viento, humedad, visibilidad, presión, amanecer/atardecer y nubosidad).
- Cambio global de unidades (°C ↔ °F) mediante Context API.
- Tema claro/oscuro con persistencia en `localStorage`.

## Tecnologías

- React 19 + Vite
- Context API para manejo de estado global (configuración y datos del clima)
- Fetch API para consultar el servicio de OpenWeather
- CSS puro con variables y soporte para modo oscuro
