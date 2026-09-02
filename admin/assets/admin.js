(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var loginView = $('#loginView'), appView = $('#appView');
  var rows = [], view = [], current = null, quick = 'all';

  /* ── 유틸 ── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return String(iso || '');
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function dayStart(offset) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (offset || 0));
    return d.getTime();
  }

  /* ── 로그인 ── */
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('#loginBtn'), err = $('#loginErr');
    btn.disabled = true; err.textContent = '';
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: $('#loginId').value.trim(), pw: $('#loginPw').value })
    }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (res) {
        if (res.j && res.j.ok) { showApp(); return; }
        if (res.s === 500) err.textContent = '관리자 계정이 설정되지 않았습니다. 배포 설정을 확인해 주십시오.';
        else err.textContent = '아이디 또는 비밀번호가 맞지 않습니다.';
      })
      .catch(function () { err.textContent = '접속에 실패했습니다. 잠시 후 다시 시도해 주십시오.'; })
      .then(function () { btn.disabled = false; });
  });

  $('#logoutBtn').addEventListener('click', function () {
    fetch('/api/logout', { method: 'POST' }).then(function () { location.reload(); });
  });

  function showApp() {
    loginView.hidden = true;
    appView.hidden = false;
    load();
  }

  /* ── 데이터 ── */
  function load() {
    $('#count').textContent = '불러오는 중…';
    fetch('/api/inquiries', { headers: { 'Cache-Control': 'no-cache' } })
      .then(function (r) {
        if (r.status === 401) { loginView.hidden = false; appView.hidden = true; throw new Error('auth'); }
        return r.json();
      })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'FAILED');
        rows = j.rows || [];
        buildOptions();
        render();
      })
      .catch(function (e) {
        if (e.message === 'auth') return;
        $('#count').textContent = '목록을 불러오지 못했습니다. (' + e.message + ')';
      });
  }
  $('#reloadBtn').addEventListener('click', load);

  function buildOptions() {
    var fs = {}, st = {};
    rows.forEach(function (r) {
      (r.fields || []).forEach(function (f) { fs[f] = 1; });
      if (r.status) st[r.status] = 1;
    });
    fill($('#fField'), Object.keys(fs), '관심 분야 · 전체');
    fill($('#fStatus'), Object.keys(st), '현재 상황 · 전체');
  }
  function fill(sel, list, label) {
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + label + '</option>' +
      list.sort().map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('');
    if (list.indexOf(cur) >= 0) sel.value = cur;
  }

  /* ── 필터 · 렌더 ── */
  function render() {
    var q = $('#q').value.trim().toLowerCase();
    var ff = $('#fField').value, fs = $('#fStatus').value, fh = $('#fHandled').value;

    view = rows.filter(function (r) {
      if (quick === 'todo' && r.handled) return false;
      if (quick === 'today' && new Date(r.created_at).getTime() < dayStart(0)) return false;
      if (quick === 'week' && new Date(r.created_at).getTime() < dayStart(6)) return false;
      if (ff && (r.fields || []).indexOf(ff) < 0) return false;
      if (fs && r.status !== fs) return false;
      if (fh === '0' && r.handled) return false;
      if (fh === '1' && !r.handled) return false;
      if (q) {
        var hay = [r.name, r.company, r.phone, r.email, r.summary, r.memo, (r.fields || []).join(' ')]
          .join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });

    $('#statAll').textContent = rows.length;
    $('#statTodo').textContent = rows.filter(function (r) { return !r.handled; }).length;
    $('#statToday').textContent = rows.filter(function (r) { return new Date(r.created_at).getTime() >= dayStart(0); }).length;
    $('#statWeek').textContent = rows.filter(function (r) { return new Date(r.created_at).getTime() >= dayStart(6); }).length;

    $('#count').textContent = '전체 ' + rows.length + '건 중 ' + view.length + '건 표시';
    $('#empty').hidden = view.length > 0;

    $('#list').innerHTML = view.map(function (r) {
      var tags = (r.fields || []).slice(0, 4).map(function (f) { return '<span class="tag">' + esc(f) + '</span>'; }).join('');
      var more = (r.fields || []).length > 4 ? '<span class="tag">+' + ((r.fields || []).length - 4) + '</span>' : '';
      var line = r.summary || r.memo || '';
      return '<button type="button" class="card' + (r.handled ? ' is-done' : '') + '" data-id="' + r.id + '">' +
        '<span class="card__top"><span class="card__name">' + esc(r.name) + '</span>' +
        (r.company ? '<span class="card__co">' + esc(r.company) + '</span>' : '') +
        '<span class="card__co">' + esc(r.phone) + '</span></span>' +
        '<span class="card__date">' + fmt(r.created_at) + '</span>' +
        '<span class="card__meta">' +
          '<span class="tag ' + (r.handled ? 'tag--done' : 'tag--todo') + '">' + (r.handled ? '처리 완료' : '미처리') + '</span>' +
          '<span class="tag tag--st">' + esc(r.status) + '</span>' + tags + more +
        '</span>' +
        (line ? '<span class="card__line">' + esc(line) + '</span>' : '') +
        '</button>';
    }).join('');
  }

  ['#q', '#fField', '#fStatus', '#fHandled'].forEach(function (s) {
    $(s).addEventListener('input', render);
    $(s).addEventListener('change', render);
  });
  $('#resetBtn').addEventListener('click', function () {
    $('#q').value = ''; $('#fField').value = ''; $('#fStatus').value = ''; $('#fHandled').value = '';
    quick = 'all';
    document.querySelectorAll('.stat').forEach(function (b) { b.classList.toggle('is-on', b.dataset.quick === 'all'); });
    render();
  });
  document.querySelectorAll('.stat').forEach(function (b) {
    b.addEventListener('click', function () {
      quick = b.dataset.quick;
      document.querySelectorAll('.stat').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      render();
    });
  });

  /* ── 상세 ── */
  $('#list').addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (card) open(Number(card.dataset.id));
  });

  function open(id) {
    var r = rows.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    current = r;
    $('#dName').textContent = r.name;
    $('#dSub').textContent = (r.company || '개인') + ' · ' + r.status;
    $('#dDate').textContent = fmt(r.created_at);
    $('#dPhone').innerHTML = r.phone ? '<a href="tel:' + esc(r.phone.replace(/[^0-9+]/g, '')) + '">' + esc(r.phone) + '</a>' : '—';
    $('#dEmail').innerHTML = r.email ? '<a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>' : '—';
    $('#dCompany').textContent = r.company || '—';
    $('#dStatus').textContent = r.status || '—';
    $('#dFields').textContent = (r.fields || []).join(', ') || '—';
    $('#dSummary').textContent = r.summary || '(작성 없음)';
    $('#dMemo').value = r.memo || '';
    $('#dHandled').checked = !!r.handled;
    $('#callBtn').href = r.phone ? 'tel:' + r.phone.replace(/[^0-9+]/g, '') : '#';
    $('#mailBtn').href = r.email ? 'mailto:' + r.email : '#';
    $('#savedMsg').textContent = '';
    $('#savedMsg').className = 'saved';
    $('#sheet').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    $('#sheet').hidden = true;
    document.body.style.overflow = '';
    current = null;
  }
  document.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#sheet').hidden) close(); });

  $('#saveBtn').addEventListener('click', function () {
    if (!current) return;
    var btn = $('#saveBtn'), msg = $('#savedMsg');
    btn.disabled = true; msg.className = 'saved'; msg.textContent = '저장 중…';
    fetch('/api/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: current.id, handled: $('#dHandled').checked, memo: $('#dMemo').value })
    }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'FAILED');
        current.handled = $('#dHandled').checked;
        current.memo = $('#dMemo').value;
        msg.textContent = '저장했습니다.';
        render();
      })
      .catch(function (e) { msg.className = 'saved err'; msg.textContent = '저장에 실패했습니다. (' + e.message + ')'; })
      .then(function () { btn.disabled = false; });
  });

  $('#delBtn').addEventListener('click', function () {
    if (!current) return;
    if (!confirm(current.name + ' 님의 신청을 삭제합니다. 되돌릴 수 없습니다.')) return;
    fetch('/api/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: current.id, action: 'delete' })
    }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'FAILED');
        rows = rows.filter(function (x) { return x.id !== current.id; });
        close(); render();
      })
      .catch(function (e) { alert('삭제에 실패했습니다. ' + e.message); });
  });

  /* ── 엑셀(CSV) ── */
  $('#csvBtn').addEventListener('click', function () {
    var head = ['접수일시', '성함', '회사·상호', '연락처', '이메일', '관심분야', '현재상황', '경력·사업요약', '처리상태', '메모'];
    var body = view.map(function (r) {
      return [fmt(r.created_at), r.name, r.company || '', r.phone, r.email || '',
        (r.fields || []).join(' / '), r.status, r.summary || '',
        r.handled ? '처리 완료' : '미처리', r.memo || ''];
    });
    var csv = [head].concat(body).map(function (row) {
      return row.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '사업파트너신청_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* ── 시작: 이미 로그인돼 있으면 바로 진입 ── */
  fetch('/api/inquiries').then(function (r) {
    if (r.ok) showApp();
    else loginView.hidden = false;
  }).catch(function () { loginView.hidden = false; });
})();
