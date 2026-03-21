import './style.css'
import { initSparkles } from './sparkles.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize sparkles effect in hero section
  await initSparkles({
    containerId: 'sparkles-container',
    background: 'transparent',
    particleColor: '#ffffff',
    particleDensity: 100,
    minSize: 0.4,
    maxSize: 1.2,
    speed: 0.8,
  });

  // 1. Header Scroll Effect
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Intersection Observer for Fade-in
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

  // 3. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.desktop-nav');

  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      mobileToggle.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 4. Contact Form Handler (Formspree)
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.removeAttribute('onsubmit');
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // FormData 대신 직접 값을 가져와 JSON으로 전송 (무료 플랜 호환성 위함)
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const attachment = document.getElementById('attachment').value; // 링크 입력값
      const message = document.getElementById('message').value;

      // 유효성 검사
      if (!name || !phone || !message) {
        alert('필수 항목(이름, 연락처, 내용)을 입력해주세요.');
        return;
      }

      const btn = contactForm.querySelector('button');
      const originalText = btn.innerText;
      btn.innerText = 'Sending...';
      btn.disabled = true;

      // ⚠️ 중요: 아래 URL의 'YOUR_FORM_ID'를 실제 Formspree Form ID로 교체해야 작동합니다.
      // 예: https://formspree.io/f/mqkbrnpx
      const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzzzoyg';

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ name, email, phone, attachment, message })
        });

        if (response.ok) {
          alert(`감사합니다, ${name}님.\n성공적으로 접수되었습니다.`);
          contactForm.reset();
        } else {
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            alert(data["errors"].map(error => error["message"]).join(", "));
          } else {
            alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        }
      } catch (error) {
        alert('네트워크 오류가 발생했습니다.');
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    });
  }
});
