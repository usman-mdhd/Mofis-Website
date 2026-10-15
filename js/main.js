document.addEventListener('DOMContentLoaded', () => {

  // Hero rotating audience text
  const rotatingWords = [...document.querySelectorAll('.rotating-word')];
  if (rotatingWords.length > 1) {
    let rotatingIndex = 0;
    setInterval(() => {
      rotatingWords[rotatingIndex].classList.remove('active');
      rotatingIndex = (rotatingIndex + 1) % rotatingWords.length;
      rotatingWords[rotatingIndex].classList.add('active');
    }, 2000);
  }

  const year = document.getElementById('yr');
  if (year) year.textContent = new Date().getFullYear();

  // Navigation
  const nav = document.getElementById('mainNav');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 35);
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Feature card cursor-follow glow
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // Process item (Lease, Design, Build...) cursor-follow glow
  document.querySelectorAll('.process-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      item.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      item.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // Premium 2-second gallery carousel
  const gallery = document.getElementById('galleryCarousel');
  if (gallery) {
    const slides = [...gallery.querySelectorAll('.gallery-slide')];
    const thumbs = [...gallery.querySelectorAll('.gallery-thumb')];
    const prev = document.getElementById('galleryPrev');
    const next = document.getElementById('galleryNext');

    let current = 0;
    let timer = null;
    const delay = 2000;


    const showSlide = (index, restart = true) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === current);
        if (i === current) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      if (restart) start();
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => showSlide(current + 1, false), delay);
    };

    const stop = () => {
      clearInterval(timer);
    };

    prev?.addEventListener('click', () => showSlide(current - 1));
    next?.addEventListener('click', () => showSlide(current + 1));

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => showSlide(index));
    });

    // Start the sequence when the gallery enters the viewport.
    const galleryObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0.18 });
    galleryObserver.observe(gallery);

    // Small touch swipe support for mobile.
    let touchStartX = 0;
    gallery.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    gallery.addEventListener('touchend', e => {
      const distance = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 45) showSlide(distance < 0 ? current + 1 : current - 1);
    }, { passive: true });

    // Respect reduced-motion preferences.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) stop();
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(openQ => {
        if (openQ !== question) {
          openQ.setAttribute('aria-expanded', 'false');
          openQ.closest('.faq-item').querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });

  // Contact form — sends submissions to hello@mofis.in via Web3Forms
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button');
      const originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = 'Sending…';
      note.textContent = '';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        const result = await response.json();

        if (result.success) {
          note.textContent = "Thank you — we'll be in touch shortly.";
          button.textContent = 'Enquiry Received';
          form.reset();
        } else {
          note.textContent = "Something went wrong. Please try again or call us directly.";
          button.disabled = false;
          button.textContent = originalLabel;
        }
      } catch (err) {
        note.textContent = "Something went wrong. Please try again or call us directly.";
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  }
});