import feather from 'feather-icons';
import { LAWS_DATA } from './data/lawsData.js';

import * as fitts from './sandboxes/fitts.js';
import * as hicks from './sandboxes/hicks.js';
import * as millers from './sandboxes/millers.js';
import * as doherty from './sandboxes/doherty.js';
import * as jakobs from './sandboxes/jakobs.js';
import * as postels from './sandboxes/postels.js';
import * as aesthetic from './sandboxes/aesthetic.js';
import * as peakEnd from './sandboxes/peakEnd.js';
import * as vonRestorff from './sandboxes/vonRestorff.js';
import * as zeigarnik from './sandboxes/zeigarnik.js';
import * as teslers from './sandboxes/teslers.js';
import * as serialPosition from './sandboxes/serialPosition.js';
import * as proximity from './sandboxes/proximity.js';
import * as similarity from './sandboxes/similarity.js';
import * as commonRegion from './sandboxes/commonRegion.js';
import * as pragnanz from './sandboxes/pragnanz.js';
import * as uniformConnected from './sandboxes/uniformConnected.js';
import * as occams from './sandboxes/occams.js';
import * as pareto from './sandboxes/pareto.js';
import * as parkinsons from './sandboxes/parkinsons.js';
import * as focalPoint from './sandboxes/focalPoint.js';
import * as choiceOverload from './sandboxes/choiceOverload.js';
import * as chunking from './sandboxes/chunking.js';
import * as cognitiveBias from './sandboxes/cognitiveBias.js';
import * as cognitiveLoad from './sandboxes/cognitiveLoad.js';
import * as flow from './sandboxes/flow.js';
import * as goalGradientEffect from './sandboxes/goalGradientEffect.js';
import * as mentalModel from './sandboxes/mentalModel.js';
import * as paradoxOfTheActiveUser from './sandboxes/paradoxOfTheActiveUser.js';
import * as selectiveAttention from './sandboxes/selectiveAttention.js';
import * as workingMemory from './sandboxes/workingMemory.js';

const SANDBOX_REGISTRY = {
  fitts, hicks, millers, doherty, jakobs, postels, aesthetic,
  peakEnd, vonRestorff, zeigarnik, teslers, serialPosition,
  proximity, similarity, commonRegion, pragnanz, uniformConnected,
  occams, pareto, parkinsons, focalPoint,
  choiceOverload, chunking, cognitiveBias, cognitiveLoad, flow,
  goalGradientEffect, mentalModel, paradoxOfTheActiveUser,
  selectiveAttention, workingMemory
};

let currentSandboxCleanup = null;

// Escapes text before it's interpolated into innerHTML, so user-typed input
// (e.g. the search box) can never be interpreted as HTML/script.
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

// Safely read the saved "My List" bookmarks — falls back to an empty list
// instead of throwing if localStorage is unavailable or the value is corrupted.
function loadMyList() {
  try {
    const raw = localStorage.getItem('ux_laws_my_list');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read saved "My List" data, starting fresh.', err);
    return [];
  }
}

// Application State
const state = {
  laws: [...LAWS_DATA],
  currentCategory: 'all',
  searchQuery: '',
  myList: loadMyList(),
  currentHeroLaw: LAWS_DATA[0],
  activeModalLaw: null,
  activeModalTab: 'overview'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initHeroSpotlight();
  renderDashboard();
  initSearch();
  initFilterPills();
  initModalEvents();
  initKeyboardShortcuts();
  updateMyListCounter();
  
  feather.replace();
});

