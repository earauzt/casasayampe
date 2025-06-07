# Casas Ayampe - Portal Inmobiliario

Portal web moderno y optimizado para la venta de propiedades en Ayampe, Ecuador. Desarrollado con las mejores prácticas de rendimiento, accesibilidad y SEO.

## Características

- 🚀 **Rendimiento Optimizado**
  - Service Worker para funcionalidad offline
  - Lazy loading de imágenes
  - Preconnect para recursos externos
  - Caché inteligente de recursos

- 🎨 **Diseño Moderno**
  - Interfaz limpia y profesional
  - Diseño responsivo
  - Animaciones suaves
  - Galería de imágenes interactiva

- 📱 **Experiencia de Usuario**
  - Navegación intuitiva
  - Formularios optimizados
  - Notificaciones en tiempo real
  - Integración con WhatsApp

- 🔍 **SEO y Accesibilidad**
  - Meta tags optimizados
  - Estructura semántica
  - Alt text en imágenes
  - Schema.org markup

## Tecnologías Utilizadas

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (Vanilla)
- Service Workers
- Google Maps API
- Formspree para formularios
- Swiper.js para galerías

## Estructura del Proyecto

```
casasayampe/
├── index.html          # Página principal
├── offline.html        # Página offline
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   └── main.js         # JavaScript principal
├── images/            # Imágenes optimizadas
├── sw.js             # Service Worker
└── README.md         # Documentación
```

## Configuración

1. Clona el repositorio
2. Reemplaza `YOUR_API_KEY` en `index.html` con tu clave de Google Maps API
3. Actualiza los datos de contacto y propiedades según sea necesario
4. Personaliza los colores y estilos en `css/styles.css`

## Optimización de Imágenes

Las imágenes están optimizadas en formato WebP con fallback a JPG. Para agregar nuevas imágenes:

1. Convierte las imágenes a WebP usando herramientas como `cwebp`
2. Agrega ambas versiones (WebP y JPG) en la carpeta `images/`
3. Usa el atributo `loading="lazy"` para imágenes no críticas

## Service Worker

El Service Worker implementa una estrategia "Cache First" para recursos estáticos y "Network First" para contenido dinámico. Para actualizar el caché:

1. Incrementa la versión en `CACHE_NAME`
2. Actualiza `ASSETS_TO_CACHE` con los nuevos recursos

## Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

APX Company - [@apx.company](https://instagram.com/apx.company)

Sitio Web: [https://casasayampe.com](https://casasayampe.com) 