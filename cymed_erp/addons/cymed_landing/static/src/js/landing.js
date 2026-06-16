/**
 * CyMed Landing Page — smooth-scroll, fade-in on view, FAQ enhancements.
 */
(function() {
  'use strict';

  // Smooth-scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
      }
    });
  });

  // Fade-in sections on scroll
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.cymed-feature, .cymed-security-card, .cymed-testimonial, .cymed-price-card').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(el);
    });
  }

  // Close other open FAQ items when one opens (accordion behaviour)
  document.querySelectorAll('.cymed-faq-item').forEach((item) => {
    item.addEventListener('toggle', function() {
      if (this.open) {
        document.querySelectorAll('.cymed-faq-item').forEach((other) => {
          if (other !== this) other.open = false;
        });
      }
    });
  });
})();
