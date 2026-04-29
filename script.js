/**
 * @fileoverview Основной скрипт для сайта маникюрного салона "Ноготки принцессы"
 * @author Tatiana Nails Studio
 * @version 4.0.0
 * @license MIT
 * 
 * Включает:
 * - Переключение тёмной/светлой темы с сохранением в localStorage
 * - Мобильное меню (бургер) с поддержкой клавиатуры
 * - Плавный скролл к якорям страницы
 * - Интеграция кнопок услуг с формой записи
 * - Управление cookies (GDPR)
 * - Лайтбокс для галереи
 * - Аккордеон FAQ
 * - Форматирование номера телефона
 * - Кастомный select
 * - Валидация и отправка формы записи
 */

// ==================== МОДУЛЬ ТЕМЫ ====================

/**
 * Объект для управления темой оформления (светлая/тёмная)
 * @namespace ThemeManager
 */
const ThemeManager = (() => {
  const THEME_KEY = 'theme';
  const DARK_CLASS = 'dark';
  const ICON_LIGHT = 'light_mode';
  const ICON_DARK = 'dark_mode';

  /**
   * Переключает текущую тему оформления
   * @returns {string} 'dark' или 'light'
   */
  const toggle = () => {
    document.body.classList.toggle(DARK_CLASS);
    const isDark = document.body.classList.contains(DARK_CLASS);

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = isDark ? ICON_LIGHT : ICON_DARK;
    }

    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    return isDark ? 'dark' : 'light';
  };

  /**
   * Инициализирует тему согласно сохранённому значению
   */
  const init = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const themeIcon = document.getElementById('themeIcon');

    if (savedTheme === 'dark') {
      document.body.classList.add(DARK_CLASS);
      if (themeIcon) themeIcon.textContent = ICON_LIGHT;
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggle);
    }
  };

  return { toggle, init };
})();

// Инициализируем тему при загрузке DOM
document.addEventListener('DOMContentLoaded', ThemeManager.init);


// ==================== МОДУЛЬ МОБИЛЬНОГО МЕНЮ ====================

/**
 * Объект для управления мобильным меню (бургер)
 * @namespace MobileMenuManager
 */
const MobileMenuManager = (() => {
  let isOpen = false;

  /**
   * Инициализирует мобильное меню и все его обработчики
   */
  const init = () => {
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!burger || !mobileMenu) return;

    // Обработчик клика на бургер
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle(burger, mobileMenu);
    });

    // Закрытие при клике на ссылку
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => toggle(burger, mobileMenu));
    });

    // Закрытие при клике на фон
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        toggle(burger, mobileMenu);
      }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggle(burger, mobileMenu);
      }
    });
  };

  /**
   * Переключает состояние меню
   * @param {HTMLElement} burger - элемент бургер-кнопки
   * @param {HTMLElement} menu - элемент меню
   */
  const toggle = (burger, menu) => {
    isOpen = !isOpen;
    burger.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', isOpen);
  };

  /**
   * Закрывает меню программно
   */
  const close = () => {
    if (!isOpen) return;
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    if (burger && menu) {
      toggle(burger, menu);
    }
  };

  return { init, close };
})();


// ==================== МОДУЛЬ НАВИГАЦИИ ====================

/**
 * Объект для управления навигацией по странице
 * @namespace NavigationManager
 */