/* ==========================================================================
   NAVBAR & SCROLL HANDLING
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const brandLogo = document.getElementById('brand-logo');
  brandLogo.addEventListener('click', () => {
    state.currentCategory = 'all';
    state.searchQuery = '';
    document.getElementById('search-input').value = '';
    updateActiveCategoryUI('all');
    renderDashboard();
  });

  // Nav Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = e.target.getAttribute('data-category');
      state.currentCategory = cat;
      updateActiveCategoryUI(cat);
      renderDashboard();
    });
  });

  const myListNavBtn = document.getElementById('my-list-nav-btn');
  myListNavBtn.addEventListener('click', () => {
    state.currentCategory = 'mylist';
    updateActiveCategoryUI('mylist');
    renderDashboard();
  });

  initTopRatedDropdown();
}

function initTopRatedDropdown() {
  const dropdownMenu = document.getElementById('top-rated-dropdown');
  const dropdownToggle = document.getElementById('top-rated-nav-link');
  const dropdownList = document.getElementById('top-rated-dropdown-list');
  const viewAllBtn = document.getElementById('top-rated-view-all');
  if (!dropdownList || !dropdownMenu) return;

  const topLaws = LAWS_DATA.filter(l => l.rating >= 4.9).slice(0, 9);
  dropdownList.innerHTML = topLaws.map(law => `
    <div class="dropdown-item" data-id="${law.id}">
      <div class="dropdown-item-thumb" style="background-color: ${law.bgColor || '#2a2a2a'};">
        ${law.svgIcon ? law.svgIcon.replace('<svg', '<svg style="width:70%; height:70%;"') : '<i data-feather="play"></i>'}
      </div>
      <div class="dropdown-item-info">
        <div class="dropdown-item-title">${escapeHtml(law.title)}</div>
        <div class="dropdown-item-meta">
          <span class="dropdown-rating">★ ${law.rating}</span>
          <span class="dropdown-cat">${escapeHtml(law.category)}</span>
          <span class="dropdown-dur">${law.duration}</span>
        </div>
      </div>
      <button class="dropdown-play-btn" title="Play Video">
        <i data-feather="play"></i>
      </button>
    </div>
  `).join('');

  // Click on "Top Rated" toggles persistent open state
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('active');
    });
  }

  // Click outside closes active dropdown
  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
      dropdownMenu.classList.remove('active');
    }
  });

  // Prevent wheel scroll from closing or bubbling weirdly
  dropdownList.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { passive: true });

  dropdownList.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.remove('active');
      const lawId = item.getAttribute('data-id');
      const targetLaw = LAWS_DATA.find(l => l.id === lawId);
      if (targetLaw) openModal(targetLaw, true);
    });
  });

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.remove('active');
      state.currentCategory = 'top';
      updateActiveCategoryUI('top');
      renderDashboard();
    });
  }
}

function updateActiveCategoryUI(cat) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-category') === cat);
  });
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
  });
}

/* ==========================================================================
   HERO SPOTLIGHT SECTION
   ========================================================================== */
function initHeroSpotlight() {
  const hero = state.currentHeroLaw;
  document.getElementById('hero-title').textContent = hero.title;
  document.getElementById('hero-subtitle').textContent = hero.subtitle;
  document.getElementById('hero-summary').textContent = hero.summary;
  document.getElementById('hero-badge').textContent = hero.badge || 'SPOTLIGHT';
  document.getElementById('hero-rating').innerHTML = `<i data-feather="star" style="width:12px; height:12px; fill:#FFD700;"></i> ${hero.rating} / 5.0`;
  
  const heroBgContainer = document.querySelector('.hero-bg-container');
  if (hero.svgIcon) {
    heroBgContainer.innerHTML = `<div style="background-color: ${hero.bgColor}; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: absolute; inset: 0;">
       <div style="width: 50%; height: 50%; max-height: 800px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
         ${hero.svgIcon.replace('<svg', '<svg style="width:100%; height:100%;"')}
       </div>
     </div>`;
  } else {
    heroBgContainer.innerHTML = `<img id="hero-bg-img" class="hero-bg-image" src="${hero.thumbnailUrl}" alt="UX Hero Spotlight" loading="lazy">`;
  }

  const playBtn = document.getElementById('hero-play-btn');
  const infoBtn = document.getElementById('hero-info-btn');

  playBtn.onclick = () => openModal(hero, true);
  infoBtn.onclick = () => openModal(hero, false);
}

/* ==========================================================================
   MAIN DASHBOARD RENDERER
   ========================================================================== */
