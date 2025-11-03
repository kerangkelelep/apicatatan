// Isi file: script.js (BARU DAN AMAN)

document.addEventListener("DOMContentLoaded", () => {
    
    const inputTanggal = document.getElementById("input-tanggal");
    const inputCatatan = document.getElementById("input-catatan");
    const tombolSimpan = document.getElementById("tombol-simpan");
    const daftarCatatan = document.getElementById("daftar-catatan");

    inputTanggal.valueAsDate = new Date();

    function muatCatatan() {
        const catatanTersimpan = localStorage.getItem("catatanHarian") || "[]";
        return JSON.parse(catatanTersimpan);
    }

    function simpanCatatan(catatan) {
        localStorage.setItem("catatanHarian", JSON.stringify(catatan));
    }

    function tampilkanCatatan() {
        daftarCatatan.innerHTML = "";
        const catatan = muatCatatan();
        catatan.sort((a, b) => b.id - a.id);

        if (catatan.length === 0) {
            daftarCatatan.innerHTML = "<p>Belum ada catatan.</p>";
            return;
        }

        catatan.forEach((item) => {
            const divCatatan = document.createElement("div");
            divCatatan.classList.add("catatan-item");
            const tanggalCantik = new Date(item.tanggal).toLocaleDateString("id-ID", {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
            });
            const teksCatatanEncoded = encodeURIComponent(item.teks);

            divCatatan.innerHTML = `
                <div class="header">
                    <strong>${tanggalCantik}</strong>
                    <button class="tombol-hapus" data-id="${item.id}">Hapus</button>
                </div>
                <p>${item.teks}</p>
                <div class="ai-actions">
                    <button class="tombol-ai" data-prompt="ringkas" data-teks="${teksCatatanEncoded}">Ringkas ✨</button>
                    <button class="tombol-ai" data-prompt="mood" data-teks="${teksCatatanEncoded}">Cek Mood 🧐</button>
                </div>
                <div class="hasil-ai"></div>
            `;
            daftarCatatan.appendChild(divCatatan);
        });

        document.querySelectorAll(".tombol-hapus").forEach(tombol => {
            tombol.addEventListener("click", hapusCatatan);
        });
        document.querySelectorAll(".tombol-ai").forEach(tombol => {
            tombol.addEventListener("click", handleTombolAiDiklik);
        });
    }

    function tambahCatatan() {
        const tanggal = inputTanggal.value;
        const teks = inputCatatan.value.trim();
        if (!tanggal || !teks) {
            alert("Tanggal dan catatan tidak boleh kosong!");
            return;
        }
        const catatanBaru = { id: Date.now(), tanggal: tanggal, teks: teks };
        const catatan = muatCatatan();
        catatan.push(catatanBaru); 
        simpanCatatan(catatan);
        tampilkanCatatan();
        inputCatatan.value = "";
    }

    function hapusCatatan(event) {
        if (!confirm("Yakin ingin menghapus?")) return;
        const idUntukDihapus = Number(event.target.getAttribute("data-id"));
        let catatan = muatCatatan().filter(item => item.id !== idUntukDihapus);
        simpanCatatan(catatan);
        tampilkanCatatan();
    }

    // -----------------------------------------------------------------
    // 🚀 FUNGSI INTI YANG DIPERBARUI (AMAN)
    // -----------------------------------------------------------------
    
    async function handleTombolAiDiklik(event) {
        const tombol = event.target;
        const tipePrompt = tombol.getAttribute("data-prompt");
        const teksCatatan = decodeURIComponent(tombol.getAttribute("data-teks"));
        const divHasil = tombol.closest('.catatan-item').querySelector('.hasil-ai');

        divHasil.style.display = "block";
        divHasil.innerText = "Memproses...";
        tombol.disabled = true;

        let promptLengkap;
        if (tipePrompt === "ringkas") {
            promptLengkap = `Ringkaskan catatan harian ini dalam satu kalimat: "${teksCatatan}"`;
        } else {
            promptLengkap = `Analisis sentimen/mood dari catatan ini (jawab singkat: Senang, Sedih, Netral, dll.): "${teksCatatan}"`;
        }

        try {
            // PANGGIL SERVER PERANTARA KITA, BUKAN GOOGLE
            const hasil = await panggilServerPerantara(promptLengkap);
            divHasil.innerText = hasil;
        } catch (error) {
            console.error("Error:", error);
            divHasil.innerText = "Terjadi kesalahan. Coba lagi.";
        } finally {
            tombol.disabled = false;
        }
    }

    /**
     * Fungsi ini sekarang memanggil "backend" kita di Netlify,
     * BUKAN memanggil Google API secara langsung.
     */
    async function panggilServerPerantara(prompt) {
        // Ini adalah "alamat" backend kita.
        // Netlify otomatis tahu /.netlify/functions/nama-file
        const url = "/.netlify/functions/panggil-gemini"; 
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt }) // Kirim prompt ke backend kita
        });

        if (!response.ok) {
            throw new Error(`Server perantara gagal merespons.`);
        }

        const dataResponse = await response.json();
        
        // Cek jika server kita mengirim balik error
        if (dataResponse.error) {
            throw new Error(dataResponse.error);
        }

        // Ekstrak teks jawaban dari data yang DITERUSKAN oleh server kita
        return dataResponse.candidates[0].content.parts[0].text;
    }

    tombolSimpan.addEventListener("click", tambahCatatan);
    tampilkanCatatan();
});