const NavigationManager = (() => {
  /**
   * Инициализирует обработчики всех навигационных ссылок
   */
  const init = () => {
    document.querySelectorAll('.nav__link, .mobile-menu__link').forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });
  };

  /**
   * Обрабатывает клик на навигационную ссылку
   * @param {Event} e - объект события
   */
  const handleLinkClick = (e) => {
    const href = e.currentTarget.getAttribute('href');

    // Пропускаем внешние ссылки и якори без целевого элемента
    if (!href || href.startsWith('http') || href.startsWith('#/')) return;

    const targetId = href;
    const targetElement = document.querySelector(targetId);

    if (!targetElement) return;

    e.preventDefault();

    // Закрываем мобильное меню если открыто
    MobileMenuManager.close();

    // Плавный скролл с учётом высоты фиксированного хедера
    smoothScrollTo(targetElement);
  };

  /**
   * Плавно прокручивает страницу к элементу
   * @param {HTMLElement} element - целевой элемент для скролла
   * @param {number} [offset=80] - смещение от верхней части (для фиксированного хедера)
   * @returns {void}
   */
  const smoothScrollTo = (element, offset = 80) => {
    if (!element) return;

    const headerHeight = document.querySelector('.header')?.offsetHeight || offset;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;

    window.scrollTo({
      top: elementPosition - headerHeight,
      behavior: 'smooth'
    });
  };

  return { init, smoothScrollTo };
})();


// ==================== МОДУЛЬ УСЛУГ ====================

/**
 * Объект для управления интеграцией кнопок услуг с формой записи
 * @namespace ServiceManager
 */
const ServiceManager = (() => {
  /**
   * Соответствие между названием услуги в карточке и значением в select
   * @type {Object<string, string>}
   */
  const SERVICE_MAPPING = {
    'Классический маникюр': 'Классический маникюр',
    'Гель-лак': 'Гель-лак',
    'Наращивание': 'Наращивание'
  };

  /**
   * Инициализирует обработчики кнопок "Записаться"
   */
  const init = () => {
    const serviceButtons = document.querySelectorAll('.service-card__button');
    const formSection = document.getElementById('form');
    const serviceSelect = document.getElementById('service');

    if (!serviceButtons.length || !formSection || !serviceSelect) return;

    serviceButtons.forEach(button => {
      button.addEventListener('click', handleServiceButtonClick);
    });
  };

  /**
   * Обрабатывает клик на кнопку "Записаться"
   * @param {Event} e - объект события
   */
  const handleServiceButtonClick = (e) => {
    e.preventDefault();

    const serviceCard = e.currentTarget.closest('.service-card');
    if (!serviceCard) return;

    const serviceTitleElement = serviceCard.querySelector('.service-card__title');
    if (!serviceTitleElement) return;

    const serviceName = serviceTitleElement.textContent.trim();
    const serviceSelect = document.getElementById('service');
    const formSection = document.getElementById('form');

    if (!serviceSelect || !formSection) return;

    // Ищем соответствующую опцию в select
    const targetOption = Array.from(serviceSelect.options).find(
      option => option.value === serviceName || option.text === serviceName
    );

    if (targetOption && targetOption.value !== '') {
      // Выбираем услугу (работает с кастомным и нативным select)
      if (serviceSelect.customSelectInstance) {
        const optionIndex = Array.from(serviceSelect.options).indexOf(targetOption);
        if (optionIndex !== -1) {
          serviceSelect.customSelectInstance.selectOption(optionIndex);
        }
      } else {
        serviceSelect.value = targetOption.value;
      }
    }

    // Плавно скроллим к форме
    NavigationManager.smoothScrollTo(formSection, 100);

    // Фокусируем на поле имени через 500ms
    setTimeout(() => {
      const nameInput = document.getElementById('name');
      if (nameInput) nameInput.focus();
    }, 500);
  };

  return { init };
})();


// ==================== МОДУЛЬ COOKIES (GDPR) ====================

/**
 * Объект для управления согласием на cookies (GDPR)
 * @namespace CookieManager
 */
