// Código JavaScript personalizado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada');
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registrado'))
            .catch(err => console.log('Error al registrar ServiceWorker:', err));
    });
}

// Scroll Progress
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Property Filters
const filterButtons = document.querySelectorAll('.filter-button');
const propertyCards = document.querySelectorAll('.property-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        propertyCards.forEach(card => {
            if (filter === 'all' || card.dataset.type === filter) {
                card.style.display = 'block';
                setTimeout(() => card.classList.add('animate-fade-in'), 50);
            } else {
                card.classList.remove('animate-fade-in');
                card.style.display = 'none';
            }
        });
    });
});

// Gallery Swiper
const gallerySwiper = new Swiper('.gallery-swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

// Google Maps
function initMap() {
    const ayampe = { lat: -1.5721, lng: -80.8229 };
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: ayampe,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#c9c9c9"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#9e9e9e"}]
            }
        ]
    });

    const marker = new google.maps.Marker({
        position: ayampe,
        map: map,
        title: 'Sandpiper Ayampe',
        animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
        content: '<div class="p-2"><h3 class="font-bold">Sandpiper Ayampe</h3><p>Tu hogar frente al mar</p></div>'
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Form Submission
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Enviando...';
        
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showNotification('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
            contactForm.reset();
        } else {
            throw new Error('Error en el envío');
        }
    } catch (error) {
        showNotification('Lo sentimos, hubo un error al enviar tu mensaje. Por favor intenta nuevamente.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fixed bottom-6 right-6 z-50`;
    notification.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full flex items-start">
            <div class="flex-shrink-0">
                <i class="ri-${type === 'success' ? 'checkbox-circle' : type === 'error' ? 'error-warning' : 'information'}-line text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500 text-xl mr-3"></i>
            </div>
            <div class="flex-1">
                <p class="text-gray-800">${message}</p>
            </div>
            <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                <i class="ri-close-line"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Lazy Loading Images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('opacity-0');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('opacity-0');
        });
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Cerrar menú móvil si está abierto
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});
