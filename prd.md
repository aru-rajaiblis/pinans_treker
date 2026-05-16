Product Requirement Document (PRD)

Project Name: FinBot - AI-Powered WhatsApp Finance Tracker & Dashboard

Objective: Mengurangi friction (kemalasan) mencatat keuangan manual dengan memanfaatkan WhatsApp (platform chat harian) dan AI untuk otomatisasi pencatatan, dilengkapi dashboard visual untuk analisis mendalam.
1. User Persona & Problem Statement

    Persona: Mahasiswa, first-jobber, atau individu yang aktif bertransaksi digital (m-banking/e-wallet) tapi malas mencatat pengeluaran karena ribet harus buka-tutup aplikasi pencatat keuangan khusus.

    Problem: Pencatatan manual sering terbengkalai. Kopasan mutasi bank/e-wallet strukturnya berantakan dan sulit dibaca oleh aplikasi biasa.

2. Core Features (Scope Proyek)
Fitur 1: WhatsApp Bot Input (AI-Powered)

    Deskripsi: User bisa mengetik pengeluaran secara natural atau melakukan copy-paste teks mutasi bank langsung ke chat WhatsApp.

    Kebutuhan Teknis: Integrasi @whiskeysockets/baileys untuk WhatsApp Web bridge.

Fitur 2: NLP Data Extraction (Otak AI)

    Deskripsi: Mengubah teks bahasa sehari-hari atau teks mutasi bank yang berantakan menjadi data JSON terstruktur.

    Kebutuhan Teknis: Groq API (Llama 3) dengan system prompt khusus keuangan.

    Output Data: amount (number), type (expense/income), category, description.

Fitur 3: State Management (Confirmation Loop)

    Deskripsi: Mekanisme "Tanya Balik" untuk memastikan akurasi data sebelum disimpan ke database, mencegah data sampah masuk.

    Alur: Bot mendeteksi data -> Bot meminta konfirmasi -> User ketik "ya" -> Data disimpan.

Fitur 4: WhatsApp Financial Assistant (On-Demand Reporting)

    Deskripsi: User bisa meminta rekap keuangan instan langsung dari chat dengan mengetik kata kunci seperti "Rekap". AI akan merangkum kondisi keuangan bulan berjalan.

Fitur 5: Web Dashboard Visualisasi (Sedang Beralih ke Sini)

    Deskripsi: Halaman web modern untuk melihat grafik pengeluaran, tren bulanan, dan breakdown kategori agar user mendapat insight makro tentang keuangan mereka.

    Kebutuhan Teknis: Next.js, Tailwind CSS, Supabase, Tremor Charts.

3. Tech Stack (Arsitektur Sistem)

    Backend / Bot Runtime: Node.js (TypeScript) & Express.

    AI Engine: Groq SDK (Llama 3).

    Database: Supabase (PostgreSQL).

    Frontend Dashboard: Next.js (App Router).

4. Out of Scope (Fitur yang Dieliminasi)

    Image/Vision OCR for Receipts: Dinonaktifkan karena keterbatasan model vision pada API key yang digunakan saat tahap development. Fokus dialihkan penuh pada efisiensi input berbasis teks dan mutasi bank.