const CookieManager = (() => {
  const COOKIE_KEY = 'cookiesAccepted';

  /**
   * Инициализирует обработчики cookies
   */
  const init = () => {
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', acceptCookies);
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', declineCookies);
    }

    // Скрываем баннер если уже было решение
    const cookiesAccepted = localStorage.getItem(COOKIE_KEY);
    if (cookiesAccepted === 'true' || cookiesAccepted === 'false') {
      hideCookieNotice();
    }
  };

  /**
   * Принимает cookies и скрывает баннер
   */
  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    hideCookieNotice();
    // Здесь можно инициализировать аналитику (Google Analytics и т.д.)
  };

  /**
   * Отклоняет cookies и скрывает баннер
   */
  const declineCookies = () => {
    localStorage.setItem(COOKIE_KEY, 'false');
    hideCookieNotice();
    // Здесь можно отключить неважные скрипты/трекеры
  };

  /**
   * Скрывает баннер с уведомлением о cookies
   */
  const hideCookieNotice = () => {
    const cookie = document.getElementById('cookie');
    if (cookie) {
      cookie.style.display = 'none';
    }
  };

  return { init };
})();


// ==================== МОДУЛЬ ГАЛЕРЕИ И ЛАЙТБОКСА ====================

/**
 * Объект для управления галереей и лайтбоксом (увеличением изображений)
 * @namespace GalleryManager
 */
const GalleryManager = (() => {
  /**
   * Инициализирует обработчики для галереи
   */
  const init = () => {
    const galleryItems = document.querySelectorAll('.gallery__item');
    const lightbox = document.getElementById('lightbox');
    const closeButton = document.getElementById('lightboxClose');

    if (!galleryItems.length || !lightbox) return;

    galleryItems.forEach(item => {
      item.addEventListener('click', () => openLightbox(item));
    });

    // Закрытие при клике на кнопку крестика
    if (closeButton) {
      closeButton.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', handleLightboxClick);

    // Закрытие лайтбокса по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  };

  /**
   * Открывает лайтбокс с изображением
   * @param {HTMLElement} element - элемент галереи
   */
  const openLightbox = (element) => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    const img = element.querySelector('img');
    if (!img) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  /**
   * Закрывает лайтбокс
   */
  const closeLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  /**
   * Обрабатывает клик в лайтбоксе (закрывает по клику на фон)
   * @param {Event} e - объект события
   */
  const handleLightboxClick = (e) => {
    const lightbox = document.getElementById('lightbox');
    // Закрываем только если клик на фоне, не на изображении
    if (e.target === lightbox) {
      closeLightbox();
    }
  };

  return { init };
})();


// ==================== МОДУЛЬ АККОРДЕОНА (FAQ) ====================

/**
 * Объект для управления FAQ аккордеоном
 * @namespace FAQManager
 */
const FAQManager = (() => {
  /**
   * Инициализирует обработчики для FAQ элементов
   */
  const init = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-item__question');
      if (question) {
        question.addEventListener('click', () => handleToggle(item));
        // Для доступности - поддержка клавиатуры
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle(item);
          }
        });
      }
    });
  };

  /**
   * Переключает открытое/закрытое состояние FAQ элемента
   * @param {HTMLElement} item - элемент FAQ
   */
  const handleToggle = (item) => {
    const isActive = item.classList.contains('active');

    // Опционально: закрываем другие открытые элементы (аккордеон)
    // document.querySelectorAll('.faq-item.active').forEach(openItem => {
    //   if (openItem !== item) openItem.classList.remove('active');
    // });

    if (!isActive) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  };

  return { init };
})();

// ==================== МОДУЛЬ ФОРМАТИРОВАНИЯ ТЕЛЕФОНА ====================

/**
 * Объект для управления форматированием номера телефона
 * @namespace PhoneFormatter
 */
