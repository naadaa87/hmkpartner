(function () {
  'use strict';
  var cfg = window.HMK_PARTNER_CONFIG || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 모바일 메뉴 ───────────────────────── */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    var toggle = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      mobileMenu.hidden = !open;
    };
    burger.addEventListener('click', function () {
      toggle(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') toggle(false);
    });
  }

  /* ── 전화번호 표시 ─────────────────────── */
  var phoneRow = document.querySelector('[data-contact="phone"]');
  if (cfg.CONTACT_PHONE && phoneRow) {
    var p = document.getElementById('contactPhone');
    p.textContent = cfg.CONTACT_PHONE;
    p.href = 'tel:' + cfg.CONTACT_PHONE.replace(/[^0-9+]/g, '');
    phoneRow.hidden = false;
  }

  /* ── 등장 효과 ─────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ── 메뉴 현재 위치 표시 ───────────────── */
  var links = [].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    var setActive = function (id) {
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
    };
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    targets.forEach(function (t) { so.observe(t); });
  }

  /* ── 모바일 고정 신청 바 ───────────────── */
  var sticky = document.getElementById('stickyBar');
  var applySec = document.getElementById('apply');
  if (sticky && applySec) {
    var applyVisible = false;
    var pastHero = false;
    var sync = function () {
      var show = pastHero && !applyVisible && !document.body.classList.contains('form-done');
      sticky.hidden = !show;
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        applyVisible = e[0].isIntersecting; sync();
      }, { threshold: 0 }).observe(applySec);
      var hero = document.querySelector('.hero');
      if (hero) {
        new IntersectionObserver(function (e) {
          pastHero = !e[0].isIntersecting; sync();
        }, { threshold: 0 }).observe(hero);
      }
    }
  }

  /* ── 상단 바 그림자 · 맨 위로 버튼 ─────── */
  var topBar = document.getElementById('top');
  var topBtn = document.getElementById('topBtn');
  var onScroll = function () {
    if (topBar) topBar.classList.toggle('is-scrolled', window.scrollY > 8);
    if (topBtn) topBtn.classList.toggle('is-show', window.scrollY > window.innerHeight * 1.2);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── 사무실 갤러리 ─────────────────────── */
  var gal = document.getElementById('gal');
  if (gal) {
    var gImg = document.getElementById('galImg');
    var gSrc = document.getElementById('galSrc');
    var gCap = document.getElementById('galCap');
    var gNow = document.getElementById('galNow');
    var stage = gal.querySelector('.gal__stage');
    var thumbs = [].slice.call(gal.querySelectorAll('.gal__t'));
    var idx = 0;

    // 사진 주소 뒤에 붙이는 판 번호. 파일을 새로 올렸을 때
    // 브라우저가 예전 응답을 계속 쓰지 않도록 하는 장치.
    var IMGV = '?v=20260903c';

    // 사진이 없을 때만 갤러리를 감춤. 평소에는 그대로 보임.
    var probe = new Image();
    probe.onerror = function () { gal.hidden = true; };
    probe.src = 'assets/img/office/lobby.jpg' + IMGV;

    function show(i) {
      i = (i + thumbs.length) % thumbs.length;
      idx = i;
      var b = thumbs[i];
      var name = b.dataset.name;
      stage.classList.add('is-load');
      var pre = new Image();
      pre.onload = pre.onerror = function () { stage.classList.remove('is-load'); };
      pre.src = 'assets/img/office/' + name + '.jpg' + IMGV;
      gSrc.srcset = 'assets/img/office/' + name + '.webp' + IMGV;
      gImg.src = 'assets/img/office/' + name + '.jpg' + IMGV;
      gImg.alt = 'HMK홀딩스그룹 본사 ' + b.dataset.cap;
      gCap.textContent = b.dataset.cap;
      gNow.textContent = i + 1;
      thumbs.forEach(function (t, n) {
        t.classList.toggle('is-on', n === i);
        t.setAttribute('aria-selected', n === i ? 'true' : 'false');
      });
    }

    thumbs.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    document.getElementById('galPrev').addEventListener('click', function () { show(idx - 1); });
    document.getElementById('galNext').addEventListener('click', function () { show(idx + 1); });

    gal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(idx - 1); }
      else if (e.key === 'ArrowRight') { show(idx + 1); }
    });

    // 모바일 좌우 스와이프
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });

    // 첫 화면이 자리 잡은 뒤 나머지 사진을 미리 받아 둠
    setTimeout(function () {
      thumbs.forEach(function (b) { new Image().src = 'assets/img/office/' + b.dataset.name + '.jpg' + IMGV; });
    }, 1500);
  }

  /* ── 신청 폼 ───────────────────────────── */
  var form = document.getElementById('partnerForm');
  if (!form) return;
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var doneBox = document.getElementById('doneBox');
  var doneFallback = document.getElementById('doneFallback');
  var fallbackText = document.getElementById('fallbackText');
  var copyBtn = document.getElementById('copyBtn');

  function setStatus(msg, ok) {
    statusEl.textContent = msg || '';
    statusEl.classList.toggle('ok', !!ok);
  }

  function collect() {
    var fd = new FormData(form);
    return {
      name: (fd.get('name') || '').trim(),
      company: (fd.get('company') || '').trim(),
      phone: (fd.get('phone') || '').trim(),
      email: (fd.get('email') || '').trim(),
      fields: fd.getAll('fields'),
      status: fd.get('status') || '',
      summary: (fd.get('summary') || '').trim(),
      consent: !!fd.get('consent'),
      website: (fd.get('website') || '').trim(),
      source: document.referrer || '',
      page: location.href,
      submitted_at: new Date().toISOString()
    };
  }

  function validate(d) {
    form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
    var first = null;
    function bad(el, msg) {
      if (!el) return;
      el.classList.add('is-invalid');
      if (!first) { first = el; setStatus(msg); }
    }
    if (!d.name) bad(form.elements.name, '성함을 입력해 주십시오.');
    if (!d.phone || d.phone.replace(/[^0-9]/g, '').length < 9) bad(form.elements.phone, '연락처를 확인해 주십시오.');
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) bad(form.elements.email, '이메일 형식을 확인해 주십시오.');
    if (!d.fields.length) bad(form.querySelector('.chips'), '관심 분야를 하나 이상 선택해 주십시오.');
    if (!d.status) bad(form.querySelector('.radios'), '현재 상황을 선택해 주십시오.');
    if (!d.consent) bad(form.querySelector('.consent'), '개인정보 수집 · 이용에 동의해 주십시오.');
    if (first) {
      var focusEl = first.matches('input,textarea') ? first : first.querySelector('input,textarea');
      try {
        first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        if (focusEl) focusEl.focus({ preventScroll: true });
      } catch (err) {}
      return false;
    }
    setStatus('');
    return true;
  }

  function toText(d) {
    return [
      '[HMK 사업파트너 신청]',
      '성함: ' + d.name,
      '회사·상호: ' + (d.company || '-'),
      '연락처: ' + d.phone,
      '이메일: ' + (d.email || '-'),
      '관심 분야: ' + d.fields.join(', '),
      '현재 상황: ' + d.status,
      '경력·사업 요약:',
      d.summary || '-',
      '',
      '접수 시각: ' + d.submitted_at
    ].join('\n');
  }

  function sendApi(d) {
    return fetch(cfg.SUBMIT_API || '/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: d.name, company: d.company, phone: d.phone, email: d.email,
        fields: d.fields, status: d.status, summary: d.summary,
        source: d.source, page: d.page, website: d.website
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      if (!j || !j.ok) throw new Error((j && j.error) || 'FAILED');
    });
  }

  function showDone(usedFallback, text) {
    form.hidden = true;
    doneBox.hidden = false;
    document.body.classList.add('form-done');
    if (sticky) sticky.hidden = true;
    if (usedFallback) { doneFallback.hidden = false; fallbackText.value = text; }
    doneBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function sendMailto(d) {
    var to = cfg.FALLBACK_MAILTO || cfg.CONTACT_EMAIL || '';
    var text = toText(d);
    var subject = '[사업파트너 신청] ' + d.name + (d.company ? ' · ' + d.company : '');
    if (to) {
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    }
    showDone(true, text);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = collect();
    if (d.website) { showDone(false); return; }
    if (!validate(d)) return;

    submitBtn.disabled = true;
    setStatus('보내는 중입니다…', true);

    sendApi(d)
      .then(function () { setStatus(''); showDone(false); })
      .catch(function () { setStatus(''); sendMailto(d); })
      .then(function () { submitBtn.disabled = false; });
  });

  form.addEventListener('input', function (e) {
    if (e.target.classList) e.target.classList.remove('is-invalid');
  });

  var phoneField = form.elements.phone;
  if (phoneField) {
    phoneField.addEventListener('input', function () {
      var v = this.value;
      if (/[^0-9-]/.test(v)) return;
      var d = v.replace(/\D/g, '').slice(0, 11);
      if (!/^01/.test(d) || d.length < 4) return;
      var out = d.length > 7
        ? d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4)
        : d.slice(0, 3) + '-' + d.slice(3);
      if (out !== v) this.value = out;
    });
  }
  form.addEventListener('change', function (e) {
    var box = e.target.closest('.chips,.radios,.consent');
    if (box) box.classList.remove('is-invalid');
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      fallbackText.select();
      var ok = false;
      try {
        if (navigator.clipboard) { navigator.clipboard.writeText(fallbackText.value); ok = true; }
        else { ok = document.execCommand('copy'); }
      } catch (err) {}
      copyBtn.textContent = ok ? '복사했습니다' : '복사에 실패했습니다';
      setTimeout(function () { copyBtn.textContent = '내용 복사'; }, 2000);
    });
  }
})();
