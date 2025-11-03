exports.handler = async (event) => {
    
    // Perbaikan untuk 'require()'
    const fetch = (await import('node-fetch')).default;

    const { prompt } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;

    // Perbaikan typo 'generativelanguage'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const dataRequest = {
        "contents": [
            { "parts": [{ "text": prompt }] }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataRequest)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Google API Error: ${response.status}`, errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const dataResponse = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(dataResponse)
        };

    } catch (error) {
        console.error("Error di serverless function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
