# 🏠 Airbnb Clone - Full Stack Web Application

¡Bienvenido a mi proyecto! Este es un clon de Airbnb desarrollado con tecnologías modernas, enfocado en una experiencia de usuario fluida y un diseño premium.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=for-the-badge)](https://ErenEliuth.github.io/airbnb/)

## 🚀 Características Principales

- **Gestión de Reservas:** Sistema completo para reservar alojamientos con bloqueo de fechas automáticas.
- **Autenticación con Google:** Integración con Supabase Auth para un inicio de sesión seguro y rápido.
- **Panel de Anfitrión:** Interfaz dedicada para que los usuarios puedan subir sus propios alojamientos y experiencias.
- **Notificaciones en Tiempo Real:** Sistema de avisos para confirmar reservas o recibir mensajes.
- **Mapas Interactivos:** Integración con Leaflet para geolocalización de propiedades.
- **Diseño Responsivo:** Optimizado para dispositivos móviles, tablets y escritorio.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19 + Vite
- **Estilos:** Tailwind CSS 4.0
- **Base de Datos & Auth:** Supabase (PostgreSQL)
- **Mapas:** Leaflet / React-Leaflet
- **Iconos:** Lucide React
- **Despliegue:** GitHub Pages

## 📦 Instalación y Configuración

Si deseas ejecutar este proyecto localmente, sigue estos pasos:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/ErenEliuth/airbnb.git
   cd airbnb
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env` en la raíz con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_llave_anonima
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

Desarrollado con ❤️ por **ErenEliuth**
