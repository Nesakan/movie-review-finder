// Vercel Serverless Function: Get Movie Details
module.exports = async function handler(req, res) {
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

    const id = req.query.id;

    if (!id) {
        return res.status(400).json({
            Response: 'False',
            Error: 'Movie ID is required'
        });
    }

    try {
        const apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(id)}&plot=full`;
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
};
