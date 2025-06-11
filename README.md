# Sistema de Rutas Turísticas - Concejo de Siero

🌟 **Sitio web desplegado en GitHub Pages**: [Ver proyecto en vivo](https://alejandrorr572.github.io/sew-extraordinaria-2025/)

## 📋 Descripción del Proyecto

Sistema completo XML de rutas turísticas para el Concejo de Siero en Asturias, desarrollado como proyecto académico que incluye:

- **Sistema XML completo** con DTD y Schema para validación
- **Generación automática** de archivos KML (planimetría) y SVG (altimetría)
- **Interfaz web interactiva** con JavaScript orientado a objetos
- **Carrusel de fotos turísticas** con navegación automática y controles
- **Sistema de noticias** consumiendo servicios web simulados
- **Integración con Google Maps API** para visualización de rutas
- **Diseño responsivo** con CSS Grid y Flexbox

## 🎯 Páginas Implementadas

- **index.html**: Página principal con carrusel turístico y noticias
- **gastronomia.html**: Página gastronómica con elementos HTML requeridos
- **rutas.html**: Sistema interactivo de rutas con tabs y mapas
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
