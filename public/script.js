// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const emptyState = document.getElementById('emptyState');

// Modal Elements
const modal = document.getElementById('movieModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalLoader = document.getElementById('modalLoader');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalYear = document.getElementById('modalYear');
const modalRated = document.getElementById('modalRated');
const modalRuntime = document.getElementById('modalRuntime');
const modalRating = document.getElementById('modalRating');
const modalGenre = document.getElementById('modalGenre');
const modalPlot = document.getElementById('modalPlot');
const modalDirector = document.getElementById('modalDirector');
const modalActors = document.getElementById('modalActors');

// API endpoints
const SEARCH_API = '/api/search';
const DETAILS_API = '/api/details';

// Event Listeners
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Modal close events
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Search handler
async function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        showError('Please enter a movie name to search');
        return;
    }

    hideError();
    hideResults();
    hideEmptyState();
    showLoader();

    try {
        const response = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        hideLoader();

        if (data.Response === 'False') {
            showError(data.Error || 'No movies found');
            return;
        }

        if (!data.Search || data.Search.length === 0) {
            showError('No movies found. Try a different title.');
            return;
        }

        displayResults(data.Search);

    } catch (error) {
        console.error('Search error:', error);
        hideLoader();
        showError('Unable to connect to the server. Please try again later.');
    }
}

// Display movie results as grid
function displayResults(movies) {
    resultsGrid.innerHTML = '';

    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        resultsGrid.appendChild(card);
    });

    showResults();
}

// Create a movie poster card
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.imdbId = movie.imdbID;

    const hasPoster = movie.Poster && movie.Poster !== 'N/A';

    if (hasPoster) {
        card.innerHTML = `
            <img src="${movie.Poster}" alt="${escapeHtml(movie.Title)} poster" loading="lazy">
            <div class="movie-card-overlay">
                <div class="movie-card-title">${escapeHtml(movie.Title)}</div>
                <div class="movie-card-year">${movie.Year}</div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="movie-card-no-poster">🎬</div>
            <div class="movie-card-overlay" style="opacity: 1;">
                <div class="movie-card-title">${escapeHtml(movie.Title)}</div>
                <div class="movie-card-year">${movie.Year}</div>
            </div>
        `;
    }

    // Add click event to open modal
    card.addEventListener('click', () => openMovieDetails(movie.imdbID));

    return card;
}

// Open modal with movie details
async function openMovieDetails(imdbId) {
    showModalLoader();

    try {
        const response = await fetch(`${DETAILS_API}?id=${encodeURIComponent(imdbId)}`);
        const data = await response.json();

        hideModalLoader();

        if (data.Response === 'False') {
            showError(data.Error || 'Could not load movie details');
            return;
        }

        populateModal(data);
        showModal();

    } catch (error) {
        console.error('Details error:', error);
        hideModalLoader();
        showError('Unable to load movie details. Please try again.');
    }
}

// Populate modal with movie data
function populateModal(movie) {
    // Poster
    if (movie.Poster && movie.Poster !== 'N/A') {
        modalPoster.src = movie.Poster;
        modalPoster.alt = `${movie.Title} poster`;
    } else {
        modalPoster.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect fill="%2312121a"/><text x="50" y="75" text-anchor="middle" fill="%23606070" font-size="40">🎬</text></svg>';
        modalPoster.alt = 'No poster available';
    }

    // Title
    modalTitle.textContent = movie.Title || 'Unknown Title';

    // Meta info
    modalYear.textContent = movie.Year || 'N/A';
    modalRated.textContent = movie.Rated || 'N/A';
    modalRuntime.textContent = movie.Runtime || 'N/A';

    // Rating
    const imdbRating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null;
    if (imdbRating) {
        modalRating.innerHTML = `
            <span class="star">⭐</span>
            ${imdbRating}/10
            <span class="rating-source">IMDb (${movie.imdbVotes || 'N/A'} votes)</span>
        `;
    } else {
        modalRating.innerHTML = '<span style="color: var(--text-muted);">No rating available</span>';
    }

    // Genres
    if (movie.Genre && movie.Genre !== 'N/A') {
        const genres = movie.Genre.split(', ');
        modalGenre.innerHTML = genres.map(g => `<span class="genre-tag">${g}</span>`).join('');
    } else {
        modalGenre.innerHTML = '';
    }

    // Plot
    modalPlot.textContent = movie.Plot && movie.Plot !== 'N/A'
        ? movie.Plot
        : 'No plot description available.';

    // Cast & Crew
    modalDirector.innerHTML = movie.Director && movie.Director !== 'N/A'
        ? `<strong>Director:</strong> ${escapeHtml(movie.Director)}`
        : '';

    modalActors.innerHTML = movie.Actors && movie.Actors !== 'N/A'
        ? `<strong>Cast:</strong> ${escapeHtml(movie.Actors)}`
        : '';
}

// Modal visibility functions
function showModal() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scroll
}

function showModalLoader() {
    modalLoader.classList.remove('hidden');
}

function hideModalLoader() {
    modalLoader.classList.add('hidden');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// UI Helper functions
function showLoader() {
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
}

// Focus search input on page load
window.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();
});
