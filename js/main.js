// Sandpiper Villas Ayampe — minimal JS
// The main site JS is now inline in index.html for LCP performance.
// This file is kept for any legacy references.

// Service Worker Registration (progressive enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('SW error:', err));
    });
}