const PhoneFormatter = (() => {
  const PHONE_INPUT_ID = 'phone';
  const MAX_LENGTH = 11;

  /**
   * Инициализирует обработчик для поля телефона
   */
  const init = () => {
    const phoneInput = document.getElementById(PHONE_INPUT_ID);
    if (phoneInput) {
      phoneInput.addEventListener('input', formatPhoneNumber);
    }
  };

  /**
   * Форматирует номер телефона в формат: +7 (XXX) XXX-XX-XX
   * @param {Event} e - событие input
   */
  const formatPhoneNumber = function (e) {
    // Извлекаем только цифры
    let value = this.value.replace(/\D/g, '');

    // Ограничиваем до 11 цифр (длина российского номера)
    if (value.length > MAX_LENGTH) {
      value = value.slice(0, MAX_LENGTH);
    }

    let formatted = '';

    // Строим отформатированный номер
    if (value.length > 0) formatted = '+7 ';
    if (value.length > 1) formatted += '(' + value.substring(1, 4);
    if (value.length >= 4) formatted += ') ' + value.substring(4, 7);
    if (value.length >= 7) formatted += '-' + value.substring(7, 9);
    if (value.length >= 9) formatted += '-' + value.substring(9, 11);

    this.value = formatted;
  };

  return { init };
})();


// ==================== КЛАСС КАСТОМНОГО СЕЛЕКТА ====================

/**
 * Класс для создания кастомного стилизованного select с открывающимся меню
 * @class CustomSelect
 * @param {HTMLSelectElement} select - исходный элемент select
 */
class CustomSelect {
  /**
   * @constructor
   * @param {HTMLSelectElement} select - элемент select для оборачивания
   */
  constructor(select) {
    this.select = select;
    this.container = null;
    this.trigger = null;
    this.dropdown = null;
    this.options = [];
    this.isOpen = false;

    if (select) {
      this.init();
    }
  }

  /**
   * Инициализирует кастомный селект
   * @private
   */
  init() {
    // Скрываем исходный select
    this.select.style.display = 'none';

    // Создаём контейнер
    this.container = document.createElement('div');
    this.container.className = 'custom-select';
    this.container.setAttribute('role', 'combobox');
    this.container.setAttribute('aria-expanded', 'false');

    // Создаём кнопку-триггер
    this.trigger = document.createElement('div');
    this.trigger.className = 'custom-select__trigger';
    this.trigger.setAttribute('role', 'button');
    this.trigger.setAttribute('tabindex', '0');

    const selectedText = this.select.options[this.select.selectedIndex]?.text || 'Выберите';

    this.trigger.innerHTML = `
      <span class="custom-select__value">${this.escapeHtml(selectedText)}</span>
      <span class="custom-select__arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    `;

    // Создаём выпадающее меню
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'custom-select__dropdown';
    this.dropdown.setAttribute('role', 'listbox');

    this.renderOptions();

    // Добавляем элементы в контейнер
    this.container.appendChild(this.trigger);
    this.container.appendChild(this.dropdown);
    this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

    // Навешиваем обработчики
    this.attachEvents();
  }

