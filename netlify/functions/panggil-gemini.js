exports.handler = async (event) => {
    
    const fetch = (await import('node-fetch')).default;

    const { prompt } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY; // Kunci dari Netlify

    // --- PERBAIKAN 1: Gunakan model 'gemini-2.0-flash' ---
    //    dan hapus ?key= dari akhir URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    const dataRequest = {
        "contents": [
            { "parts": [{ "text": prompt }] }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            // --- PERBAIKAN 2: Kirim API Key sebagai 'X-goog-api-key' di Header ---
            headers: { 
                "Content-Type": "application/json",
                "X-goog-api-key": API_KEY 
            },
            // --- AKHIR PERBAIKAN ---
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
