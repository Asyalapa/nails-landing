/**
 * main.js
 * Основной скрипт для сайта маникюрного мастера
 * @version 3.0.0
 * @author Tatiana Nails Studio
 */

// ================= НАСТРОЙКИ ТЕМЫ =================

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  if (themeIcon) themeIcon.textContent = 'light_mode';
}

// ================= БУРГЕР-МЕНЮ (FULLSCREEN) =================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const body = document.body;

if (burger && mobileMenu) {
  /**
   * Открытие/закрытие мобильного меню
   */
  function toggleMobileMenu() {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    body.classList.toggle('menu-open');
  }
  
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });
  
  // Закрытие меню при клике на ссылку
  document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      toggleMobileMenu();
    });
  });
  
  // Закрытие меню при клике на фон (но не на контент)
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      toggleMobileMenu();
    }
  });
  
  // Закрытие по клавише ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      toggleMobileMenu();
    }
  });
}

// Обработка навигационных ссылок (для плавного скролла и закрытия меню)
document.querySelectorAll('.nav__link, .mobile-menu__link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // Закрываем мобильное меню, если оно открыто
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
      
      // Плавный скролл с учётом фиксированного хедера
      const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
  });
});

// ================= ПЛАВНАЯ ПРОКРУТКА =================

/**
 * Плавно прокручивает страницу к указанному элементу
 * @param {HTMLElement} element - целевой элемент
 * @param {number} offset - смещение от верхней части (для учёта фиксированного хедера)
 */
function smoothScrollTo(element, offset = 80) {
  if (!element) return;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({
    top: elementPosition - offset,
    behavior: 'smooth'
  });
}

// ================= КНОПКИ ЗАПИСИ У УСЛУГ =================

/**
 * Настраивает кнопки "Записаться" у каждой услуги
 * При клике: скроллит к форме и автоматически выбирает соответствующую услугу
 */
function setupServiceButtons() {
  const serviceButtons = document.querySelectorAll('.service-card__button');
  const formSection = document.getElementById('form');
  const serviceSelect = document.getElementById('service');

  if (!serviceButtons.length || !formSection || !serviceSelect) return;

  /**
   * Соответствие между названием услуги в карточке и значением в select
   * @type {Object<string, string>}
   */
  const serviceMapping = {
    'Классический маникюр': 'Классический маникюр',
    'Гель-лак': 'Гель-лак',
    'Наращивание': 'Наращивание'
  };

  serviceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Находим карточку услуги (родительский .service-card)
      const serviceCard = button.closest('.service-card');
      if (!serviceCard) return;

      // Получаем название услуги из заголовка
      const serviceTitleElement = serviceCard.querySelector('.service-card__title');
      if (!serviceTitleElement) return;

      const serviceName = serviceTitleElement.textContent.trim();

      // Находим соответствующую опцию в select
      const targetOption = Array.from(serviceSelect.options).find(
        option => option.value === serviceName || option.text === serviceName
      );

      if (targetOption && targetOption.value !== '') {
        // Выбираем услугу в кастомном селекте
        if (serviceSelect.customSelectInstance) {
          // Получаем индекс опции
          const optionIndex = Array.from(serviceSelect.options).indexOf(targetOption);
          if (optionIndex !== -1) {
            serviceSelect.customSelectInstance.selectOption(optionIndex);
          }
        } else {
          // Fallback для нативного select
          serviceSelect.value = targetOption.value;
        }
      }

      // Плавно скроллим к форме
      smoothScrollTo(formSection, 100);

      // Небольшая задержка для фокуса на поле имени (опционально)
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 500);
    });
  });
}

// ================= COOKIE =================

function acceptCookies() {
  const cookie = document.getElementById('cookie');
  if (cookie) cookie.style.display = 'none';
  localStorage.setItem('cookiesAccepted', 'true');
}

const cookieBtn = document.querySelector('.cookie__button');
if (cookieBtn) {
  cookieBtn.addEventListener('click', acceptCookies);
}

if (localStorage.getItem('cookiesAccepted') === 'true') {
  const cookie = document.getElementById('cookie');
  if (cookie) cookie.style.display = 'none';
}

// ================= ГАЛЕРЕЯ И ЛАЙТБОКС =================

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(element) {
  if (!lightbox || !lightboxImg) return;
  const img = element.querySelector('img');
  if (img) {
    lightboxImg.src = img.src;
    lightbox.style.display = 'flex';
  }
}

function closeLightbox() {
  if (lightbox) lightbox.style.display = 'none';
}

document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => openLightbox(item));
});

if (lightbox) {
  lightbox.addEventListener('click', closeLightbox);
}

// ================= FAQ =================

document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-item__question');
  if (question) {
    question.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  }
});

// ================= МАСКА ТЕЛЕФОНА =================

function formatPhoneNumber(e) {
  let value = this.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  let formatted = '';
  if (value.length > 0) formatted = '+7 ';
  if (value.length > 1) formatted += '(' + value.substring(1, 4);
  if (value.length >= 4) formatted += ') ' + value.substring(4, 7);
  if (value.length >= 7) formatted += '-' + value.substring(7, 9);
  if (value.length >= 9) formatted += '-' + value.substring(9, 11);

  this.value = formatted;
}