  /**
   * Рендерит элементы опций в выпадающем меню
   * @private
   */
  renderOptions() {
    this.dropdown.innerHTML = '';
    this.options = [];

    Array.from(this.select.options).forEach((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'custom-select__option';
      optionEl.setAttribute('role', 'option');
      optionEl.textContent = option.text;
      optionEl.dataset.value = option.value;
      optionEl.dataset.index = index;

      // Отмечаем выбранную опцию
      if (index === this.select.selectedIndex && option.value !== '') {
        optionEl.classList.add('selected');
        optionEl.setAttribute('aria-selected', 'true');
      }

      // Отмечаем отключённые опции (пустые)
      if (option.value === '') {
        optionEl.classList.add('disabled');
        optionEl.setAttribute('aria-disabled', 'true');
      }

      // Обработчик клика на опцию
      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (option.value !== '') {
          this.selectOption(index);
        }
      });

      this.dropdown.appendChild(optionEl);
      this.options.push(optionEl);
    });
  }

  /**
   * Выбирает опцию по индексу
   * @param {number} index - индекс опции
   */
  selectOption(index) {
    this.select.selectedIndex = index;

    const selectedText = this.select.options[index].text;
    const valueSpan = this.trigger.querySelector('.custom-select__value');
    if (valueSpan) {
      valueSpan.textContent = this.escapeHtml(selectedText);
    }

    // Обновляем внешний вид опций
    this.options.forEach((opt, i) => {
      if (i === index) {
        opt.classList.add('selected');
        opt.setAttribute('aria-selected', 'true');
      } else {
        opt.classList.remove('selected');
        opt.setAttribute('aria-selected', 'false');
      }
    });

    // Генерируем событие change
    const event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);

    this.close();
  }

  /**
   * Открывает выпадающее меню
   */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.add('open');
    this.container.setAttribute('aria-expanded', 'true');

    // Закрываем другие открытые селекты
    document.querySelectorAll('.custom-select.open').forEach(el => {
      if (el !== this.container && el.customSelectInstance) {
        el.customSelectInstance.close();
      }
    });
  }

  /**
   * Закрывает выпадающее меню
   */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.remove('open');
    this.container.setAttribute('aria-expanded', 'false');
  }

  /**
   * Переключает состояние меню (открыто/закрыто)
   */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  /**
   * Экранирует HTML специальные символы для предотвращения XSS
   * @private
   * @param {string} text - текст для экранирования
   * @returns {string} экранированный текст
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Навешивает обработчики событий
   * @private
   */
  attachEvents() {
    // Клик на триггер
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Поддержка клавиатуры
    this.trigger.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.toggle();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!this.isOpen) this.open();
          break;
        case 'Escape':
          e.preventDefault();
          this.close();
          break;
      }
    });

    // Клик вне селекта - закрываем
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });

    // Синхронизация с событиями select
    this.select.addEventListener('change', () => {
      const index = this.select.selectedIndex;
      const selectedText = this.select.options[index]?.text || '';
      const valueSpan = this.trigger.querySelector('.custom-select__value');
      if (valueSpan) {
        valueSpan.textContent = this.escapeHtml(selectedText);
      }

      this.options.forEach((opt, i) => {
        if (i === index) {
          opt.classList.add('selected');
          opt.setAttribute('aria-selected', 'true');
        } else {
          opt.classList.remove('selected');
          opt.setAttribute('aria-selected', 'false');
        }
      });
    });
  }
}

/**
 * Объект для управления кастомными селектами
 * @namespace CustomSelectManager
 */
const CustomSelectManager = (() => {
  /**
   * Инициализирует кастомные селекты на странице
   */
  const init = () => {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
      const customSelect = new CustomSelect(serviceSelect);
      serviceSelect.customSelectInstance = customSelect;
    }
  };

  return { init };
})();


// ==================== МОДУЛЬ ФОРМЫ ====================

/**
 * Объект для управления формой записи и её валидацией
 * @namespace FormManager
 */
