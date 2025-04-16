```javascript
     // Navbar scroll effect
     window.addEventListener('scroll', () => {
         const navbar = document.querySelector('.navbar');
         if (window.scrollY > 50) {
             navbar.classList.add('scrolled');
         } else {
             navbar.classList.remove('scrolled');
         }
     });

     // Form validation
     document.querySelector('form').addEventListener('submit', (e) => {
         const email = document.getElementById('email').value;
         const phone = document.getElementById('telefono').value;
         if (!email.includes('@') || phone.length < 10) {
             e.preventDefault();
             alert('Por favor, ingrese un correo electrónico y teléfono válidos.');
         }
     });
     ```
