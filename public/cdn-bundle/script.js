/**
 * SafeZone CDN Client Script
 * Configured with jsDelivr CDN prefix: https://cdn.jsdelivr.net
 * 
 * NOTE FOR GITHUB USERS:
 * When hosting games and assets in a GitHub repository via jsDelivr,
 * update CDN_PREFIX to your repository path:
 * const CDN_PREFIX = 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main';
 */

const CDN_PREFIX = 'https://cdn.jsdelivr.net';

let allGames = [];
let activeCategory = 'all';
let searchQuery = '';
let activeGame = null;
let favorites = JSON.parse(localStorage.getItem('safezone_favorites') || '[]');

/**
 * Resolves a game asset or embed URL using the CDN prefix
 */
function resolveCdnUrl(url) {
  if (!url) return '';
  // If already absolute URL, keep it or allow routing
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Ensure single slash separation
  const cleanPath = url.startsWith('/') ? url : '/' + url;
  return `${CDN_PREFIX}${cleanPath}`;
}

/**
 * Cloaked About:Blank window launcher to bypass school / network filters
 */
function openAboutBlank(targetUrl, title = 'Google Docs') {
  try {
    const win = window.open('about:blank', '_blank');
    if (!win) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const doc = win.document;
    doc.title = title;
    
    // Set favicon to Google Docs
    const icon = doc.createElement('link');
    icon.rel = 'icon';
    icon.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
    doc.head.appendChild(icon);

    doc.body.style.margin = '0';
    doc.body.style.height = '100vh';
    doc.body.style.backgroundColor = '#000';
    doc.body.style.overflow = 'hidden';

    const iframe = doc.createElement('iframe');
    iframe.src = targetUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('allow', 'autoplay; fullscreen; gamepad; focus-without-user-activation *');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    doc.body.appendChild(iframe);
  } catch (err) {
    console.error('Failed to open about:blank', err);
    window.open(targetUrl, '_blank');
  }
}

/**
 * Initializes and fetches games.json
 */