function renderDashboard() {
  const container = document.getElementById('main-content');
  container.innerHTML = '';

  let filteredLaws = state.laws.filter(law => {
    const query = state.searchQuery.toLowerCase();
    const matchesSearch = !query || 
      law.title.toLowerCase().includes(query) ||
      law.subtitle.toLowerCase().includes(query) ||
      law.description.toLowerCase().includes(query) ||
      law.category.toLowerCase().includes(query) ||
      law.caseStudies.some(cs => cs.company.toLowerCase().includes(query) || cs.title.toLowerCase().includes(query));

    let matchesCategory = true;
    if (state.currentCategory === 'top') {
      matchesCategory = law.rating >= 4.9;
    } else if (state.currentCategory === 'mylist') {
      matchesCategory = state.myList.includes(law.id);
    } else if (state.currentCategory !== 'all') {
      matchesCategory = law.category === state.currentCategory;
    }

    return matchesSearch && matchesCategory;
  });

  if (filteredLaws.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon"><i data-feather="alert-circle"></i></div>
        <h2>No UX Laws Found</h2>
        <p>No laws match your search "${escapeHtml(state.searchQuery)}". Try searching for terms like "Apple", "Fitts", "Form", or "Cognitive".</p>
      </div>
    `;
    feather.replace();
    return;
  }

  // Define Rows to display
  let rows = [];

  if (state.currentCategory === 'mylist') {
    rows.push({
      title: 'My Saved Laws',
      count: filteredLaws.length,
      laws: filteredLaws
    });
  } else if (state.searchQuery || state.currentCategory !== 'all') {
    rows.push({
      title: state.searchQuery ? `Search Results for "${state.searchQuery}"` : `${state.currentCategory} Laws`,
      count: filteredLaws.length,
      laws: filteredLaws
    });
  } else {
    // Default Netflix multi-row layout (Top Rated row is now in top navbar dropdown)
    const heuristics = filteredLaws.filter(l => l.category === 'Heuristic');
    const gestalt = filteredLaws.filter(l => l.category === 'Gestalt');
    const cognitive = filteredLaws.filter(l => l.category === 'Cognitive');
    const principles = filteredLaws.filter(l => l.category === 'Principle');

    if (heuristics.length > 0) rows.push({ title: 'Core Heuristics & Rules of Thumb', count: heuristics.length, laws: heuristics });
    if (gestalt.length > 0) rows.push({ title: 'Gestalt Principles of Visual Perception', count: gestalt.length, laws: gestalt });
    if (cognitive.length > 0) rows.push({ title: 'Cognitive Psychology & Memory Limits', count: cognitive.length, laws: cognitive });
    if (principles.length > 0) rows.push({ title: 'Product & Behavioral Design Principles', count: principles.length, laws: principles });
  }

  rows.forEach(row => {
    const rowEl = createRowComponent(row.title, row.count, row.laws);
    container.appendChild(rowEl);
  });

  feather.replace();
}

/* ==========================================================================
   CAROUSEL ROW COMPONENT
   ========================================================================== */
function createRowComponent(title, count, laws) {
  const rowDiv = document.createElement('div');
  rowDiv.className = 'category-row';

  rowDiv.innerHTML = `
    <div class="row-header">
      <h3 class="row-title">${title}</h3>
      <span class="row-count">${count} Videos</span>
    </div>
    <div class="carousel-container">
      <button class="carousel-btn prev" aria-label="Previous"><i data-feather="chevron-left"></i></button>
      <div class="carousel-track-wrapper">
        <div class="carousel-track"></div>
      </div>
      <button class="carousel-btn next" aria-label="Next"><i data-feather="chevron-right"></i></button>
    </div>
  `;

  const track = rowDiv.querySelector('.carousel-track');
  laws.forEach(law => {
    const card = createCardComponent(law);
    track.appendChild(card);
  });

  // Attach Carousel Horizontal Scroll
  const trackWrapper = rowDiv.querySelector('.carousel-track-wrapper');
  const prevBtn = rowDiv.querySelector('.carousel-btn.prev');
  const nextBtn = rowDiv.querySelector('.carousel-btn.next');

  prevBtn.addEventListener('click', () => {
    trackWrapper.scrollBy({ left: -450, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    trackWrapper.scrollBy({ left: 450, behavior: 'smooth' });
  });

  return rowDiv;
}

/* ==========================================================================
   CARD COMPONENT
   ========================================================================== */
function createCardComponent(law) {
  const card = document.createElement('div');
  card.className = 'card-item';
  card.setAttribute('data-id', law.id);

  const visualElement = law.svgIcon ? 
    `<div class="card-svg-wrapper" style="background-color: ${law.bgColor}; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: absolute; inset: 0;">
       <div style="width: 85%; height: 85%; display: flex; align-items: center; justify-content: center;">
         ${law.svgIcon.replace('<svg', '<svg style="width:100%; height:100%;"')}
       </div>
     </div>` : 
    `<img src="${law.thumbnailUrl}" alt="${law.title}" class="card-img" loading="lazy">`;

  card.innerHTML = `
    <div class="card-img-container">
      ${visualElement}
      <div class="card-overlay">
        <div class="card-top-bar">
          <span class="card-badge">${law.category}</span>
          <span class="card-rating-pill"><i data-feather="star" style="width:10px; height:10px; fill:#FFD700;"></i> ${law.rating}</span>
        </div>
        <div class="card-bottom-info">
          <h4 class="card-title">${law.title}</h4>
          <p class="card-subtitle">${law.subtitle}</p>
          <div class="card-quick-meta">
            <div class="card-play-icon"><i data-feather="play" style="fill:currentColor;"></i></div>
          </div>
        </div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    openModal(law, true);
  });

  return card;
}

