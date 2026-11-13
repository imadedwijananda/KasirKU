/* kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Lisensi MIT + wajib atribusi (lihat LICENSE). */
/* Kasir UMKM — Maliki Studio (malikisaputra.biz.id). Lisensi MIT. */
(function () {
  'use strict';

  // ---------- KONFIG gambar: ganti logo/foto cukup di sini (atau timpa berkas di img/) ----------
  var KONFIG = {
    logo: 'img/logo.svg',                // logo toko: sidebar, layar masuk, struk. '' = pakai ikon bawaan
    fotoContoh: 'img/produk-contoh.svg', // placeholder foto produk (rasio 1:1)
    fotoProduk: {}                       // foto produk contoh per nama, mis. { 'Mie Goreng': 'img/mie.jpg' }
  };

  // ---------- Penyimpanan (localStorage, offline) ----------
  var KUNCI = 'kasir-umkm-v1';
  var NAMA_TEMA = (window.TEMA && TEMA.nama) || 'Kopi Senja';

  function dataKosong() {
    return {
      toko: { namaDariTema: true, nama: NAMA_TEMA, alamat: '', telp: '', footer: 'Terima kasih sudah belanja!', rekening: '' },
      kategori: [], produk: [], transaksi: [],
      kasir: [{ id: 'k1', nama: 'Admin', pin: '1234', peran: 'admin' }],
      nomor: 0
    };
  }

  function dataContoh() {
    var d = dataKosong();
    d.toko = { namaDariTema: true, nama: NAMA_TEMA, alamat: 'Jl. Merdeka No. 12, Bandung', telp: '0812-0000-1234', footer: 'Terima kasih, sampai jumpa lagi!', rekening: 'Bank Contoh 0000000000 a.n. ' + NAMA_TEMA };
    d.kategori = ['Kopi', 'Non-Kopi', 'Makanan', 'Camilan'];
    var p = [
      ['Kopi Susu Gula Aren', 'Kopi', 40, [['Reguler', 18000], ['Large', 23000]]],
      ['Americano', 'Kopi', 50, [['Hot', 15000], ['Ice', 17000]]],
      ['Cappuccino', 'Kopi', 30, [['Reguler', 22000]]],
      ['Matcha Latte', 'Non-Kopi', 25, [['Reguler', 22000], ['Large', 27000]]],
      ['Cokelat Panas', 'Non-Kopi', 20, [['Reguler', 18000]]],
      ['Teh Lemon', 'Non-Kopi', 60, [['Reguler', 10000]]],
      ['Nasi Goreng Kampung', 'Makanan', 15, [['Biasa', 22000], ['Spesial', 28000]]],
      ['Mie Goreng', 'Makanan', 4, [['Biasa', 18000]]],
      ['Roti Bakar', 'Camilan', 18, [['Cokelat', 15000], ['Keju', 17000], ['Campur', 19000]]],
      ['Kentang Goreng', 'Camilan', 22, [['Reguler', 14000]]],
      ['Pisang Goreng', 'Camilan', 0, [['Isi 5', 12000]]]
    ];
    d.produk = p.map(function (x, i) {
      return { id: 'p' + (i + 1), nama: x[0], kategori: x[1], stok: x[2], foto: KONFIG.fotoProduk[x[0]] || '', varian: x[3].map(function (v) { return { nama: v[0], harga: v[1] }; }) };
    });
    d.kasir.push({ id: 'k2', nama: 'Sari', pin: '1111', peran: 'kasir' });
    // transaksi contoh 30 hari terakhir
    var acak = semai(7);
    var sekarang = new Date();
    for (var h = 29; h >= 0; h--) {
      var n = 3 + Math.floor(acak() * 7);
      for (var t = 0; t < n; t++) {
        var w = new Date(sekarang); w.setDate(w.getDate() - h);
        w.setHours(8 + Math.floor(acak() * 13), Math.floor(acak() * 60), 0, 0);
        if (w > sekarang) continue;
        var items = [], m = 1 + Math.floor(acak() * 3);
        for (var j = 0; j < m; j++) {
          var pr = d.produk[Math.floor(acak() * d.produk.length)], vr = pr.varian[Math.floor(acak() * pr.varian.length)];
          items.push({ pid: pr.id, nama: pr.nama, varian: vr.nama, harga: vr.harga, qty: 1 + Math.floor(acak() * 2) });
        }
        var sub = items.reduce(function (s, it) { return s + it.harga * it.qty; }, 0);
        var mt = ['tunai', 'tunai', 'qris', 'transfer'][Math.floor(acak() * 4)];
        var bayar = mt === 'tunai' ? Math.ceil(sub / 10000) * 10000 : sub;
        d.nomor++;
        d.transaksi.push({ id: noTrx(w, d.nomor), waktu: w.toISOString(), kasir: acak() > .5 ? 'Sari' : 'Admin', items: items, subtotal: sub, diskon: 0, total: sub, metode: mt, bayar: bayar, kembali: bayar - sub });
      }
    }
    return d;
  }
  function semai(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  var D;
  function muat() {
    try { D = JSON.parse(localStorage.getItem(KUNCI)); } catch (e) { D = null; }
    if (!D || !D.produk) { D = dataContoh(); simpan(); }
    // Migrasi data lama: nama bawaan lama dianggap belum diubah pengguna.
    if (D.toko.namaDariTema === undefined) D.toko.namaDariTema = D.toko.nama === 'Kopi Senja' || D.toko.nama === 'Toko Saya';
    if (D.toko.namaDariTema) D.toko.nama = NAMA_TEMA;
  }

  // ---------- Tema (customizer Maliki Studio, lihat tema.css & tema.js) ----------
  var FONT_OK = ['Plus Jakarta Sans', 'Inter', 'Poppins', 'DM Sans', 'Space Grotesk', 'Nunito'];
  function terapkanTema(t) {
    var r = document.documentElement, st = r.style;
    if (t.utama) st.setProperty('--tema-utama', t.utama);
    if (t.aksen) st.setProperty('--tema-aksen', t.aksen);
    if (t.radius != null) st.setProperty('--tema-radius', typeof t.radius === 'number' ? t.radius + 'px' : t.radius);
    if (t.font) {
      var f = String(t.font).split(',')[0].replace(/["']/g, '').trim();
      st.setProperty('--tema-font', '"' + f + '", system-ui, sans-serif');
      var l = document.getElementById('fontTema');
      if (l && FONT_OK.indexOf(f) >= 0) l.href = 'https://fonts.googleapis.com/css2?family=' + f.replace(/ /g, '+') + ':wght@400;500;600;700;800&display=swap';
    }
    if (t.mode) { var m = t.mode === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang') : t.mode; r.setAttribute('data-mode', m); }
    if (t.bagian) terapkanBagian(t.bagian);
    setTimeout(hitungTeksBagian, 0);
    if (t.nama) {
      NAMA_TEMA = t.nama;
      if (D && D.toko.namaDariTema) { D.toko.nama = t.nama; $$('[data-tema-nama]').forEach(function (e) { e.textContent = t.nama; }); }
    }
  }
  window.addEventListener('message', function (e) { if (e.data && e.data.tipe === 'tema') terapkanTema(e.data); });
  // ---------- Bagian (customizer: warna per bagian, sorot, tap-untuk-pilih) ----------
  var PETA_BAGIAN = {
    nav: '.samping, .bawah, .masuk-merek',
    latar: 'main, .masuk-form, .pos-kiri, .hal',
    panel: '.panel, .kartu-produk, .keranjang, .ker-ringkas, .layar-uang, .numpad button, .tabel-bungkus, .trx, .angka:not(.sorot), dialog, .masuk-kartu',
    utama: '.tombol.utama, .nav.aktif, .chip.aktif, .tambah, .tautan, .angka.sorot, .pilih-kasir .aktif, .fab-keranjang',
    aksen: '.thumb, .di-ker, .masuk-ilus, .grafik .batang, .terlaris li, .stok.tipis',
    teks: 'h1, h2, h3, .total-besar, .kartu-produk b, .baris.total, .merek span'
  };
  var NAMA_BAGIAN = { nav: 'Navigasi', latar: 'Latar', panel: 'Panel', utama: 'Warna utama', aksen: 'Aksen', teks: 'Teks' };
  var VAR_BAGIAN = { latar: '--latar', panel: '--kartu', nav: '--nav', teks: '--teks' };
  function tandaiBagian() {
    var baru = 0;
    Object.keys(PETA_BAGIAN).forEach(function (b) {
      Array.prototype.forEach.call(document.querySelectorAll(PETA_BAGIAN[b]), function (el) { if (!el.hasAttribute('data-bagian')) { el.setAttribute('data-bagian', b); baru++; } });
    });
    if (baru && sorotAktif) sorot(sorotAktif);
  }
  // warna teks otomatis (terang/gelap) dari luminansi warna latar sebenarnya
  function warnaNyata(v) {
    var p = document.createElement('i'); p.style.cssText = 'position:absolute;width:0;height:0;background:var(' + v + ')';
    document.body.appendChild(p); var c = getComputedStyle(p).backgroundColor; p.remove();
    var m = c.match(/[\d.]+/g) || [255, 255, 255];
    if (/^color\(srgb/.test(c)) m = m.map(function (x) { return x * 255; });
    return m.slice(0, 3).map(Number);
  }
  function teksUntuk(v) {
    var l = warnaNyata(v).map(function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    var L = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
    return L > 0.4 ? '#14171a' : '#ffffff';
  }
  function hitungTeksBagian() {
    if (!document.body) return;
    var st = document.documentElement.style;
    st.setProperty('--tema-nav-teks', teksUntuk('--nav'));
    st.setProperty('--tema-utama-teks', teksUntuk('--utama'));
  }
  function terapkanBagian(bg) {
    var st = document.documentElement.style;
    Object.keys(VAR_BAGIAN).forEach(function (k) {
      if (bg[k] === undefined) return;
      if (bg[k]) { st.setProperty('--tema-' + k, bg[k]); st.setProperty(VAR_BAGIAN[k], bg[k]); }
      else { st.removeProperty('--tema-' + k); st.removeProperty(VAR_BAGIAN[k]); }
    });
  }
  var sorotAktif = null;
  function sorot(b) {
    sorotAktif = b;
    Array.prototype.forEach.call(document.querySelectorAll('[data-sorot]'), function (e) { e.removeAttribute('data-sorot'); });
    Array.prototype.forEach.call(document.querySelectorAll('.label-sorot'), function (e) { e.remove(); });
    if (!b) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-bagian="' + b + '"]'), function (e) {
      e.setAttribute('data-sorot', '');
      var r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
      var lb = document.createElement('span'); lb.className = 'label-sorot'; lb.textContent = NAMA_BAGIAN[b] || b;
      lb.style.left = Math.max(2, r.left + 4) + 'px'; lb.style.top = Math.max(2, r.top + 4) + 'px';
      document.body.appendChild(lb);
    });
  }
  var modePilih = false, hoverEl = null;
  function bagianDari(t) { return t && t.closest ? t.closest('[data-bagian]') : null; }
  function setPilih(on) {
    modePilih = !!on; document.documentElement.classList.toggle('mode-pilih', modePilih);
    if (!modePilih && hoverEl) { hoverEl.removeAttribute('data-pilih-hover'); hoverEl = null; }
  }
  ['click', 'pointerdown', 'mousedown', 'touchstart', 'submit', 'keydown'].forEach(function (tipe) {
    document.addEventListener(tipe, function (e) {
      if (!modePilih) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if (tipe === 'click') { var el = bagianDari(e.target); if (el) parent.postMessage({ tipe: 'bagian-dipilih', bagian: el.getAttribute('data-bagian') }, '*'); }
    }, { capture: true, passive: false });
  });
  document.addEventListener('mouseover', function (e) {
    if (!modePilih) return; var el = bagianDari(e.target);
    if (hoverEl && hoverEl !== el) hoverEl.removeAttribute('data-pilih-hover');
    hoverEl = el; if (el) el.setAttribute('data-pilih-hover', '');
  }, true);
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d) return;
    if (d.tipe === 'sorot') sorot(d.bagian || null);
    else if (d.tipe === 'mode-pilih') setPilih(d.aktif);
  });
  new MutationObserver(function (ms) {
    var mode = ms.some(function (m) { return m.type === 'attributes'; });
    var dom = ms.some(function (m) { return m.type === 'childList' && Array.prototype.some.call(m.addedNodes, function (n) { return n.nodeType === 1 && n.className !== 'label-sorot'; }); });
    if (dom) tandaiBagian(); if (mode) hitungTeksBagian();
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-mode'] });
  tandaiBagian(); hitungTeksBagian();

  function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(D)); } catch (e) { toast('Gagal menyimpan: memori penuh'); } }

  // ---------- Utilitas ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function rp(n) { return 'Rp' + Math.round(n || 0).toLocaleString('id-ID'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function dua(n) { return (n < 10 ? '0' : '') + n; }
  function tglKey(d) { return d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate()); }
  function noTrx(d, n) { return 'TRX' + String(d.getFullYear()).slice(2) + dua(d.getMonth() + 1) + dua(d.getDate()) + '-' + String(n).padStart(4, '0'); }
  function fmtWaktu(iso) { var d = new Date(iso); return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + dua(d.getHours()) + ':' + dua(d.getMinutes()); }
  // ---------- Ilustrasi produk (SVG buatan sendiri, dipilih dari kata di nama/kategori) ----------
  // Warna makanan tetap; latar kotak diturunkan dari tema (--utama/--aksen) di style.css (.thumb[data-nada]).
  var ILUS = {
    kopi: '<ellipse cx="60" cy="72" rx="34" ry="6" fill="#e9dfd2"/><path d="M38 40h44l-4 26a8 8 0 0 1-8 7H50a8 8 0 0 1-8-7z" fill="#fff" stroke="#d9cbb8" stroke-width="1.5"/><path d="M82 46h4a8 8 0 0 1 0 16h-6" fill="none" stroke="#d9cbb8" stroke-width="4"/><ellipse cx="60" cy="41" rx="22" ry="4.5" fill="#7a4a2b"/><path d="M53 38c2-3 6-3 7 0s5 3 7 0" fill="none" stroke="#e9c79a" stroke-width="1.6" stroke-linecap="round"/><path class="uap" d="M52 30c-3-4 3-6 0-11M61 29c-3-4 3-6 0-11M70 30c-3-4 3-6 0-11" fill="none" stroke="#b9a58e" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
    es: '<path d="M42 22h36l-5 52a6 6 0 0 1-6 5H53a6 6 0 0 1-6-5z" fill="#fff" fill-opacity=".55" stroke="#cfd6d2" stroke-width="1.5"/><path d="M44.5 40h31l-3.4 33a5 5 0 0 1-5 4.5H52.9a5 5 0 0 1-5-4.5z" fill="{c}"/><path d="M44.5 40h31l-.6 6c-6 3-24 3-30 0z" fill="#fff" opacity=".35"/><rect x="50" y="44" width="9" height="9" rx="2" fill="#fff" opacity=".7" transform="rotate(-12 54 48)"/><rect x="61" y="50" width="9" height="9" rx="2" fill="#fff" opacity=".6" transform="rotate(10 65 54)"/><path d="M66 12l-6 52" stroke="{s}" stroke-width="3.5" stroke-linecap="round"/>',
    mug: '<ellipse cx="60" cy="74" rx="30" ry="5" fill="#e9dfd2"/><rect x="38" y="36" width="40" height="38" rx="8" fill="{c}"/><path d="M78 44h3a8 8 0 0 1 0 16h-3" fill="none" stroke="{c}" stroke-width="5"/><path d="M40 37c4-9 14-6 18-10 4 5 12 1 18 10z" fill="#fff8ee"/><circle cx="52" cy="31" r="2" fill="#7a4a2b"/><circle cx="62" cy="29" r="1.6" fill="#7a4a2b"/><rect x="44" y="50" width="28" height="4" rx="2" fill="#fff" opacity=".25"/>',
    nasi: '<ellipse cx="60" cy="58" rx="44" ry="17" fill="#fff" stroke="#e6e0d6" stroke-width="1.5"/><ellipse cx="60" cy="56" rx="34" ry="11" fill="#f2f0ea"/><path d="M34 54c4-16 48-16 52 0-8 6-44 6-52 0z" fill="#d98a3a"/><circle cx="46" cy="47" r="1.6" fill="#b5651d"/><circle cx="58" cy="44" r="1.6" fill="#7aa35a"/><circle cx="70" cy="47" r="1.6" fill="#c0392b"/><ellipse cx="72" cy="42" rx="12" ry="8" fill="#fff"/><circle cx="73" cy="42" r="4.5" fill="#f5b52e"/><circle cx="36" cy="62" r="4" fill="#7fb069"/><circle cx="36" cy="62" r="2.2" fill="#d8ecc8"/><circle cx="45" cy="65" r="4" fill="#7fb069"/><circle cx="45" cy="65" r="2.2" fill="#d8ecc8"/>',
    mie: '<path d="M26 46h68a34 26 0 0 1-68 0z" fill="{c}"/><path d="M26 46h68" stroke="#fff" stroke-width="2" opacity=".4"/><path d="M34 46c4-10 8 4 12-6s8 6 12-4 8 6 12-4 8 6 12-2 6 4 8 0" fill="none" stroke="#e8b34a" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="40" r="3" fill="#7fb069"/><circle cx="72" cy="40" r="3" fill="#c0392b"/><path d="M70 10l18 30M78 8l14 32" stroke="#8b5a32" stroke-width="3" stroke-linecap="round"/><path d="M44 66h32" stroke="#fff" stroke-width="2" opacity=".3"/>',
    roti: '<ellipse cx="60" cy="72" rx="36" ry="6" fill="#e9dfd2"/><g transform="rotate(-8 50 50)"><path d="M30 46c-6-16 30-20 34-4v26H32z" fill="#c9843f"/><path d="M34 47c-3-11 24-14 27-3v21H35z" fill="#f4d9a6"/></g><g transform="rotate(8 72 50)"><path d="M56 46c-6-16 30-20 34-4v26H58z" fill="#c9843f"/><path d="M60 47c-3-11 24-14 27-3v21H61z" fill="#f4d9a6"/><path d="M62 52c4 3 8-3 12 0s8-3 12 0M62 60c4 3 8-3 12 0s8-3 12 0" fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round"/></g>',
    kentang: '<g fill="#f2c14e" stroke="#d99a2b" stroke-width="1"><rect x="40" y="14" width="6" height="34" rx="2" transform="rotate(-10 43 30)"/><rect x="49" y="10" width="6" height="36" rx="2"/><rect x="58" y="12" width="6" height="34" rx="2" transform="rotate(6 61 30)"/><rect x="66" y="14" width="6" height="32" rx="2" transform="rotate(14 69 30)"/><rect x="45" y="18" width="6" height="30" rx="2" transform="rotate(4 48 32)"/></g><path d="M36 36h48l-6 40H42z" fill="{c}"/><path d="M36 36c8 8 40 8 48 0" fill="none" stroke="#fff" stroke-width="2.5" opacity=".5"/><circle cx="60" cy="58" r="7" fill="#fff" opacity=".9"/><path d="M57 58h6" stroke="{c}" stroke-width="2" stroke-linecap="round"/>',
    pisang: '<ellipse cx="60" cy="62" rx="42" ry="14" fill="#fff" stroke="#e6e0d6" stroke-width="1.5"/><g fill="#d9902f"><ellipse cx="44" cy="52" rx="14" ry="7" transform="rotate(-18 44 52)"/><ellipse cx="62" cy="48" rx="15" ry="7" transform="rotate(8 62 48)"/><ellipse cx="78" cy="55" rx="13" ry="6.5" transform="rotate(-10 78 55)"/><ellipse cx="56" cy="60" rx="14" ry="6.5" transform="rotate(4 56 60)"/></g><g fill="#f0bd5e" opacity=".8"><circle cx="40" cy="50" r="2"/><circle cx="62" cy="46" r="2"/><circle cx="80" cy="53" r="2"/><circle cx="54" cy="58" r="2"/></g>',
    umum: '<ellipse cx="60" cy="74" rx="30" ry="5" fill="#e9dfd2"/><path d="M36 34l24-12 24 12v30l-24 12-24-12z" fill="{c}"/><path d="M36 34l24 12 24-12M60 46v30" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/><path d="M48 28l24 12" stroke="#fff" stroke-width="3" opacity=".4"/>'
  };
  function jenisIlus(p) {
    var s = (p.nama + ' ' + p.kategori).toLowerCase();
    var aturan = [
      [/matcha/, 'es', '#8fb35a', '#2f5d3a'], [/teh|lemon|es |jeruk|soda/, 'es', '#e7a83a', '#d4573b'],
      [/cokelat|coklat|susu panas/, 'mug', '#7a4a2b'], [/nasi/, 'nasi'], [/mie|bakso|soto/, 'mie', '#c0392b'],
      [/roti|toast|sandwich/, 'roti', '#6b3a1f'], [/kentang|fries/, 'kentang', '#d64933'], [/pisang|goreng/, 'pisang'],
      [/kopi|americano|cappuccino|latte|espresso|mocha/, 'kopi'], [/minum|non-kopi/, 'es', '#b97a4a', '#2f5d3a']
    ];
    for (var i = 0; i < aturan.length; i++) if (aturan[i][0].test(s)) return aturan[i];
    return [null, 'umum', '#9aa79d'];
  }
  function ilustrasi(p) {
    if (p.foto) return '<img class="ilus foto-produk" src="' + esc(p.foto) + '" alt="" loading="lazy" onerror="this.outerHTML=window.__ilusCadangan(\'' + p.id + '\')">';
    return ilustrasiSvg(p);
  }
  window.__ilusCadangan = function (id) { var p = D.produk.filter(function (x) { return x.id === id; })[0]; return p ? ilustrasiSvg(p) : ''; };
  // Logo: tampil di .merek bila gambar termuat; gagal dimuat -> inisial nama toko
  function pasangLogo() {
    if (!KONFIG.logo) return;
    $$('.merek .logo').forEach(function (svg) {
      if (svg.getAttribute('data-logo-siap')) return; svg.setAttribute('data-logo-siap', '1');
      var w = svg.getAttribute('width'), img = new Image(); img.className = 'logo logo-img'; img.alt = ''; img.width = w; img.height = w;
      img.onload = function () { svg.style.display = 'none'; svg.parentNode.insertBefore(img, svg); };
      img.onerror = function () { var sp = document.createElement('span'); sp.className = 'logo logo-inisial'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = inisial((D && D.toko.nama) || NAMA_TEMA); sp.style.width = sp.style.height = w + 'px'; svg.style.display = 'none'; svg.parentNode.insertBefore(sp, svg); };
      img.src = KONFIG.logo;
    });
  }
  function kecilkanFoto(file, cb) {
    var r = new FileReader();
    r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 400 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.8)); }; im.onerror = function () { toast('Berkas bukan gambar'); }; im.src = r.result; };
    r.readAsDataURL(file);
  }
  function ilustrasiSvg(p) {
    var j = jenisIlus(p), es = /ice|es\b/i.test(p.varian.map(function (v) { return v.nama; }).join(' '));
    var bentuk = j[1] === 'kopi' && /americano/i.test(p.nama) && es ? 'es' : j[1];
    var svg = ILUS[bentuk].replace(/\{c\}/g, j[2] || (bentuk === 'es' ? '#6b4128' : '#7a4a2b')).replace(/\{s\}/g, j[3] || '#2f5d3a');
    return '<svg class="ilus" viewBox="0 0 120 90" aria-hidden="true">' + svg + '</svg>';
  }
  function nadaDari(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 4; }
  function inisial(s) { return s.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  var tTimer;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('tampil'); clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('tampil'); }, 2200); }
  function unduh(nama, isi, tipe) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([isi], { type: tipe }));
    a.download = nama; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvSel(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function parseCSV(teks) {
    var baris = [], sel = '', row = [], kutip = false;
    for (var i = 0; i < teks.length; i++) {
      var c = teks[i];
      if (kutip) {
        if (c === '"' && teks[i + 1] === '"') { sel += '"'; i++; }
        else if (c === '"') kutip = false; else sel += c;
      } else if (c === '"') kutip = true;
      else if (c === ',') { row.push(sel); sel = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && teks[i + 1] === '\n') i++; row.push(sel); baris.push(row); row = []; sel = ''; }
      else sel += c;
    }
    if (sel || row.length) { row.push(sel); baris.push(row); }
    return baris.filter(function (r) { return r.join('').trim(); });
  }

  // ---------- Sesi kasir ----------
  var pengguna = null, pinBuffer = '', kasirDipilih = null;
  function isAdmin() { return pengguna && pengguna.peran === 'admin'; }

  function tampilMasuk() {
    $('#aplikasi').hidden = true; $('#layarMasuk').hidden = false;
    $('#masukToko').textContent = D.toko.nama;
    var mi = $('#masukIlus'); if (mi) mi.innerHTML = D.produk.slice(0, 6).map(function (p, n) { return '<span class="thumb" data-nada="' + nadaDari(p.kategori + p.nama) + '" style="--i:' + n + '">' + ilustrasi(p) + '</span>'; }).join('');
    kasirDipilih = D.kasir[0]; pinBuffer = '';
    $('#daftarKasir').innerHTML = D.kasir.map(function (k) { return '<button data-id="' + k.id + '">' + esc(k.nama) + '</button>'; }).join('');
    $$('#daftarKasir button').forEach(function (b) {
      b.classList.toggle('aktif', b.dataset.id === kasirDipilih.id);
      b.onclick = function () { kasirDipilih = D.kasir.find(function (k) { return k.id === b.dataset.id; }); pinBuffer = ''; tampilMasuk.titik(); $$('#daftarKasir button').forEach(function (x) { x.classList.toggle('aktif', x === b); }); };
    });
    tampilMasuk.titik();
  }
  tampilMasuk.titik = function () { $$('#pinTitik i').forEach(function (i, n) { i.classList.toggle('isi', n < pinBuffer.length); }); };
  function ketikPin(k) {
    if (k === 'hapus') pinBuffer = pinBuffer.slice(0, -1);
    else if (pinBuffer.length < 4) pinBuffer += k;
    tampilMasuk.titik();
    if (pinBuffer.length === 4) {
      if (kasirDipilih && kasirDipilih.pin === pinBuffer) { masuk(kasirDipilih); }
      else { var t = $('#pinTitik'); t.classList.add('salah'); setTimeout(function () { t.classList.remove('salah'); pinBuffer = ''; tampilMasuk.titik(); }, 350); }
    }
  }
  function masuk(k) {
    pengguna = k; try { sessionStorage.setItem('kasir-sesi', k.id); } catch (e) {}
    $('#layarMasuk').hidden = true; $('#aplikasi').hidden = false;
    $('#namaKasir').textContent = k.nama + (k.peran === 'admin' ? ' · admin' : '');
    $('#namaTokoNav').textContent = D.toko.nama;
    $$('[data-hal="produk"],[data-hal="atur"]').forEach(function (b) { b.hidden = !isAdmin(); });
    var tg = $('#tglHariIni'); if (tg) tg.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var av = $('#avatarKasir'); if (av) av.textContent = inisial(k.nama);
    buka('kasir');
  }

  // ---------- Navigasi ----------
  function buka(hal) {
    $$('.hal').forEach(function (s) { s.classList.toggle('aktif', s.id === 'hal-' + hal); });
    try { $('main').scrollTop = 0; } catch (e) {}
    $$('.nav').forEach(function (b) { b.classList.toggle('aktif', b.dataset.hal === hal); });
    ({ kasir: renderPOS, produk: renderKelola, riwayat: renderRiwayat, laporan: renderLaporan, atur: renderAtur })[hal]();
  }

  // ---------- POS ----------
  var keranjang = [], katAktif = 'Semua';
  function stokTerpakai(pid) { return keranjang.filter(function (i) { return i.pid === pid; }).reduce(function (s, i) { return s + i.qty; }, 0); }

  function renderPOS() {
    var kats = ['Semua'].concat(D.kategori);
    $('#chipKategori').innerHTML = kats.map(function (k) { var n = k === 'Semua' ? D.produk.length : D.produk.filter(function (p) { return p.kategori === k; }).length;
      return '<button class="chip' + (k === katAktif ? ' aktif' : '') + '" data-k="' + esc(k) + '" aria-pressed="' + (k === katAktif) + '">' + esc(k) + '<span class="chip-n">' + n + '</span></button>'; }).join('');
    var q = $('#cariProduk').value.trim().toLowerCase();
    var list = D.produk.filter(function (p) { return (katAktif === 'Semua' || p.kategori === katAktif) && p.nama.toLowerCase().indexOf(q) > -1; });
    $('#gridProduk').innerHTML = list.length ? list.map(function (p, n) {
      var sisa = p.stok - stokTerpakai(p.id), diKer = stokTerpakai(p.id);
      var min = Math.min.apply(null, p.varian.map(function (v) { return v.harga; }));
      return '<button class="kartu-produk' + (diKer ? ' dipilih' : '') + '" data-id="' + p.id + '" style="--i:' + Math.min(n, 14) + '"' + (sisa <= 0 ? ' disabled' : '') + ' aria-label="' + esc(p.nama) + ', ' + (p.varian.length > 1 ? 'mulai ' : '') + rp(min) + (sisa <= 0 ? ', stok habis' : '') + '">' +
        '<div class="thumb" data-nada="' + nadaDari(p.kategori + p.nama) + '">' + ilustrasi(p) + (diKer ? '<span class="di-ker">' + diKer + '</span>' : '') + (sisa <= 0 ? '<span class="habis">Habis</span>' : '') + '</div>' +
        '<span class="kp-teks"><b>' + esc(p.nama) + '</b><span class="stok' + (sisa <= 5 ? ' tipis' : '') + '">' + (sisa <= 0 ? 'Stok habis' : (sisa <= 5 ? 'Sisa ' : 'Stok ') + sisa) + (p.varian.length > 1 ? ' · ' + p.varian.length + ' varian' : '') + '</span></span>' +
        '<span class="kp-bawah"><span class="harga">' + (p.varian.length > 1 ? '<small>mulai</small> ' : '') + rp(min) + '</span><span class="tambah" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></span></button>';
    }).join('') : '<div class="kosong"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><b>Produk tidak ditemukan</b><span>Coba kata lain atau pilih kategori "Semua".</span></div>';
    renderKeranjang();
  }

  function tambahKeKeranjang(p, v) {
    if (p.stok - stokTerpakai(p.id) <= 0) return toast('Stok ' + p.nama + ' habis');
    var ada = keranjang.find(function (i) { return i.pid === p.id && i.varian === v.nama; });
    if (ada) ada.qty++; else keranjang.push({ pid: p.id, nama: p.nama, varian: v.nama, harga: v.harga, qty: 1 });
    renderPOS();
    var c = $('.kartu-produk[data-id="' + p.id + '"]'); if (c) { c.style.animation = 'none'; c.classList.add('bump'); }
    ['#kerJumlah', '#fabKeranjang'].forEach(function (q) { var e = $(q); if (e) { e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); } });
  }

  function hitung() {
    var sub = keranjang.reduce(function (s, i) { return s + i.harga * i.qty; }, 0);
    var nilai = Math.max(0, parseFloat($('#inDiskon').value) || 0);
    var dis = $('#tipeDiskon').value === 'persen' ? Math.round(sub * Math.min(nilai, 100) / 100) : Math.min(nilai, sub);
    return { subtotal: sub, diskon: dis, total: sub - dis };
  }

  function renderKeranjang() {
    var h = hitung(), jml = keranjang.reduce(function (s, i) { return s + i.qty; }, 0);
    $('#kerDaftar').innerHTML = keranjang.length ? keranjang.map(function (i, n) {
      var p = D.produk.find(function (x) { return x.id === i.pid; }) || { nama: i.nama, kategori: '', varian: [] };
      return '<li><span class="ker-thumb thumb" data-nada="' + nadaDari(p.kategori + p.nama) + '">' + ilustrasi(p) + '</span><span class="ker-info"><span class="nm">' + esc(i.nama) + '</span><span class="vr">' + esc(i.varian) + ' · ' + rp(i.harga) + '</span></span><span class="jml"><b>' + rp(i.harga * i.qty) + '</b><span class="qty"><button data-n="' + n + '" data-d="-1" aria-label="Kurangi ' + esc(i.nama) + '"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button><span aria-live="polite">' + i.qty + '</span><button data-n="' + n + '" data-d="1" aria-label="Tambah ' + esc(i.nama) + '"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg></button></span></span></li>';
    }).join('') : '<li class="ker-kosong"><svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="10" width="36" height="46" rx="6"/><path d="M22 22h20M22 30h20M22 38h12"/></svg><b>Belum ada pesanan</b><span>Ketuk menu di kiri untuk menambah.</span></li>';
    $('#kerNomor').textContent = '#' + String((D.nomor || 0) + 1).padStart(4, '0');
    $('#kerJumlah').textContent = jml + ' item';
    $('#kSubtotal').textContent = rp(h.subtotal);
    $('#kTotal').textContent = rp(h.total);
    $('#btnBayar').disabled = !keranjang.length;
    $('#fabJumlah').textContent = jml; $('#fabTotal').textContent = rp(h.total);
    var kd = $('#kDiskonBaris'); if (kd) kd.classList.toggle('ada', h.diskon > 0);
  }

  function dialog(html, siap) {
    var d = $('#dlg'); $('#dlgIsi').innerHTML = html;
    if (!d.open) d.showModal();
    if (siap) siap($('#dlgIsi'));
    return d;
  }
  function tutupDialog() { var d = $('#dlg'); if (d.open) d.close(); }

  function pilihVarian(p) {
    if (p.varian.length === 1) return tambahKeKeranjang(p, p.varian[0]);
    dialog('<h3>' + esc(p.nama) + '</h3><div class="pilih-varian">' + p.varian.map(function (v, i) {
      return '<button type="button" data-i="' + i + '"><span>' + esc(v.nama) + '</span><span>' + rp(v.harga) + '</span></button>';
    }).join('') + '</div><div class="dlg-aksi"><button class="tombol" value="batal">Batal</button></div>', function (f) {
      $$('[data-i]', f).forEach(function (b) { b.onclick = function () { tambahKeKeranjang(p, p.varian[+b.dataset.i]); tutupDialog(); }; });
    });
  }

  function dialogBayar() {
    var h = hitung();
    var cepat = [h.total, Math.ceil(h.total / 5000) * 5000, Math.ceil(h.total / 10000) * 10000, Math.ceil(h.total / 50000) * 50000, 100000]
      .filter(function (v, i, a) { return v >= h.total && a.indexOf(v) === i; }).slice(0, 4);
    var IK = { tunai: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/></svg>', qris: '<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/></svg>', transfer: '<svg viewBox="0 0 24 24"><path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18"/></svg>' };
    var pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'hapus'];
    dialog('<div class="bayar"><div class="bayar-kiri"><div class="bayar-kepala"><h3>Pembayaran</h3><span class="redup kecil">' + keranjang.reduce(function (s, i) { return s + i.qty; }, 0) + ' item' + (h.diskon ? ' · diskon ' + rp(h.diskon) : '') + '</span></div>' +
      '<div class="total-besar"><small>Total tagihan</small>' + rp(h.total) + '</div>' +
      '<div class="metode" role="radiogroup" aria-label="Metode bayar">' + ['tunai', 'qris', 'transfer'].map(function (m, i) { return '<label><input type="radio" name="metode" value="' + m + '"' + (i ? '' : ' checked') + '>' + IK[m] + '<span>' + { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer' }[m] + '</span></label>'; }).join('') + '</div>' +
      '<div id="areaQris" class="qris" hidden><img src="qris.svg" alt="QRIS toko"><p class="redup kecil">Minta pelanggan memindai, cek notifikasi masuk, lalu selesaikan.</p></div>' +
      '<div id="areaTransfer" hidden class="rek"><small class="redup">Rekening tujuan</small><b>' + esc(D.toko.rekening || 'Atur nomor rekening di Pengaturan') + '</b><p class="redup kecil">Cek mutasi sebelum menyelesaikan.</p></div>' +
      '<div class="kembali" id="kembali"><span>Kembalian</span><span>Rp0</span></div></div>' +
      '<div class="bayar-kanan" id="areaTunai"><label class="layar-uang"><small>Uang diterima</small><span class="rp">Rp</span><input id="inBayar" type="number" inputmode="numeric" min="0" value="' + h.total + '"></label>' +
      '<div class="uang-cepat">' + cepat.map(function (v) { return '<button type="button" data-v="' + v + '">' + (v === h.total ? 'Uang pas' : rp(v)) + '</button>'; }).join('') + '</div>' +
      '<div class="numpad">' + pad.map(function (k) { return '<button type="button" data-np="' + k + '" aria-label="' + (k === 'hapus' ? 'Hapus angka' : k) + '">' + (k === 'hapus' ? '<svg viewBox="0 0 24 24"><path d="M9 5h11v14H9l-6-7z"/><path d="M13 9l5 6M18 9l-5 6"/></svg>' : k) + '</button>'; }).join('') + '</div></div>' +
      '<div class="dlg-aksi bayar-aksi"><button class="tombol" value="batal">Batal</button><button class="tombol utama besar" type="button" id="btnSelesai">Selesaikan pembayaran</button></div></div>', function (f) {
        var inB = $('#inBayar', f), baru = true;
        function upd() {
          var m = $('input[name=metode]:checked', f).value;
          $('#areaTunai', f).hidden = m !== 'tunai'; $('#areaQris', f).hidden = m !== 'qris'; $('#areaTransfer', f).hidden = m !== 'transfer';
          $('.bayar', f).classList.toggle('non-tunai', m !== 'tunai');
          var k = (parseFloat(inB.value) || 0) - h.total, el = $('#kembali', f);
          el.hidden = m !== 'tunai';
          el.classList.toggle('kurang', k < 0);
          el.innerHTML = '<span>' + (k < 0 ? 'Kurang' : 'Kembalian') + '</span><b>' + rp(Math.abs(k)) + '</b>';
        }
        $$('input[name=metode]', f).forEach(function (r) { r.onchange = upd; });
        inB.oninput = function () { baru = false; upd(); };
        $$('[data-v]', f).forEach(function (b) { b.onclick = function () { inB.value = b.dataset.v; baru = true; upd(); }; });
        $('.numpad', f).onclick = function (e) {
          var b = e.target.closest('[data-np]'); if (!b) return;
          var v = baru ? '' : String(inB.value || ''); baru = false;
          if (b.dataset.np === 'hapus') v = v.slice(0, -1); else if (v.length < 10) v = (v + b.dataset.np).replace(/^0+(?=\d)/, '');
          inB.value = v || 0; upd();
        };
        $('#btnSelesai', f).onclick = function () {
          var m = $('input[name=metode]:checked', f).value;
          var bayar = m === 'tunai' ? (parseFloat(inB.value) || 0) : h.total;
          if (bayar < h.total) { var k = $('#kembali', f); k.classList.remove('goyang'); void k.offsetWidth; k.classList.add('goyang'); return toast('Uang diterima masih kurang'); }
          selesaikan(m, bayar);
        };
        upd();
      });
  }

  function selesaikan(metode, bayar) {
    var h = hitung(), w = new Date();
    D.nomor = (D.nomor || 0) + 1;
    var trx = { id: noTrx(w, D.nomor), waktu: w.toISOString(), kasir: pengguna.nama, items: keranjang.map(function (i) { return Object.assign({}, i); }), subtotal: h.subtotal, diskon: h.diskon, total: h.total, metode: metode, bayar: bayar, kembali: bayar - h.total };
    trx.items.forEach(function (i) { var p = D.produk.find(function (x) { return x.id === i.pid; }); if (p) p.stok = Math.max(0, p.stok - i.qty); });
    D.transaksi.push(trx); simpan();
    keranjang = []; $('#inDiskon').value = 0; $('#panelKeranjang').classList.remove('buka');
    dialog('<div class="sukses"><svg class="centang" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg><h3>Transaksi berhasil</h3><div class="total-besar"><small>' + { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer' }[metode] + '</small>' + rp(trx.total) + '</div></div>' +
      (metode === 'tunai' ? '<div class="kembali"><span>Kembalian</span><span>' + rp(trx.kembali) + '</span></div>' : '') +
      '<p class="redup kecil" style="text-align:center;margin:0">' + trx.id + '</p>' +
      '<div class="dlg-aksi"><button class="tombol" type="button" id="btnCetak">Cetak struk</button><button class="tombol utama" value="ok">Transaksi baru</button></div>', function (f) {
        $('#btnCetak', f).onclick = function () { cetak(trx); };
      });
    renderPOS();
  }

  // ---------- Struk 58mm ----------
  function cetak(trx) {
    var t = D.toko;
    $('#struk').innerHTML = '<div class="tengah">' + (KONFIG.logo ? '<img class="struk-logo" src="' + esc(KONFIG.logo) + '" alt="" onerror="this.style.display=\'none\'">' : '') + '<h4>' + esc(t.nama) + '</h4>' + (t.alamat ? '<div>' + esc(t.alamat) + '</div>' : '') + (t.telp ? '<div>' + esc(t.telp) + '</div>' : '') + '</div>' +
      '<div class="gr"></div><div>' + trx.id + '</div><div>' + fmtWaktu(trx.waktu) + '</div><div>Kasir: ' + esc(trx.kasir) + '</div><div class="gr"></div>' +
      trx.items.map(function (i) { return '<div>' + esc(i.nama) + (i.varian ? ' (' + esc(i.varian) + ')' : '') + '</div><div class="br"><span>' + i.qty + ' x ' + rp(i.harga) + '</span><span>' + rp(i.qty * i.harga) + '</span></div>'; }).join('') +
      '<div class="gr"></div><div class="br"><span>Subtotal</span><span>' + rp(trx.subtotal) + '</span></div>' +
      (trx.diskon ? '<div class="br"><span>Diskon</span><span>-' + rp(trx.diskon) + '</span></div>' : '') +
      '<div class="br"><b>TOTAL</b><b>' + rp(trx.total) + '</b></div>' +
      '<div class="br"><span>' + trx.metode.toUpperCase() + '</span><span>' + rp(trx.bayar) + '</span></div>' +
      (trx.metode === 'tunai' ? '<div class="br"><span>Kembali</span><span>' + rp(trx.kembali) + '</span></div>' : '') +
      '<div class="gr"></div><div class="tengah">' + esc(t.footer) + '</div>';
    window.print();
  }

  // ---------- Kelola produk ----------
  function renderKelola() {
    var q = $('#cariKelola').value.trim().toLowerCase();
    var list = D.produk.filter(function (p) { return p.nama.toLowerCase().indexOf(q) > -1; });
    $('#tabelProduk').innerHTML = '<thead><tr><th>Produk</th><th>Kategori</th><th>Varian &amp; harga</th><th>Stok</th><th></th></tr></thead><tbody>' +
      (list.map(function (p) {
        return '<tr><td><b>' + esc(p.nama) + '</b></td><td>' + esc(p.kategori) + '</td><td>' + p.varian.map(function (v) { return esc(v.nama) + ' ' + rp(v.harga); }).join('<br>') + '</td>' +
          '<td><span class="lencana' + (p.stok <= 5 ? ' merah' : '') + '">' + p.stok + '</span></td>' +
          '<td style="text-align:right;white-space:nowrap"><button class="tautan" data-stok="' + p.id + '">+Stok</button> <button class="tautan" data-edit="' + p.id + '">Ubah</button></td></tr>';
      }).join('') || '<tr><td colspan="5" class="kosong">Belum ada produk.</td></tr>') + '</tbody>';
  }

  function formProduk(p) {
    var baru = !p; p = p || { nama: '', kategori: D.kategori[0] || '', stok: 0, varian: [{ nama: 'Reguler', harga: 0 }] };
    function barisV(v) { return '<div class="varian-baris"><input placeholder="Nama varian" value="' + esc(v.nama) + '" required><input type="number" min="0" placeholder="Harga" value="' + v.harga + '" required><button type="button" aria-label="Hapus varian">×</button></div>'; }
    dialog('<h3>' + (baru ? 'Tambah' : 'Ubah') + ' produk</h3><div class="form">' +
      '<label>Nama<input id="fNama" required value="' + esc(p.nama) + '"></label>' +
      '<label>Kategori<select id="fKat">' + D.kategori.map(function (k) { return '<option' + (k === p.kategori ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select></label>' +
      '<label>Stok<input id="fStok" type="number" min="0" value="' + p.stok + '"></label>' +
      '<div class="foto-baris"><span class="thumb foto-pratinjau" id="fFotoPra" data-nada="' + nadaDari(p.kategori + p.nama) + '">' + (p.foto ? '<img class="ilus foto-produk" src="' + esc(p.foto) + '" alt="">' : '') + '</span><label>Foto produk (opsional)<input id="fFoto" type="file" accept="image/*"></label><button type="button" class="tautan" id="fFotoHapus">Hapus foto</button></div>' +
      '<div><b class="kecil">Varian &amp; harga</b><div id="fVarian" class="form" style="margin-top:6px">' + p.varian.map(barisV).join('') + '</div>' +
      '<button type="button" class="tautan" id="fTambahV">+ varian</button></div></div>' +
      '<div class="dlg-aksi">' + (baru ? '' : '<button type="button" class="tombol bahaya" id="fHapus" style="margin-right:auto">Hapus</button>') +
      '<button class="tombol" value="batal" formnovalidate>Batal</button><button class="tombol utama" type="button" id="fSimpan">Simpan</button></div>', function (f) {
        function ikatHapus() { $$('.varian-baris button', f).forEach(function (b) { b.onclick = function () { if ($$('.varian-baris', f).length > 1) b.parentNode.remove(); }; }); }
        ikatHapus();
        var fotoBaru = p.foto || '';
        $('#fFoto', f).onchange = function () { var fl = this.files[0]; if (fl) kecilkanFoto(fl, function (u) { fotoBaru = u; $('#fFotoPra', f).innerHTML = '<img class="ilus foto-produk" src="' + u + '" alt="">'; }); };
        $('#fFotoHapus', f).onclick = function () { fotoBaru = ''; $('#fFoto', f).value = ''; $('#fFotoPra', f).innerHTML = ''; };
        $('#fTambahV', f).onclick = function () { $('#fVarian', f).insertAdjacentHTML('beforeend', barisV({ nama: '', harga: 0 })); ikatHapus(); };
        if (!baru) $('#fHapus', f).onclick = function () { if (confirm('Hapus ' + p.nama + '?')) { D.produk = D.produk.filter(function (x) { return x.id !== p.id; }); simpan(); tutupDialog(); renderKelola(); } };
        $('#fSimpan', f).onclick = function () {
          var nama = $('#fNama', f).value.trim();
          var varian = $$('.varian-baris', f).map(function (r) { var i = $$('input', r); return { nama: i[0].value.trim() || 'Reguler', harga: Math.max(0, +i[1].value || 0) }; });
          if (!nama) return toast('Nama produk wajib diisi');
          if (!D.kategori.length) return toast('Buat kategori dulu');
          var data = { nama: nama, kategori: $('#fKat', f).value, stok: Math.max(0, parseInt($('#fStok', f).value, 10) || 0), foto: fotoBaru, varian: varian };
          if (baru) D.produk.push(Object.assign({ id: uid() }, data)); else Object.assign(p, data);
          simpan(); tutupDialog(); renderKelola(); toast('Produk disimpan');
        };
      });
  }

  function formKategori() {
    function isi() {
      return '<h3>Kategori</h3><ul class="daftar-kasir">' + D.kategori.map(function (k, i) {
        var n = D.produk.filter(function (p) { return p.kategori === k; }).length;
        return '<li><span>' + esc(k) + ' <span class="redup kecil">(' + n + ' produk)</span></span><button type="button" class="tautan" data-h="' + i + '"' + (n ? ' disabled title="Masih dipakai"' : '') + '>Hapus</button></li>';
      }).join('') + '</ul><div class="form sebaris" style="grid-template-columns:1fr auto"><input id="kBaru" placeholder="Kategori baru"><button type="button" class="tombol" id="kTambah">Tambah</button></div><div class="dlg-aksi"><button class="tombol utama" value="ok">Selesai</button></div>';
    }
    function ikat(f) {
      $('#kTambah', f).onclick = function () { var v = $('#kBaru', f).value.trim(); if (v && D.kategori.indexOf(v) < 0) { D.kategori.push(v); simpan(); dialog(isi(), ikat); } };
      $$('[data-h]', f).forEach(function (b) { b.onclick = function () { D.kategori.splice(+b.dataset.h, 1); simpan(); dialog(isi(), ikat); }; });
    }
    dialog(isi(), ikat);
  }

  // ---------- Riwayat ----------
  function trxFilter() {
    var t = $('#filterTanggal').value;
    return D.transaksi.filter(function (x) { return !t || tglKey(new Date(x.waktu)) === t; }).slice().reverse();
  }
  function renderRiwayat() {
    var list = trxFilter();
    $('#daftarTrx').innerHTML = list.length ? list.slice(0, 200).map(function (x) {
      return '<div class="trx"><div><b>' + x.id + '</b><div class="meta">' + fmtWaktu(x.waktu) + ' · ' + esc(x.kasir) + ' · ' + x.metode.toUpperCase() + ' · ' + x.items.reduce(function (s, i) { return s + i.qty; }, 0) + ' item</div>' +
        '<div class="meta">' + x.items.map(function (i) { return esc(i.nama) + ' ×' + i.qty; }).join(', ') + '</div></div><div class="tot">' + rp(x.total) + '</div>' +
        '<div class="aksi"><button class="tombol" data-cetak="' + x.id + '">Cetak</button>' + (isAdmin() ? '<button class="tombol bahaya" data-hapus="' + x.id + '">Batalkan</button>' : '') + '</div></div>';
    }).join('') : '<p class="kosong">Belum ada transaksi.</p>';
  }

  function eksporTrx() {
    var rows = [['id', 'waktu', 'kasir', 'produk', 'varian', 'qty', 'harga', 'subtotal_item', 'diskon_trx', 'total_trx', 'metode']];
    trxFilter().reverse().forEach(function (x) { x.items.forEach(function (i) { rows.push([x.id, x.waktu, x.kasir, i.nama, i.varian, i.qty, i.harga, i.qty * i.harga, x.diskon, x.total, x.metode]); }); });
    unduh('transaksi-' + ($('#filterTanggal').value || 'semua') + '.csv', '﻿' + rows.map(function (r) { return r.map(csvSel).join(','); }).join('\n'), 'text/csv');
  }

  // ---------- Laporan ----------
  var modeLap = 'hari';
  function ringkasan(list) {
    var omzet = 0, item = 0, perProduk = {}, metode = { tunai: 0, qris: 0, transfer: 0 };
    list.forEach(function (x) {
      omzet += x.total; metode[x.metode] = (metode[x.metode] || 0) + x.total;
      x.items.forEach(function (i) { item += i.qty; var k = i.nama; perProduk[k] = perProduk[k] || { nama: k, qty: 0, nilai: 0 }; perProduk[k].qty += i.qty; perProduk[k].nilai += i.qty * i.harga; });
    });
    var top = Object.keys(perProduk).map(function (k) { return perProduk[k]; }).sort(function (a, b) { return b.qty - a.qty || b.nilai - a.nilai; });
    return { omzet: omzet, trx: list.length, item: item, rata: list.length ? omzet / list.length : 0, top: top, metode: metode };
  }
  function renderLaporan() {
    var inp = $('#tglLaporan'); if (!inp.value) inp.value = tglKey(new Date());
    var t = new Date(inp.value + 'T00:00:00');
    var list = D.transaksi.filter(function (x) { var d = new Date(x.waktu); return modeLap === 'hari' ? tglKey(d) === inp.value : d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth(); });
    var r = ringkasan(list);
    $('#kartuAngka').innerHTML = '<div class="angka sorot"><small>Omzet</small><b>' + rp(r.omzet) + '</b></div><div class="angka"><small>Transaksi</small><b>' + r.trx + '</b></div><div class="angka"><small>Item terjual</small><b>' + r.item + '</b></div><div class="angka"><small>Rata-rata/struk</small><b>' + rp(r.rata) + '</b></div>';
    var batang = [];
    if (modeLap === 'hari') {
      $('#judulGrafik').textContent = 'Penjualan per jam';
      for (var j = 7; j <= 22; j++) batang.push({ l: j, v: 0 });
      list.forEach(function (x) { var h = new Date(x.waktu).getHours(); var b = batang.find(function (z) { return z.l === h; }); if (b) b.v += x.total; });
    } else {
      $('#judulGrafik').textContent = 'Penjualan per tanggal';
      var hari = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= hari; d++) batang.push({ l: d, v: 0 });
      list.forEach(function (x) { batang[new Date(x.waktu).getDate() - 1].v += x.total; });
    }
    var maks = Math.max.apply(null, batang.map(function (b) { return b.v; }).concat([1]));
    $('#grafik').innerHTML = batang.map(function (b, i) {
      var lbl = modeLap === 'bulan' && i % 5 !== 0 && b.l !== batang.length ? '&nbsp;' : b.l;
      return '<div class="kol" title="' + b.l + ': ' + rp(b.v) + '"><div class="batang' + (b.v ? '' : ' nol') + '" style="height:' + (b.v / maks * 100) + '%"></div><small>' + lbl + '</small></div>';
    }).join('');
    $('#terlaris').innerHTML = r.top.slice(0, 7).map(function (p) { return '<li><span>' + esc(p.nama) + '</span><b>' + p.qty + '×</b></li>'; }).join('') || '<li style="display:block" class="redup">Belum ada penjualan.</li>';
    $('#metodeRingkas').innerHTML = ['tunai', 'qris', 'transfer'].map(function (m) { return '<div><small class="redup">' + m.toUpperCase() + '</small><b>' + rp(r.metode[m]) + '</b></div>'; }).join('');
  }

  // ---------- Pengaturan ----------
  function renderAtur() {
    var f = $('#formToko');
    ['nama', 'alamat', 'telp', 'footer', 'rekening'].forEach(function (k) { f.elements[k].value = D.toko[k] || ''; });
    $('#daftarKasirAtur').innerHTML = D.kasir.map(function (k) {
      return '<li><span><b>' + esc(k.nama) + '</b> <span class="lencana">' + k.peran + '</span></span>' + (k.id === pengguna.id ? '<span class="redup kecil">sedang masuk</span>' : '<button class="tautan" data-hk="' + k.id + '">Hapus</button>') + '</li>';
    }).join('');
  }

  function eksporProdukCSV() {
    var rows = [['nama', 'kategori', 'stok', 'varian']].concat(D.produk.map(function (p) { return [p.nama, p.kategori, p.stok, p.varian.map(function (v) { return v.nama + ':' + v.harga; }).join('|')]; }));
    unduh('produk.csv', '﻿' + rows.map(function (r) { return r.map(csvSel).join(','); }).join('\n'), 'text/csv');
  }
  function imporProdukCSV(teks) {
    var rows = parseCSV(teks.replace(/^﻿/, ''));
    if (rows.length && /nama/i.test(rows[0][0])) rows.shift();
    var n = 0;
    rows.forEach(function (r) {
      var nama = (r[0] || '').trim(); if (!nama) return;
      var kat = (r[1] || 'Umum').trim();
      if (D.kategori.indexOf(kat) < 0) D.kategori.push(kat);
      var varian = (r[3] || 'Reguler:0').split('|').map(function (s) { var a = s.split(':'); return { nama: (a[0] || 'Reguler').trim(), harga: Math.max(0, parseInt(a[1], 10) || 0) }; });
      var ada = D.produk.find(function (p) { return p.nama.toLowerCase() === nama.toLowerCase(); });
      var data = { nama: nama, kategori: kat, stok: Math.max(0, parseInt(r[2], 10) || 0), varian: varian };
      if (ada) Object.assign(ada, data); else D.produk.push(Object.assign({ id: uid() }, data));
      n++;
    });
    simpan(); return n;
  }
  function bacaFile(input, cb) {
    var file = input.files[0]; if (!file) return;
    var r = new FileReader(); r.onload = function () { cb(String(r.result)); input.value = ''; }; r.readAsText(file);
  }

  // ---------- Event ----------
  function ikatEvent() {
    var pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'hapus'];
    $('#padPin').innerHTML = pad.map(function (k) { return k ? '<button data-k="' + k + '" aria-label="' + (k === 'hapus' ? 'Hapus' : k) + '">' + (k === 'hapus' ? '<svg viewBox="0 0 24 24"><path d="M9 5h11v14H9l-6-7z"/><path d="M13 9l5 6M18 9l-5 6"/></svg>' : k) + '</button>' : '<span></span>'; }).join('');
    $('#padPin').onclick = function (e) { var b = e.target.closest('[data-k]'); if (b) ketikPin(b.dataset.k); };
    document.addEventListener('keydown', function (e) { if (!$('#layarMasuk').hidden) { if (/^\d$/.test(e.key)) ketikPin(e.key); if (e.key === 'Backspace') ketikPin('hapus'); } });

    $('#navBawah').innerHTML = $$('.samping .nav').map(function (b) { return b.outerHTML; }).join('');
    document.addEventListener('click', function (e) { var n = e.target.closest('.nav'); if (n) buka(n.dataset.hal); });
    $('#btnKeluar').onclick = function () { pengguna = null; keranjang = []; try { sessionStorage.removeItem('kasir-sesi'); } catch (er) {} tampilMasuk(); };

    $('#cariProduk').oninput = renderPOS;
    $('#chipKategori').onclick = function (e) { var c = e.target.closest('.chip'); if (c) { katAktif = c.dataset.k; renderPOS(); } };
    $('#gridProduk').onclick = function (e) { var k = e.target.closest('.kartu-produk'); if (k) pilihVarian(D.produk.find(function (p) { return p.id === k.dataset.id; })); };
    $('#kerDaftar').onclick = function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      var it = keranjang[+b.dataset.n], d = +b.dataset.d;
      if (d > 0) { var p = D.produk.find(function (x) { return x.id === it.pid; }); if (p && p.stok - stokTerpakai(p.id) <= 0) return toast('Stok tidak cukup'); }
      it.qty += d; if (it.qty <= 0) keranjang.splice(+b.dataset.n, 1);
      renderPOS();
    };
    $('#inDiskon').oninput = renderKeranjang; $('#tipeDiskon').onchange = renderKeranjang;
    $('#btnKosongkan').onclick = function () { keranjang = []; renderPOS(); };
    $('#btnBayar').onclick = dialogBayar;
    $('#fabKeranjang').onclick = function () { $('#panelKeranjang').classList.toggle('buka'); };
    document.addEventListener('click', function (e) {
      var pk = $('#panelKeranjang');
      if (pk.classList.contains('buka') && !pk.contains(e.target) && !e.target.closest('#fabKeranjang') && !e.target.closest('dialog')) pk.classList.remove('buka');
    });

    $('#cariKelola').oninput = renderKelola;
    $('#btnTambahProduk').onclick = function () { formProduk(null); };
    $('#btnKategori').onclick = formKategori;
    $('#tabelProduk').onclick = function (e) {
      var ed = e.target.closest('[data-edit]'), st = e.target.closest('[data-stok]');
      if (ed) formProduk(D.produk.find(function (p) { return p.id === ed.dataset.edit; }));
      if (st) { var p = D.produk.find(function (x) { return x.id === st.dataset.stok; }); var n = parseInt(prompt('Tambah stok ' + p.nama + ' sebanyak:', '10'), 10); if (n) { p.stok = Math.max(0, p.stok + n); simpan(); renderKelola(); toast('Stok jadi ' + p.stok); } }
    };

    $('#filterTanggal').onchange = renderRiwayat;
    $('#btnEksporTrx').onclick = eksporTrx;
    $('#daftarTrx').onclick = function (e) {
      var c = e.target.closest('[data-cetak]'), h = e.target.closest('[data-hapus]');
      if (c) cetak(D.transaksi.find(function (x) { return x.id === c.dataset.cetak; }));
      if (h && confirm('Batalkan transaksi ini? Stok akan dikembalikan.')) {
        var x = D.transaksi.find(function (t) { return t.id === h.dataset.hapus; });
        x.items.forEach(function (i) { var p = D.produk.find(function (q) { return q.id === i.pid; }); if (p) p.stok += i.qty; });
        D.transaksi = D.transaksi.filter(function (t) { return t !== x; }); simpan(); renderRiwayat(); toast('Transaksi dibatalkan');
      }
    };

    $('#segLaporan').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; modeLap = b.dataset.mode; $$('#segLaporan button').forEach(function (x) { x.classList.toggle('aktif', x === b); }); renderLaporan(); };
    $('#tglLaporan').onchange = renderLaporan;

    $('#formToko').onsubmit = function (e) {
      e.preventDefault(); var f = e.target;
      var namaLama = D.toko.nama;
      ['nama', 'alamat', 'telp', 'footer', 'rekening'].forEach(function (k) { D.toko[k] = f.elements[k].value.trim(); });
      if (D.toko.nama !== namaLama) D.toko.namaDariTema = false;
      simpan(); $('#namaTokoNav').textContent = D.toko.nama; toast('Profil toko disimpan');
    };
    $('#formKasir').onsubmit = function (e) {
      e.preventDefault(); var f = e.target;
      D.kasir.push({ id: uid(), nama: f.elements.nama.value.trim(), pin: f.elements.pin.value, peran: f.elements.peran.value });
      simpan(); f.reset(); renderAtur(); toast('Kasir ditambahkan');
    };
    $('#daftarKasirAtur').onclick = function (e) { var b = e.target.closest('[data-hk]'); if (b && confirm('Hapus kasir ini?')) { D.kasir = D.kasir.filter(function (k) { return k.id !== b.dataset.hk; }); simpan(); renderAtur(); } };
    $('#btnBackup').onclick = function () { unduh('backup-kasir-' + tglKey(new Date()) + '.json', JSON.stringify(D, null, 1), 'application/json'); };
    $('#fileBackup').onchange = function () {
      bacaFile(this, function (t) {
        try { var x = JSON.parse(t); if (!x.produk || !x.kasir) throw 0; if (confirm('Timpa semua data dengan backup ini?')) { D = x; simpan(); toast('Backup dipulihkan'); tampilMasuk(); } }
        catch (er) { toast('File backup tidak valid'); }
      });
    };
    $('#btnEksporProduk').onclick = eksporProdukCSV;
    $('#fileCsv').onchange = function () { bacaFile(this, function (t) { toast(imporProdukCSV(t) + ' produk diimpor'); }); };
    $('#btnContoh').onclick = function () { if (confirm('Ganti data dengan data contoh?')) { D = dataContoh(); simpan(); tampilMasuk(); } };
    $('#btnReset').onclick = function () { if (confirm('Yakin hapus SEMUA data? Backup dulu ya.')) { D = dataKosong(); simpan(); toast('Data dikosongkan. PIN admin: 1234'); tampilMasuk(); } };
  }

  // ---------- Mulai ----------
  muat(); ikatEvent(); pasangLogo();
  var sesi = null; try { sesi = sessionStorage.getItem('kasir-sesi'); } catch (e) {}
  var k = sesi && D.kasir.find(function (x) { return x.id === sesi; });
  if (k) masuk(k); else if (/[?&]demo\b/.test(location.search)) { masuk(D.kasir[0]); [0, 0, 3, 8].forEach(function (i, n) { var p = D.produk[i]; if (p) tambahKeKeranjang(p, p.varian[n % p.varian.length]); }); } else tampilMasuk();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () {});

  // untuk pengujian
  window.__kasir = { hitung: hitung, ringkasan: ringkasan, parseCSV: parseCSV, imporProdukCSV: imporProdukCSV, data: function () { return D; }, tema: terapkanTema, keranjang: function () { return keranjang; }, tambah: tambahKeKeranjang, selesaikan: selesaikan };
})();