async function loadGames() {
  const gamesGrid = document.getElementById('games-grid');
  const countBadge = document.getElementById('games-count');
  
  try {
    // Attempt to load from relative path first, then fallback to CDN URL
    let res = await fetch('games.json');
    if (!res.ok) {
      res = await fetch(`${CDN_PREFIX}/games.json`);
    }
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    allGames = await res.json();
    if (countBadge) countBadge.textContent = `${allGames.length} Unblocked Games`;
    renderGames();
  } catch (err) {
    console.error('Error loading games:', err);
    gamesGrid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10 p-8">
        <p class="text-lg font-semibold text-white mb-2">Could not load games.json</p>
        <p class="text-sm max-w-md mx-auto mb-4">Make sure <code class="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">games.json</code> is located next to <code class="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">index.html</code> or hosted at your CDN endpoint.</p>
        <button onclick="loadGames()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition">
          Retry Loading
        </button>
      </div>
    `;
  }
}

/**
 * Renders filtered games
 */
function renderGames() {
  const gamesGrid = document.getElementById('games-grid');
  if (!gamesGrid) return;

  const filtered = allGames.filter(game => {
    const matchesCat = activeCategory === 'all' 
      ? true 
      : activeCategory === 'favorites' 
        ? favorites.includes(game.id)
        : game.category.toLowerCase() === activeCategory.toLowerCase();
        
    const matchesSearch = !searchQuery || 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    gamesGrid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <p class="text-lg font-medium text-slate-300">No games found matching your search</p>
        <p class="text-sm mt-1">Try clearing filters or checking your search terms.</p>
      </div>
    `;
    return;
  }

  gamesGrid.innerHTML = filtered.map(game => {
    // Resolve thumbnail using CDN prefix if relative
    const thumbUrl = resolveCdnUrl(game.thumbnail);
    const isFav = favorites.includes(game.id);

    return `
      <div class="group relative bg-[#0d1527] hover:bg-[#121c33] border border-blue-900/30 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/50 hover:-translate-y-1 flex flex-col cursor-pointer"
           onclick="launchGame('${game.id}')">
        <!-- Thumbnail Container -->
        <div class="relative w-full aspect-video bg-black/40 overflow-hidden">
          <img src="${thumbUrl}" alt="${game.title}" 
               loading="lazy"
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0d1527] via-transparent to-transparent opacity-80"></div>
          
          <!-- Category Tag -->
          <span class="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600/90 text-white shadow-sm">
            ${game.category}
          </span>

          <!-- Rating -->
          <span class="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-400 flex items-center gap-1 border border-white/10">
            ★ ${game.rating ? game.rating.toFixed(1) : '4.9'}
          </span>
          
          <!-- Hover Play Overlay -->
          <div class="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              ▶
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">${game.title}</h3>
              <button onclick="event.stopPropagation(); toggleFavorite('${game.id}')" 
                      class="text-sm ${isFav ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'} p-1 transition"
                      title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}">
                ${isFav ? '★' : '☆'}
              </button>
            </div>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${game.description}</p>
          </div>

          <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>${(game.plays || 12000).toLocaleString()} plays</span>
            <span class="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Play Now →
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Toggles a game's favorite state
 */
function toggleFavorite(gameId) {
  if (favorites.includes(gameId)) {
    favorites = favorites.filter(id => id !== gameId);
  } else {
    favorites.push(gameId);
  }
  localStorage.setItem('safezone_favorites', JSON.stringify(favorites));
  renderGames();
}

/**
 * Launches the modal for a game
 */
function launchGame(gameId) {
  const game = allGames.find(g => g.id === gameId);
  if (!game) return;

  activeGame = game;
  const modal = document.getElementById('game-modal');
  const titleEl = document.getElementById('modal-game-title');
  const descEl = document.getElementById('modal-game-desc');
  const categoryEl = document.getElementById('modal-game-category');
  const frameContainer = document.getElementById('modal-frame-container');
  const controlsEl = document.getElementById('modal-game-controls');

  // Resolve game page URL using CDN prefix if relative
  const gameUrl = resolveCdnUrl(game.embedUrl);

  titleEl.textContent = game.title;
  descEl.textContent = game.description;
  categoryEl.textContent = game.category.toUpperCase();

  // Controls display
  if (game.controls && game.controls.length > 0) {
    controlsEl.innerHTML = game.controls.map(c => `
      <span class="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300">
        ${c}
      </span>
    `).join('');
  } else {
    controlsEl.innerHTML = '<span class="text-xs text-slate-500">Standard mouse / keyboard controls</span>';
  }

  // Load iframe
  frameContainer.innerHTML = `
    <iframe id="active-game-iframe"
            src="${gameUrl}"
            class="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad; focus-without-user-activation *"
            allowfullscreen
            referrerpolicy="no-referrer">
    </iframe>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the game modal
 */
function closeGameModal() {
  const modal = document.getElementById('game-modal');
  const frameContainer = document.getElementById('modal-frame-container');
  if (frameContainer) frameContainer.innerHTML = '';
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  activeGame = null;
}

/**
 * Opens active game in About:Blank
 */
function launchActiveAboutBlank() {
  if (!activeGame) return;
  const url = resolveCdnUrl(activeGame.embedUrl);
  openAboutBlank(url, activeGame.title);
}

/**
 * Toggles fullscreen for game iframe
 */
function toggleFullscreen() {
  const iframe = document.getElementById('active-game-iframe');
  if (!iframe) return;
  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  } else if (iframe.webkitRequestFullscreen) {
    iframe.webkitRequestFullscreen();
  }
}

/**
 * Camouflage Panic Button - Disguises the tab as Google Classroom
 */
function triggerCamouflage() {
  document.title = 'Classes - Google Classroom';
  const icon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  icon.type = 'image/x-icon';
  icon.rel = 'shortcut icon';
  icon.href = 'https://ssl.gstatic.com/classroom/favicon.png';
  document.getElementsByTagName('head')[0].appendChild(icon);
  
  // Quick redirect or overlay
  const disguise = document.getElementById('edu-disguise-modal');
  if (disguise) disguise.classList.remove('hidden');
}

/**
 * Event Listeners on DOM Load
 */
document.addEventListener('DOMContentLoaded', () => {
  loadGames();

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderGames();
    });
  }

  // Category buttons
  const catButtons = document.querySelectorAll('.cat-pill');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
        b.classList.add('bg-white/5', 'text-slate-300', 'border-white/10');
      });
      btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
      btn.classList.remove('bg-white/5', 'text-slate-300', 'border-white/10');
      
      activeCategory = btn.getAttribute('data-cat') || 'all';
      renderGames();
    });
  });

  // Modal actions
  const closeBtn = document.getElementById('btn-close-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeGameModal);

  const abBtn = document.getElementById('btn-about-blank');
  if (abBtn) abBtn.addEventListener('click', launchActiveAboutBlank);

  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);

  const panicBtn = document.getElementById('btn-panic');
  if (panicBtn) panicBtn.addEventListener('click', triggerCamouflage);

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGameModal();
  });
});