/* ==========================================================================
   SEARCH & FILTER CONTROLLER
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDashboard();
  });
}

function initFilterPills() {
  const pills = document.querySelectorAll('.pill-btn');
  
  const counts = {
    all: state.laws.length,
    Heuristic: state.laws.filter(l => l.category === 'Heuristic').length,
    Principle: state.laws.filter(l => l.category === 'Principle').length,
    Gestalt: state.laws.filter(l => l.category === 'Gestalt').length,
    Cognitive: state.laws.filter(l => l.category === 'Cognitive').length,
    top: state.laws.filter(l => l.rating >= 4.9).length
  };

  pills.forEach(pill => {
    const cat = pill.getAttribute('data-cat');
    
    // Hide pill if count is 0 (except 'all' and 'mylist')
    if (counts[cat] === 0 && cat !== 'all' && cat !== 'mylist') {
      pill.style.display = 'none';
    } else {
      pill.style.display = 'inline-block';
    }

    if (cat === 'Heuristic') pill.textContent = `Heuristics (${counts[cat]})`;
    if (cat === 'Principle') pill.textContent = `Principles (${counts[cat]})`;
    if (cat === 'Gestalt') pill.textContent = `Gestalt Laws (${counts[cat]})`;
    if (cat === 'Cognitive') pill.textContent = `Cognitive Laws (${counts[cat]})`;

    pill.addEventListener('click', (e) => {
      const cat = e.target.getAttribute('data-cat');
      state.currentCategory = cat;
      updateActiveCategoryUI(cat);
      renderDashboard();
    });
  });
}

/* ==========================================================================
   YOUTUBE EMBEDDED VIDEO DETAIL MODAL CONTROLLER
   ========================================================================== */
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:embed\/|v=|v\/|vi\/|youtu\.be\/|\/v\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function renderPlayerContent(law, autoPlay = true) {
  const videoContainer = document.querySelector('.modal-video-container');
  if (!videoContainer) return;

  const ytId = extractYouTubeId(law.youtubeEmbedUrl);

  let html = `<div class="video-watermark-badge">NETFLIX UX ORIGINAL</div>`;

  if (ytId) {
    const embedSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&rel=0&enablejsapi=1`;
    html += `
      <iframe 
        id="modal-yt-iframe"
        class="modal-html5-video"
        src="${embedSrc}" 
        title="${law.title} YouTube Video Player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen>
      </iframe>
    `;
  } else {
    html += `
      <div style="aspect-ratio:16/9; background:#000; display:flex; align-items:center; justify-content:center; color:#aaa; font-size:14px; text-align:center; padding:20px;">
        📺 Video lecture available soon for ${law.title}
      </div>
    `;
  }

  videoContainer.innerHTML = html;
}

function openModal(law, autoPlay = true) {
  state.activeModalLaw = law;
  state.activeModalTab = 'overview';

  const modal = document.getElementById('video-modal');
  const officialBtn = document.getElementById('modal-official-btn');
  const ytBtn = document.getElementById('modal-yt-btn');
  const ytId = extractYouTubeId(law.youtubeEmbedUrl);

  // Render YouTube Embedded Video
  renderPlayerContent(law, autoPlay);

  // Set External Official Article & YouTube Search Links
  if (officialBtn) {
    officialBtn.href = law.officialUrl || `https://lawsofux.com/${law.id}/`;
  }

  if (ytBtn) {
    ytBtn.href = ytId 
      ? `https://www.youtube.com/watch?v=${ytId}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(law.title + ' UX design law laws of ux')}`;
  }

  document.getElementById('modal-title').textContent = law.title;
  document.getElementById('modal-subtitle').textContent = law.subtitle;
  document.getElementById('modal-match').textContent = `${Math.round(law.rating * 20)}% Match`;
  document.getElementById('modal-rating').innerHTML = `<i data-feather="star" style="width:12px; height:12px; fill:#FFD700;"></i> ${law.rating} / 5.0`;
  
  // Format clean author tag without duplicate year text
  let authorText = law.author || 'Laws of UX Canon';
  if (law.year && !authorText.includes(law.year)) {
    authorText += ` (${law.year})`;
  }
  document.getElementById('modal-author').textContent = authorText;


  document.getElementById('modal-description').textContent = law.description;

  // Render Case Studies
  const csGrid = document.getElementById('modal-case-studies-grid');
  csGrid.innerHTML = law.caseStudies.map(cs => `
    <div class="case-study-card">
      <div class="cs-company"><i data-feather="${cs.logo || 'briefcase'}"></i> ${cs.company}</div>
      <h4 class="cs-title">${cs.title}</h4>
      <p class="cs-desc">${cs.description}</p>
    </div>
  `).join('');

  // Render Key Takeaways
  const takeawaysList = document.getElementById('modal-takeaways-list');
  takeawaysList.innerHTML = law.keyTakeaways.map(tip => `
    <li class="takeaway-item">
      <i data-feather="check-circle" class="takeaway-icon"></i>
      <span>${tip}</span>
    </li>
  `).join('');

  // Update Bookmark Button State
  updateModalBookmarkBtn();

  // Reset Tab Navigation
  switchModalTab('overview');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  feather.replace();
}

