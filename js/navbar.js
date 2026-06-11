// Common Navigation Bar Component
const NAVBAR_HTML = `
<nav class="navbar navbar-expand-lg navbar-mathfun sticky-top">
  <div class="container">
    <a class="navbar-brand" href="/">
      🧮 MathFun Indonesia
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="/" data-page="home">🏠 Beranda</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">📚 Belajar</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/materi/penjumlahan">➕ Penjumlahan</a></li>
            <li><a class="dropdown-item" href="/materi/pengurangan">➖ Pengurangan</a></li>
            <li><a class="dropdown-item" href="/materi/penjumlahan-bersusun">📐 Penjumlahan Bersusun</a></li>
            <li><a class="dropdown-item" href="/materi/pengurangan-bersusun">📐 Pengurangan Bersusun</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="/materi/jarimatika">✋ Jarimatika</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/latihan" data-page="latihan">📝 Latihan</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">🎮 Game</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/game">🎮 Semua Game</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="/game/balon">🎈 Tangkap Balon</a></li>
            <li><a class="dropdown-item" href="/game/memory">🃏 Memory Card</a></li>
            <li><a class="dropdown-item" href="/game/puzzle">🧩 Puzzle Angka</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/dashboard" data-page="dashboard">📊 Dashboard</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
`;

// Initialize common navigation
function initCommonNavbar() {
  // Insert navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    navbarPlaceholder.innerHTML = NAVBAR_HTML;
  }
  
  // Set active link based on current path
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link[data-page], .nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || currentPath.endsWith(href) || currentPath.includes(href.slice(1, -1))) {
      link.classList.add('active');
    }
  });
}

// Common footer HTML
const FOOTER_HTML = `
<footer class="footer-mathfun">
  <div class="container">
    <h5>🧮 MathFun Indonesia</h5>
    <p>Belajar matematika menjadi menyenangkan!</p>
    <div class="footer-links">
      <a href="/">Beranda</a> | 
      <a href="/materi/penjumlahan">Penjumlahan</a> | 
      <a href="/materi/pengurangan">Pengurangan</a> | 
      <a href="/materi/jarimatika">Jarimatika</a> | 
      <a href="/latihan">Latihan</a> | 
      <a href="/game">Game</a> | 
      <a href="/dashboard">Dashboard</a>
    </div>
    <p class="mb-0">© 2024 MathFun Indonesia. Hak Cipta Dilindungi.</p>
  </div>
</footer>
`;

// Initialize common footer
function initCommonFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = FOOTER_HTML;
  }
}

// Export for use
window.MathFunNav = {
  init: function() {
    initCommonNavbar();
    initCommonFooter();
  },
  navbar: NAVBAR_HTML,
  footer: FOOTER_HTML
};
