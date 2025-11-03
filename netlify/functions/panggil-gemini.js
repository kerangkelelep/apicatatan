// Isi file: netlify/functions/panggil-gemini.js

// Ini adalah backend (server) Node.js, jadi kita pakai 'require'
const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Ambil "prompt" yang dikirim oleh browser (dari script.js)
    const { prompt } = JSON.parse(event.body);

    // 2. Ambil API Key RAHASIA Anda dari Netlify (BUKAN DARI KODE)
    // Kita akan atur 'GEMINI_API_KEY' ini di dashboard Netlify nanti
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const dataRequest = {
        "contents": [
            { "parts": [{ "text": prompt }] }
        ]
    };

    try {
        // 3. Server Anda menghubungi Google
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataRequest)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const dataResponse = await response.json();

        // 4. Kirim balasan dari Google KEMBALI ke browser
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
