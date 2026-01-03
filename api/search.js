// Vercel Serverless Function: Search Movies
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const OMDB_API_KEY = process.env.OMDB_API_KEY;

    if (!OMDB_API_KEY) {
        return res.status(500).json({
            Response: 'False',
            Error: 'API key not configured'
        });
    }

    const query = req.query.q;

    if (!query || query.trim() === '') {
        return res.status(400).json({
            Response: 'False',
            Error: 'Please provide a movie name to search'
        });
    }

    try {
        const apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`;
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
}
