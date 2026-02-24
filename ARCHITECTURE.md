# 🏗️ Arquitectura del Proyecto

Este documento describe la estructura y las decisiones técnicas detrás del clon de Airbnb.

## 📁 Estructura de Carpetas

- `src/components/`: Componentes reutilizables de UI (Botones, Inputs, Cards).
- `src/contexts/`: Manejo de estado global (Autenticación y Configuración).
- `src/lib/`: Configuraciones de librerías externas (Supabase, Geocoding).
- `src/pages/`: Vistas principales de la aplicación.
- `src/styles/`: Configuraciones globales de diseño y Tailwind CSS.

## 🛠️ Tecnologías y Decisiones

### React 19 + Vite
Elegimos la última versión de React para aprovechar las mejoras de rendimiento y la velocidad de Vite en el desarrollo.

### Supabase (Backend as a Service)
Utilizamos Supabase para:
- **Auth:** Manejo seguro de usuarios con Google.
- **Database:** PostgreSQL para persistencia de datos de alojamientos y reservas.
- **RLS (Row Level Security):** Para asegurar que los usuarios solo puedan modificar sus propias publicaciones.

### Tailwind CSS 4.0
Permite crear una interfaz personalizada y fluida con un sistema de diseño basado en utilidades de última generación.

## 🔄 Flujo de Datos

1. El usuario se autentica vía Google.
2. El `AuthProvider` distribuye el estado del usuario a toda la app.
3. Al reservar, se verifica la disponibilidad en Supabase mediante una consulta SQL personalizada.
4. Las notificaciones se generan automáticamente al insertar una nueva reserva.
