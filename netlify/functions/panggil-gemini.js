exports.handler = async (event) => {
    
    const fetch = (await import('node-fetch')).default;

    const { prompt } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;

    // --- PERBAIKAN NAMA MODEL ADA DI SINI ---
    // 'gemini-pro' diubah menjadi 'gemini-1.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    // --- AKHIR PERBAIKAN ---

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