function closeModal() {
  if (currentSandboxCleanup) {
    currentSandboxCleanup();
    currentSandboxCleanup = null;
  }

  const modal = document.getElementById('video-modal');
  const videoPlayer = document.getElementById('modal-html5-video');
  const ytIframe = document.getElementById('modal-yt-iframe');
  
  if (videoPlayer) videoPlayer.pause();
  if (ytIframe) ytIframe.src = '';
  
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function initModalEvents() {
  const closeBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('video-modal');

  closeBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Bookmark Toggle
  const bookmarkBtn = document.getElementById('modal-bookmark-btn');
  bookmarkBtn.addEventListener('click', () => {
    if (!state.activeModalLaw) return;
    const lawId = state.activeModalLaw.id;
    const index = state.myList.indexOf(lawId);

    if (index > -1) {
      state.myList.splice(index, 1);
    } else {
      state.myList.push(lawId);
    }

    try {
      localStorage.setItem('ux_laws_my_list', JSON.stringify(state.myList));
    } catch (err) {
      console.warn('Could not save "My List" — your browser storage may be full or blocked.', err);
    }
    updateModalBookmarkBtn();
    updateMyListCounter();

    if (state.currentCategory === 'mylist') {
      renderDashboard();
    }
  });

  // Modal Tab Switching
  document.querySelectorAll('.modal-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      const tabName = e.target.getAttribute('data-tab');
      switchModalTab(tabName);
    });
  });
}

function switchModalTab(tabName) {
  state.activeModalTab = tabName;
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });

  document.getElementById('tab-overview').style.display = tabName === 'overview' ? 'block' : 'none';
  document.getElementById('tab-casestudies').style.display = tabName === 'casestudies' ? 'block' : 'none';
  document.getElementById('tab-takeaways').style.display = tabName === 'takeaways' ? 'block' : 'none';
  document.getElementById('tab-sandbox').style.display = tabName === 'sandbox' ? 'block' : 'none';

  if (tabName === 'sandbox' && state.activeModalLaw) {
    renderSandbox(state.activeModalLaw);
  }
}

function updateModalBookmarkBtn() {
  if (!state.activeModalLaw) return;
  const isBookmarked = state.myList.includes(state.activeModalLaw.id);
  const bookmarkBtn = document.getElementById('modal-bookmark-btn');

  if (isBookmarked) {
    bookmarkBtn.classList.add('bookmarked');
    bookmarkBtn.innerHTML = `<i data-feather="check"></i> <span>Added to My List</span>`;
  } else {
    bookmarkBtn.classList.remove('bookmarked');
    bookmarkBtn.innerHTML = `<i data-feather="plus"></i> <span>Add to My List</span>`;
  }

  feather.replace();
}

function updateMyListCounter() {
  const countEl = document.getElementById('my-list-count');
  if (countEl) {
    countEl.textContent = state.myList.length;
  }
}

/* ==========================================================================
   KEYBOARD ACCESSIBILITY
   ========================================================================== */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === '/' && document.activeElement.id !== 'search-input') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
  });
}

/* ==========================================================================
   INTERACTIVE UX SANDBOX SIMULATORS DISPATCHER
   ========================================================================== */
function renderSandbox(law) {
  const container = document.getElementById('sandbox-container');
  if (!container) return;

  if (currentSandboxCleanup) {
    currentSandboxCleanup();
    currentSandboxCleanup = null;
  }

  const sType = law.sandboxType;
  const module = SANDBOX_REGISTRY[sType];

  if (module && typeof module.render === 'function') {
    currentSandboxCleanup = module.render(container);
  } else {
    container.innerHTML = `
      <h3 class="sandbox-title"><i data-feather="sliders"></i> ${law.title} Interactive UX Simulator</h3>
      <p class="sandbox-desc">${law.summary}</p>
      <div class="sandbox-demo-box">
        <a href="${law.officialUrl}" target="_blank" class="modal-official-btn">
          <i data-feather="external-link"></i> Official Research Article
        </a>
      </div>
    `;
  }

  feather.replace();
}

