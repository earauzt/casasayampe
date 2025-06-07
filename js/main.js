// Código JavaScript personalizado para Casas Ayampe

document.addEventListener('DOMContentLoaded', () => {
  // Menú móvil
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // WhatsApp dialog
  const whatsappButton = document.getElementById('whatsapp-button');
  const whatsappDialog = document.getElementById('whatsapp-dialog');
  if (whatsappButton && whatsappDialog) {
    whatsappButton.addEventListener('click', (e) => {
      e.preventDefault();
      whatsappDialog.classList.toggle('hidden');
    });
    document.addEventListener('click', (event) => {
      if (!whatsappButton.contains(event.target) && !whatsappDialog.contains(event.target)) {
        whatsappDialog.classList.add('hidden');
      }
    });
  }

  // Modales de propiedad
  window.showPropertyDetails = (id) => {
    const modal = document.getElementById(`property-details-${id}`);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closePropertyDetails = (id) => {
    const modal = document.getElementById(`property-details-${id}`);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  document.addEventListener('click', (e) => {
    document.querySelectorAll('[id^="property-details-"]').forEach((modal) => {
      if (e.target === modal) {
        const id = modal.id.split('-')[2];
        closePropertyDetails(id);
      }
    });
  });

  // Formulario de registro
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new URLSearchParams();
      const elements = registrationForm.elements;
      for (const el of elements) {
        if (!el.name || el.type === 'submit') continue;
        if (el.required && !el.value.trim()) {
          showNotification('Por favor complete todos los campos requeridos', 'error');
          return;
        }
        if (el.value.length > 500) {
          showNotification('El texto no puede exceder los 500 caracteres', 'error');
          return;
        }
        if (el.type === 'checkbox') {
          if (el.checked) data.append(el.name, el.value || 'on');
          continue;
        }
        if (el.tagName.toLowerCase() === 'select') {
          const opt = el.options[el.selectedIndex];
          if (opt.value) data.append(el.name, opt.text);
          continue;
        }
        if (el.value.trim()) data.append(el.name, el.value.trim());
      }

      fetch(registrationForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      })
        .then((response) => {
          if (response.ok) {
            showNotification('¡Registro exitoso! Nos pondremos en contacto contigo pronto.', 'success');
            registrationForm.reset();
          } else {
            throw new Error('Error en el envío');
          }
        })
        .catch(() => {
          showNotification('Lo sentimos, hubo un error al procesar tu registro. Por favor intenta nuevamente.', 'error');
        });
    });
  }

  function showNotification(message, type) {
    const dialog = document.createElement('div');
    dialog.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    dialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center ${type === 'success' ? 'text-green-600' : 'text-red-600'} mb-4">
          <div class="w-6 h-6 flex items-center justify-center mr-2">
            <i class="ri-${type === 'success' ? 'checkbox-circle' : 'error-warning'}-line"></i>
          </div>
          <h3 class="text-xl font-bold">${type === 'success' ? 'Éxito' : 'Error'}</h3>
        </div>
        <p class="text-gray-600 mb-6">${message}</p>
        <button class="w-full bg-primary text-white py-2 rounded-button font-medium hover:bg-opacity-90 transition-colors">Aceptar</button>
      </div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('button').addEventListener('click', () => {
      dialog.remove();
      registrationForm.reset();
    });
    dialog.addEventListener('click', (ev) => {
      if (ev.target === dialog) {
        dialog.remove();
        registrationForm.reset();
      }
    });
  }
});
