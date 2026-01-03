require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// OMDb API configuration
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Validate API key on startup
if (!OMDB_API_KEY || OMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('⚠️  ERROR: Please set your OMDb API key in the .env file');
    console.error('   Get a free key at: https://www.omdbapi.com/apikey.aspx');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route 1: Search for movies
app.get('/api/search', async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === '') {
        return res.status(400).json({
            Response: 'False',
            Error: 'Please provide a movie name to search'
        });
    }

    try {
        const apiUrl = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.Response === 'False') {
            return res.json({
                Response: 'False',
                Error: data.Error || 'No movies found'
            });
        }

        res.json(data);

    } catch (error) {
        console.error('Search error:', error.message);
        res.status(503).json({
            Response: 'False',
            Error: 'Service unavailable. Please try again later.'
        });
    }
});

// Route 2: Get movie details by IMDb ID
app.get('/api/details', async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({
            Response: 'False',
            Error: 'Movie ID is required'
        });
    }

    try {
        const apiUrl = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(id)}&plot=full`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.Response === 'False') {
            return res.json({
                Response: 'False',
                Error: data.Error || 'Movie not found'
            });
        }

        res.json(data);

    } catch (error) {
        console.error('Details error:', error.message);
        res.status(503).json({
            Response: 'False',
            Error: 'Service unavailable. Please try again later.'
        });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🎬 Movie Review Finder running at http://localhost:${PORT}`);
    console.log(`   Using OMDb API with key: ${OMDB_API_KEY.substring(0, 4)}****`);
});
