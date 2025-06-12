# Sistema Turístico Completo - Concejo de Siero

🌟 **Sitio web desplegado en GitHub Pages**: [Ver proyecto en vivo](https://alejandrorr572.github.io/sew-extraordinaria-2025/)

## 📋 Descripción del Proyecto

Sistema turístico completo para el Concejo de Siero en Asturias con **cumplimiento estricto de estándares W3C** y funcionalidades avanzadas:

### ✨ Características Principales

- **🗂️ Sistema XML completo** con DTD y Schema para validación de rutas
- **🗺️ Integración cartográfica** con archivos KML (planimetría) y SVG (altimetría)
- **🎯 JavaScript orientado a objetos** con jQuery encapsulado en clases
- **📸 Carrusel fotográfico inteligente** con navegación automática y controles ARIA
- **📰 Sistema de noticias dinámico** con APIs externas y fallback inteligente
- **🌤️ Meteorología en tiempo real** con previsiones de 7 días
- **🎨 Diseño responsive moderno** sin uso de IDs, clases o data-* attributes
- **♿ Accesibilidad completa** con roles ARIA y navegación por teclado

### 🛠️ Tecnologías y Estándares

- **HTML5 semántico** - Solo elementos semánticos y atributos ARIA
- **CSS3 avanzado** - Grid, Flexbox, gradientes, animaciones
- **JavaScript ES6+** - Clases, async/await, módulos
- **APIs REST** - Integración con servicios meteorológicos y de noticias
- **Validación W3C** - HTML y CSS 100% válidos

## 🎯 Páginas Implementadas

- **🏠 index.html**: Página principal con carrusel turístico y noticias dinámicas
- **🍽️ gastronomia.html**: Gastronomía asturiana con elementos HTML5 completos
- **🗺️ rutas.html**: Sistema interactivo de rutas XML con tabs y mapas
- **🌤️ meteorologia.html**: Clima en tiempo real con previsiones de 7 días
- **🎮 juego.html**: Entretenimiento interactivo
- **❓ ayuda.html**: Soporte y documentación
- **📋 reservas.php**: Sistema de reservas (simulado)

## 🔧 Funcionalidades Técnicas Avanzadas

### 📰 Sistema de Noticias Inteligente
- **APIs reales**: RSS2JSON, Europa Press, medios asturianos
- **Fallback robusto**: Noticias de ejemplo si las APIs fallan
- **Modo demo/producción**: Configurable desde JavaScript
- **Actualización automática**: Botones de control y refresh

### 🌦️ Meteorología Completa
- **OpenWeatherMap API**: Datos reales para Pola de Siero
- **Previsiones 7 días**: Con detalles completos
- **Datos de respaldo**: Simulación realista del clima asturiano
- **Interfaz elegante**: Diseño con gradientes y animaciones

### 🎛️ Sistema de Configuración
- **config.js**: Configuración centralizada
- **Modo debug**: Panel de información y controles
- **APIs intercambiables**: Fácil cambio entre demo y producción
- **Logging avanzado**: Información detallada en consola
- **Páginas adicionales**: ayuda, juego, meteorología, reservas

## 🔧 Características Técnicas

- **HTML5 semántico** adaptado para el Concejo de Siero
- **CSS con especificidad documentada** en formato (x,x,x)
- **JavaScript modular** con clases orientadas a objetos y jQuery
- **Carrusel turístico** con autoplay, controles y navegación por teclado
- **Sistema de noticias** con simulación de servicios web
- **XML con 3 rutas completas** incluyendo coordenadas y waypoints
- **DTD y XSD** para validación de estructura XML
- **Script Python** para generación automática de KML/SVG
- **Archivos multimedia** (audio, vídeo, imágenes)

## 📁 Estructura del Proyecto

```
/
├── index.html              # Página principal
├── rutas.html             # Sistema de rutas interactivo
├── gastronomia.html       # Página gastronómica
├── estilo/                # Archivos CSS modulares
│   ├── estilo.css         # Estilos principales
│   ├── layout.css         # Layout responsivo
│   └── rutas.css          # Estilos específicos de rutas
├── js/                    # JavaScript modular
│   ├── index.js           # Sistema OOP con carousel y noticias
│   └── rutas.js           # Clase GestorRutas
├── xml/                   # Sistema XML completo
│   ├── rutas.xml          # Datos de rutas
│   ├── rutas.dtd          # Validación DTD
│   ├── rutas.xsd          # Validación Schema
│   ├── kml/               # Archivos KML generados
│   ├── svg/               # Archivos SVG generados
│   └── python/            # Script de generación
└── multimedia/            # Assets multimedia
    ├── audio/
    ├── images/
    └── videos/
```

## 🚀 Configuración para GitHub Pages

1. **Google Maps API**: Configurar API key para dominio GitHub Pages
2. **CORS**: Resuelto automáticamente al usar protocolo HTTPS
3. **Validación**: Archivos listos para validación W3C

## 🌐 Tecnologías Utilizadas

- HTML5 Semántico
- CSS3 con Grid y Flexbox
- JavaScript ES6+ orientado a objetos
- jQuery para manipulación DOM
- Google Maps JavaScript API
- XML con DTD y XSD
- Python para generación automática
- GitHub Pages para despliegue

---

**Desarrollado para el Concejo de Siero, Asturias** 🏔️