const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', formatPhoneNumber);
}

// ================= КАСТОМНЫЙ СЕЛЕКТ =================

class CustomSelect {
  constructor(select) {
    this.select = select;
    this.container = null;
    this.trigger = null;
    this.dropdown = null;
    this.options = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    this.select.style.display = 'none';

    this.container = document.createElement('div');
    this.container.className = 'custom-select';

    this.trigger = document.createElement('div');
    this.trigger.className = 'custom-select__trigger';

    const selectedText = this.select.options[this.select.selectedIndex]?.text || 'Выберите услугу';

    this.trigger.innerHTML = `
      <span class="custom-select__value">${selectedText}</span>
      <span class="custom-select__arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    `;

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'custom-select__dropdown';

    this.renderOptions();

    this.container.appendChild(this.trigger);
    this.container.appendChild(this.dropdown);
    this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

    this.attachEvents();
  }

  renderOptions() {
    this.dropdown.innerHTML = '';
    this.options = [];

    Array.from(this.select.options).forEach((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'custom-select__option';
      if (index === this.select.selectedIndex && option.value !== '') {
        optionEl.classList.add('selected');
      }
      if (option.value === '') {
        optionEl.classList.add('disabled');
      }
      optionEl.textContent = option.text;
      optionEl.dataset.value = option.value;
      optionEl.dataset.index = index;

      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (option.value === '') return;
        this.selectOption(index);
      });

      this.dropdown.appendChild(optionEl);
      this.options.push(optionEl);
    });
  }

  selectOption(index) {
    this.select.selectedIndex = index;

    const selectedText = this.select.options[index].text;
    const valueSpan = this.trigger.querySelector('.custom-select__value');
    if (valueSpan) valueSpan.textContent = selectedText;

    this.options.forEach((opt, i) => {
      if (i === index) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });

    const event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);

    this.close();
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.add('open');

    document.querySelectorAll('.custom-select.open').forEach(el => {
      if (el !== this.container) {
        el.classList.remove('open');
        const instance = el.customSelectInstance;
        if (instance) instance.isOpen = false;
      }
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.remove('open');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  attachEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });

    this.select.addEventListener('change', () => {
      const index = this.select.selectedIndex;
      const selectedText = this.select.options[index]?.text || '';
      const valueSpan = this.trigger.querySelector('.custom-select__value');
      if (valueSpan) valueSpan.textContent = selectedText;

      this.options.forEach((opt, i) => {
        if (i === index) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });
    });
  }
}

// Инициализируем кастомный селект
const serviceSelect = document.getElementById('service');
if (serviceSelect) {
  const customSelect = new CustomSelect(serviceSelect);
  serviceSelect.customSelectInstance = customSelect;
}

// ================= ОБРАБОТКА ФОРМЫ =================

const form = document.getElementById('formEl');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value;
    const phone = document.getElementById('phone')?.value;
    const service = document.getElementById('service')?.value;

    if (!name || name.trim().length < 2) {
      alert('Пожалуйста, введите ваше имя (минимум 2 символа)');
      return;
    }

    const cleanPhone = phone?.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      alert('Пожалуйста, введите корректный номер телефона');
      return;
    }

    if (!service) {
      alert('Пожалуйста, выберите услугу');
      return;
    }

    alert(`Спасибо, ${name.trim()}! Мы свяжемся с вами для записи на ${service}.`);
    form.reset();

    if (phoneInput) phoneInput.value = '';

    if (serviceSelect && serviceSelect.customSelectInstance) {
      const emptyIndex = Array.from(serviceSelect.options).findIndex(opt => opt.value === '');
      if (emptyIndex !== -1) {
        serviceSelect.customSelectInstance.selectOption(emptyIndex);
      }
    }

    document.querySelectorAll('.appointment-form__input, .appointment-form__select, select').forEach(field => {
      if (field.value === '') field.dispatchEvent(new Event('input'));
    });
  });
}

// ================= ЗАПУСК ВСЕХ ИНИЦИАЛИЗАЦИЙ =================

/**
 * Инициализирует все компоненты после полной загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  setupServiceButtons(); // Настраиваем кнопки услуг
});

// ================= МОДАЛЬНОЕ ОКНО ПОЛИТИКИ =================

function openPolicy() {
  const modal = document.getElementById('policy');
  if (modal) modal.style.display = 'flex';
}

function closePolicy() {
  const modal = document.getElementById('policy');
  if (modal) modal.style.display = 'none';
}

window.addEventListener('click', (e) => {
  const modal = document.getElementById('policy');
  if (e.target === modal) closePolicy();
});

// ================= ПЛАВАЮЩИЕ ПОДПИСИ =================

document.querySelectorAll('.appointment-form__input, .appointment-form__select, select').forEach(field => {
  if (field.value && field.value.trim() !== '') {
    field.classList.add('filled');
  }

  field.addEventListener('input', function () {
    if (this.value && this.value.trim() !== '') {
      this.classList.add('filled');
    } else {
      this.classList.remove('filled');
    }
  });
});