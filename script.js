(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      menuButton.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
      nav.classList.toggle('open', !expanded);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
    }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const progress = document.getElementById('progressBar');
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${percent}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (reducedMotion) return;
  document.documentElement.classList.add('js-motion');

  // Fallback nativo: a página continua animada mesmo se as bibliotecas externas não carregarem.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // GSAP aprimora os movimentos; sem GSAP, o fallback acima mantém o conteúdo visível.
  const enhanceWithGsap = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.hero-image', { scale: 1.12 }, {
      scale: 1.02, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.utils.toArray('.service-row').forEach((row, index) => {
      gsap.from(row, {
        x: index % 2 ? 22 : -22, opacity: 0, duration: .75, ease: 'power2.out',
        scrollTrigger: { trigger: row, start: 'top 88%' }
      });
    });
    ScrollTrigger.refresh();
  };
  window.addEventListener('load', enhanceWithGsap, { once: true });

  // Lenis é opcional: não bloqueia rolagem nativa se a CDN estiver indisponível.
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.15 });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.gsap) gsap.ticker.add(time => lenis.raf(time * 1000));
  }
})();
