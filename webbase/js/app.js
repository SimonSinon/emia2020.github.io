document.addEventListener("DOMContentLoaded", () => {
  // Navigation smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Add entrance animation to tool cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(30px)';
        setTimeout(() => {
          entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100 + (index * 100)); // Stagger animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe feature cards and sections
  document.querySelectorAll('.tool-card, .value').forEach(card => {
    observer.observe(card);
  });

  // Add subtle parallax effect to hero
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const hero = document.querySelector('.hero');
        if (hero) {
          const scrolled = window.pageYOffset;
          const parallaxSpeed = 0.5;
          hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
});