const FormManager = (() => {
  const FORM_ID = 'formEl';
  const MIN_NAME_LENGTH = 2;
  const VALID_PHONE_LENGTH = 11;

  /**
   * Инициализирует форму и её обработчики
   */
  const init = () => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
  };

  /**
   * Обрабатывает отправку формы
   * @param {Event} e - событие submit
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = getFormData();

    if (!validateForm(formData)) {
      return;
    }

    submitForm(formData);
  };

  /**
   * Получает данные из формы
   * @returns {Object} объект с данными формы
   */
  const getFormData = () => {
    return {
      name: document.getElementById('name')?.value?.trim() || '',
      phone: document.getElementById('phone')?.value || '',
      service: document.getElementById('service')?.value || ''
    };
  };

  /**
   * Валидирует данные формы
   * @param {Object} data - данные формы
   * @returns {boolean} результат валидации
   */
  const validateForm = (data) => {
    // Проверяем имя
    if (!data.name || data.name.length < MIN_NAME_LENGTH) {
      showError(`Пожалуйста, введите ваше имя (минимум ${MIN_NAME_LENGTH} символа)`);
      return false;
    }

    // Проверяем телефон
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < VALID_PHONE_LENGTH) {
      showError('Пожалуйста, введите корректный номер телефона');
      return false;
    }

    // Проверяем услугу
    if (!data.service) {
      showError('Пожалуйста, выберите услугу');
      return false;
    }

    return true;
  };

  /**
   * Отправляет форму (имитирует отправку на сервер)
   * @param {Object} data - валидированные данные формы
   */
  const submitForm = (data) => {
    // Здесь должна быть реальная отправка на сервер (fetch/axios)
    // Для примера используем alert
    showSuccess(`Спасибо, ${data.name}! Мы свяжемся с вами для записи на ${data.service}.`);

    resetForm();
  };

  /**
   * Сбрасывает форму в исходное состояние
   */
  const resetForm = () => {
    const form = document.getElementById(FORM_ID);
    if (form) form.reset();

    // Сбрасываем телефон
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = '';

    // Сбрасываем кастомный select
    const serviceSelect = document.getElementById('service');
    if (serviceSelect && serviceSelect.customSelectInstance) {
      const emptyIndex = Array.from(serviceSelect.options).findIndex(opt => opt.value === '');
      if (emptyIndex !== -1) {
        serviceSelect.customSelectInstance.selectOption(emptyIndex);
      }
    }
  };

  /**
   * Показывает сообщение об ошибке
   * @param {string} message - текст ошибки
   */
  const showError = (message) => {
    // Используем alert для простоты
    // В продакшене лучше использовать toast уведомления
    alert(message);
  };

  /**
   * Показывает сообщение об успехе
   * @param {string} message - текст сообщения
   */
  const showSuccess = (message) => {
    alert(message);
    // В продакшене: toast.success(message);
  };

  return { init };
})();


// ==================== МОДУЛЬ МОДАЛЬНОГО ОКНА ПОЛИТИКИ ====================

/**
 * Объект для управления модальным окном политики конфиденциальности
 * @namespace PolicyManager
 */
const PolicyManager = (() => {
  const POLICY_ID = 'policy';

  /**
   * Инициализирует обработчики для модального окна
   */
  const init = () => {
    const modal = document.getElementById(POLICY_ID);
    if (!modal) return;

    // Кнопка открытия политики
    const openBtn = document.getElementById('openPolicyBtn');
    if (openBtn) {
      openBtn.addEventListener('click', open);
    }

    // Закрытие при клике на фон
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        close();
      }
    });

    // Обработчик кнопки закрытия
    const closeButton = document.getElementById('closePolicyBtn');
    if (closeButton) {
      closeButton.addEventListener('click', close);
    }
  };

  /**
   * Открывает модальное окно
   */
  const open = () => {
    const modal = document.getElementById(POLICY_ID);
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  /**
   * Закрывает модальное окно
   */
  const close = () => {
    const modal = document.getElementById(POLICY_ID);
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  return { init, open, close };
})();

// ==================== ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ ====================

/**
 * Инициализирует все модули при загрузке страницы
 * Вызывается один раз при готовности DOM
 */
function initializeApp() {
  // Инициализируем модули в правильном порядке
  PhoneFormatter.init();           // Форматирование телефона
  CustomSelectManager.init();      // Кастомные селекты
  CookieManager.init();            // Управление cookies
  MobileMenuManager.init();        // Мобильное меню
  NavigationManager.init();        // Навигация по странице
  ServiceManager.init();           // Интеграция кнопок услуг
  GalleryManager.init();           // Галерея и лайтбокс
  FAQManager.init();               // FAQ аккордеон
  FormManager.init();              // Форма записи
  PolicyManager.init();            // Модальное окно политики конфиденциальности

  console.log('✓ Приложение успешно инициализировано');
}

// Запускаем инициализацию при готовности DOM
document.addEventListener('DOMContentLoaded', initializeApp);