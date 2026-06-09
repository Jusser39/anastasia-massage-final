const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const serviceOptions = document.querySelectorAll("[data-service-value]");
const dateOptions = document.querySelectorAll("[data-date-value]");
const timeOptions = document.querySelectorAll("[data-time-value]");
const bookingSummary = document.querySelector("[data-booking-summary]");
const bookingDate = document.querySelector("[data-booking-date]");
const bookingTime = document.querySelector("[data-booking-time]");
const whatsappBooking = document.querySelector("[data-whatsapp-booking]");
const telegramBooking = document.querySelector("[data-telegram-booking]");
const openBookingForm = document.querySelector("[data-open-booking-form]");
const bookingForm = document.querySelector("[data-booking-form]");
const bookingPayload = document.querySelector("[data-booking-payload]");
const formStatus = document.querySelector("[data-form-status]");
const documentsModal = document.querySelector("[data-documents-modal]");
const documentsOpen = document.querySelector("[data-documents-open]");
const documentsClose = document.querySelectorAll("[data-documents-close]");

const bookingState = {
  service: document.querySelector("[data-service-value].active")?.dataset.serviceValue || "Массаж спины · 40 минут · 2 200 ₽",
  serviceCode: document.querySelector("[data-service-value].active")?.dataset.serviceCode || "back-40",
  date: document.querySelector("[data-date-value].active")?.dataset.dateValue || "10 июня, среда",
  time: document.querySelector("[data-time-value].active")?.dataset.timeValue || "10:00",
};

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

function updateBookingSummary() {
  if (bookingSummary) {
    bookingSummary.textContent = bookingState.service;
  }

  if (bookingDate) {
    bookingDate.textContent = bookingState.date;
  }

  if (bookingTime) {
    bookingTime.textContent = bookingState.time;
  }

  const message = `Здравствуйте! Хочу записаться на массаж.\n\nУслуга: ${bookingState.service}\nДата: ${bookingState.date}\nВремя: ${bookingState.time}\n\nПодскажите, пожалуйста, свободно ли это время?`;

  if (whatsappBooking) {
    whatsappBooking.href = `https://wa.me/79005636376?text=${encodeURIComponent(message)}`;
  }

  if (telegramBooking) {
    telegramBooking.href = "https://t.me/massage_by_anastasiia";
    telegramBooking.title = message;
  }

  if (bookingPayload) {
    bookingPayload.value = `Код услуги: ${bookingState.serviceCode}; Услуга: ${bookingState.service}; Дата: ${bookingState.date}; Время: ${bookingState.time}`;
  }
}

function activateOption(options, selected, className = "active") {
  options.forEach((item) => item.classList.remove(className));
  selected.classList.add(className);
}

serviceOptions.forEach((option) => {
  option.addEventListener("click", () => {
    activateOption(serviceOptions, option);
    bookingState.service = option.dataset.serviceValue;
    bookingState.serviceCode = option.dataset.serviceCode || "";
    updateBookingSummary();
  });
});

dateOptions.forEach((option) => {
  option.addEventListener("click", () => {
    activateOption(dateOptions, option);
    bookingState.date = option.dataset.dateValue;
    updateBookingSummary();
  });
});

timeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    activateOption(timeOptions, option);
    bookingState.time = option.dataset.timeValue;
    updateBookingSummary();
  });
});

updateBookingSummary();

if (openBookingForm && bookingForm) {
  openBookingForm.addEventListener("click", () => {
    bookingForm.classList.add("open");
    bookingForm.setAttribute("aria-hidden", "false");
    updateBookingSummary();
    bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    bookingForm.querySelector("input[name='name']")?.focus({ preventScroll: true });
  });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const comment = String(formData.get("comment") || "").trim();
    const booking = String(formData.get("booking") || "").trim();

    if (!name || !phone) {
      if (formStatus) {
        formStatus.textContent = "Заполните имя и телефон, чтобы заявка была готова к отправке.";
      }
      return;
    }

    if (formStatus) {
      formStatus.textContent = "Отправляю заявку...";
    }

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, comment, booking }),
      });

      const result = await response.json().catch(() => ({ ok: false }));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "send failed");
      }

      if (formStatus) {
        formStatus.textContent = "Заявка отправлена. Анастасия скоро свяжется с вами.";
      }

      bookingForm.reset();
      updateBookingSummary();
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "Заявка не отправилась автоматически. Пожалуйста, продублируйте ее в WhatsApp.";
      }
    }
  });
}

if (bookingForm) {
  bookingForm.addEventListener("input", () => {
    if (formStatus) {
      formStatus.textContent = "";
    }
  });
}

function setDocumentsOpen(isOpen) {
  documentsModal.classList.toggle("open", isOpen);
  documentsModal.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

documentsOpen.addEventListener("click", () => setDocumentsOpen(true));

documentsClose.forEach((item) => {
  item.addEventListener("click", () => setDocumentsOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && documentsModal.classList.contains("open")) {
    setDocumentsOpen(false);
  }
});
