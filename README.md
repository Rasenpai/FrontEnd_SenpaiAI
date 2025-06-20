# SenpaiAI 🤖

**Asisten Virtual Berbasis AI untuk Indonesia**

SenpaiAI adalah asisten virtual berbasis kecerdasan buatan yang dikembangkan khusus untuk membantu menjawab berbagai pertanyaan dengan cepat dan akurat. Sistem ini menggunakan teknologi AI terdepan untuk memberikan pengalaman interaksi yang natural dan responsif.

## ✨ Fitur Utama

- 🗣️ **Percakapan Natural**: Interface chat yang intuitif dan responsif
- 🧠 **AI Cerdas**: Sistem AI bertingkat dengan dataset 1000+ pertanyaan jawaban
- 🎯 **Smart Routing**: Pencarian di dataset lokal → Groq API → Google Gemini (failover system)
- 🌐 **Bahasa Indonesia**: Dioptimalkan untuk bahasa Indonesia
- 📱 **Responsive Design**: Dapat diakses dari berbagai perangkat
- ⚡ **Real-time Response**: Respon cepat dan real-time
- 📊 **Large Dataset**: Dataset berisi 1000+ pasangan pertanyaan dan jawaban
- 🔄 **Intelligent Fallback**: Sistem cadangan otomatis jika AI utama mengalami limit

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React.js** - Library JavaScript untuk membangun user interface
- **Vite** - Build tool dan development server yang cepat
- **Tailwind CSS** - Framework CSS utility-first

### Backend
- **Python** - Bahasa pemrograman utama
- **Flask** - Web framework Python yang ringan
- **Flask-CORS** - Untuk menangani Cross-Origin Resource Sharing

### AI & Machine Learning
- **Dataset Lokal** - 1000+ pertanyaan dan jawaban untuk respons instan
- **Groq API** - Platform AI primary untuk inferensi yang cepat
- **Google Generative AI** - Backup AI ketika Groq mencapai limit
- **Smart Routing** - Sistem otomatis untuk memilih sumber jawaban terbaik

### Data Processing
- **Pandas** - Data manipulation dan analysis
- **NumPy** - Numerical computing
- **Custom Dataset Handler** - Pengelolaan dataset pertanyaan-jawaban lokal

## 📁 Struktur Project

```
WEB_CHATBOT/
├── Backend/
│   ├── data/           # Data files dan database
│   ├── images/         # Image processing
│   ├── static/         # Static files
│   ├── uploads/        # File uploads
│   ├── venv/           # Virtual environment
│   ├── app.py          # Main Flask application
│   ├── requirements.txt # Python dependencies
│   └── ...
└── Frontend/
    ├── public/         # Public assets
    ├── src/
    │   ├── assets/     # Static assets
    │   ├── components/ # React components
    │   │   ├── Navbar.jsx
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   └── ...
    ├── package.json    # Node.js dependencies
    └── ...
```

## 🚀 Instalasi dan Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm atau yarn

### Backend Setup

1. **Clone repository**
   ```bash
   git clone [repository-url]
   cd WEB_CHATBOT/Backend
   ```

2. **Buat virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # atau
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file dengan API keys yang diperlukan
   ```

5. **Jalankan server**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Pindah ke direktori frontend**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

## 🔧 Konfigurasi

### Environment Variables (.env)

```env
# Google AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Groq AI
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

## 🤖 Cara Kerja AI System

SenpaiAI menggunakan sistem AI bertingkat yang cerdas:

1. **Dataset Lokal (Priority 1)**: 
   - Sistem pertama mencari jawaban di dataset lokal berisi 1000+ pertanyaan jawaban
   - Memberikan respons instan tanpa API call
   - Dioptimalkan untuk pertanyaan umum dan FAQ

2. **Groq API (Priority 2)**:
   - Jika tidak ditemukan di dataset lokal, pertanyaan diteruskan ke Groq
   - AI yang cepat dan efisien untuk pertanyaan kompleks
   - Handling otomatis untuk rate limiting

3. **Google Gemini (Backup)**:
   - Sistem fallback ketika Groq mencapai rate limit
   - Memastikan service tetap tersedia 24/7
   - Backup yang reliable untuk kontinuitas layanan

## 📝 API Endpoints

### Main Endpoint
- `POST /ask` - Endpoint utama untuk mengirim pertanyaan ke sistem AI

**Request Format:**
```json
{
  "question": "Pertanyaan pengguna",
  "context": "Konteks opsional"
}
```

**Response Format:**
```json
{
  "answer": "Jawaban dari AI",
  "source": "local_dataset|groq|gemini",
  "response_time": 0.5
}
```

## 🎯 Cara Penggunaan

1. **Akses aplikasi** melalui browser di `http://localhost:5173`
2. **Mulai percakapan** dengan mengetik pertanyaan di chat box
3. **Sistem akan otomatis**:
   - Mencari di dataset lokal terlebih dahulu
   - Menggunakan Groq jika tidak ditemukan
   - Fallback ke Gemini jika Groq limit
4. **Dapatkan respons** yang cepat dan akurat

## 🧪 Testing

### Backend Testing
```bash
cd Backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd Frontend
npm test
```

## 📦 Deployment

### Production Build

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
gunicorn --bind 0.0.0.0:8000 app:app
```

### Docker Deployment
```bash
docker-compose up --build
```

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tim Pengembang

- **Frontend Developer** - React.js, UI/UX
- **Backend Developer** - Python, Flask, AI Integration
- **AI Engineer** - Model optimization, prompt engineering

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

-  [Instagram](https://www.instagram.com/rrssnaaa)
-  [TikTok](https://www.tiktok.com/@hyrasena)

## 🔄 Roadmap & Development

### Phase 1 (Completed) ✅
- ✅ Setup dasar sistem chat
- ✅ Integrasi dataset lokal 1000+ Q&A
- ✅ Implementasi Groq API
- ✅ Setup Google Gemini sebagai backup
- ✅ Smart routing system

### Phase 2 (In Progress) 🚧
- 🔄 Optimasi algoritma pencarian dataset
- 🔄 Peningkatan accuracy AI responses
- 🔄 Analytics dan monitoring system
- 🔄 Rate limiting yang lebih efisien

### Phase 3 (Planned) 📋
- 📋 Ekspansi dataset hingga 5000+ Q&A
- 📋 Multi-language support
- 📋 Voice interaction
- 📋 Advanced conversation memory

---

**Made with ❤️ by Rasana**

*Asisten virtual terbaik untuk Indonesia* 🇮🇩