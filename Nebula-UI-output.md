# 📁 PROJECT EXPORT FOR LLMs

## 📊 Project Information

- **Project Name**: `Nebula-UI`
- **Generated On**: 2026-04-28 15:45:37 (Europe/Istanbul / GMT+03:00)
- **Total Files Processed**: 3
- **Export Tool**: Easy Whole Project to Single Text File for LLMs v1.1.0
- **Tool Author**: Jota / José Guilherme Pandolfi

### ⚙️ Export Configuration

| Setting | Value |
|---------|-------|
| Language | `en` |
| Max File Size | `1 MB` |
| Include Hidden Files | `false` |
| Output Format | `both` |

## 🌳 Project Structure

```
├── 📄 app.js (4.07 KB)
├── 📄 index.html (1.55 KB)
└── 📄 style.css (2.06 KB)
```

## 📑 Table of Contents

**Project Files:**

- [📄 app.js](#📄-app-js)
- [📄 index.html](#📄-index-html)
- [📄 style.css](#📄-style-css)

---

## 📈 Project Statistics

| Metric | Count |
|--------|-------|
| Total Files | 3 |
| Total Directories | 0 |
| Text Files | 3 |
| Binary Files | 0 |
| Total Size | 7.69 KB |

### 📄 File Types Distribution

| Extension | Count |
|-----------|-------|
| `.js` | 1 |
| `.html` | 1 |
| `.css` | 1 |

## 💻 File Code Contents

### <a id="📄-app-js"></a>📄 `app.js`

**File Info:**
- **Size**: 4.07 KB
- **Extension**: `.js`
- **Language**: `javascript`
- **Location**: `app.js`
- **Relative Path**: `root`
- **Created**: 2026-04-25 14:35:38 (Europe/Istanbul / GMT+03:00)
- **Modified**: 2026-04-28 15:45:37 (Europe/Istanbul / GMT+03:00)
- **MD5**: `780207a83b567d1d2d4aabaff9d7b976`
- **SHA256**: `b0372b3af7c39fd7fe5b8b8c517f74d89d69b159d1f7d3d14b664ad7abc1a0d0`
- **Encoding**: UTF-8

**File code content:**

```javascript
// 🚨 API Gateway URL'miz (Kusursuz yerleştirilmiş)
const API_URL = "https://3vwyqnw2bj.execute-api.eu-central-1.amazonaws.com"; 

const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const statusPanel = document.getElementById('status-panel');
const statusText = document.getElementById('status-text');
const resultsPanel = document.getElementById('results-panel');
const labelsList = document.getElementById('labels-list');

// Dosya seçildiğinde tetiklenir
fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        startRealUpload(file);
    }
});

// 1. AŞAMA: Resmi AWS'ye Gönder
function startRealUpload(file) {
    dropZone.style.display = 'none';
    statusPanel.style.display = 'block';
    resultsPanel.style.display = 'none';
    
    statusText.innerHTML = `<span style="color:#00d4ff;">${file.name}</span> AWS S3'e Şifrelenerek Yükleniyor...`;

    // Resmi internetten yollayabilmek için metin formatına (Base64) çeviriyoruz
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // "data:image/jpeg;base64," başlığını kesip atıyoruz
        const base64Data = reader.result.split(',')[1];

        const payload = {
            action: 'upload',
            filename: file.name,
            image: base64Data
        };

        // Kuryeye (Lambda) paketi veriyoruz
        fetch(API_URL + '/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            statusText.innerHTML = `Motor Çalıştı! Yapay Zeka Analiz Ediyor... ⏳`;
            // Resim depoya ulaştı, şimdi DynamoDB'ye gidip sonucu sorma vakti!
            pollForResult(file.name);
        })
        .catch(error => {
            statusText.innerHTML = `<span style="color:red;">HATA: ${error.message}</span>`;
        });
    };
}

// 2. AŞAMA: İşçiye (Fargate) "İşin Bitti mi?" Diye Sor (Polling)
function pollForResult(filename) {
    const payload = {
        action: 'get_result',
        filename: filename
    };

    fetch(API_URL + '/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Lambda bize "202" dönerse, işçi (Fargate) henüz işlemi bitirmemiş demektir.
        if (response.status === 202) {
            console.log("Hala işleniyor, 3 saniye sonra tekrar sorulacak...");
            setTimeout(() => pollForResult(filename), 3000); 
            return null;
        }
        // Eğer 200 dönerse sonuç gelmiştir!
        return response.json();
    })
    .then(data => {
        if(data) {
            showRealResults(data);
        }
    })
    .catch(error => {
        console.error("Sonuç çekilirken ağ hatası:", error);
        setTimeout(() => pollForResult(filename), 3000);
    });
}

// 3. AŞAMA: Gelen Gerçek Veriyi Ekrana Bas!
function showRealResults(data) {
    statusPanel.style.display = 'none';
    resultsPanel.style.display = 'block';
    labelsList.innerHTML = '';

    console.log("AWS'den Gelen Ham Veri:", data);

    const labels = data.Labels || data.labels || []; 
    
    if (labels.length === 0) {
         labelsList.innerHTML = `<li><span style="color:#ffcc00;">Analiz tamamlandı ancak veri okunamadı.</span></li>`;
         return;
    }

    labels.forEach(lbl => {
        // 🚨 BURAYI GÜNCELLEDİK: Bütün ihtimalleri deniyoruz
        let name = lbl.Name || lbl.name || lbl.Label || lbl.label || lbl.Object || "Bilinmiyor";
        let conf = lbl.Confidence || lbl.confidence || lbl.Rate || 0;
        
        // Sayıyı güzelleştir
        let displayConf = parseFloat(conf).toFixed(2);

        labelsList.innerHTML += `
            <li>
                <span>${name}</span>
                <span style="color:#00d4ff; font-weight:bold;">%${displayConf}</span>
            </li>
        `;
    });
}
```

---

### <a id="📄-index-html"></a>📄 `index.html`

**File Info:**
- **Size**: 1.55 KB
- **Extension**: `.html`
- **Language**: `html`
- **Location**: `index.html`
- **Relative Path**: `root`
- **Created**: 2026-04-25 14:35:12 (Europe/Istanbul / GMT+03:00)
- **Modified**: 2026-04-25 14:35:15 (Europe/Istanbul / GMT+03:00)
- **MD5**: `73949159f201cd6ef3d402895a513251`
- **SHA256**: `80ad9b55e435faf3ee099cc027f9a31ac0140bf7303d38f8ce8ed0a8194e103f`
- **Encoding**: UTF-8

**File code content:**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nebula AI - Görüntü Analiz Motoru</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <h1 class="glow-text">NEBULA <span class="accent">CORE</span></h1>
            <p>AWS Rekognition Destekli Görüntü İşleme Modülü</p>
        </header>

        <main>
            <div class="upload-zone" id="drop-zone">
                <input type="file" id="file-input" accept="image/*" hidden>
                <div class="upload-content">
                    <span class="icon">📷</span>
                    <h3>Fotoğrafı Buraya Sürükle</h3>
                    <p>veya</p>
                    <button class="btn-neon" onclick="document.getElementById('file-input').click()">Bilgisayardan Seç</button>
                </div>
            </div>

            <div class="status-panel" id="status-panel" style="display: none;">
                <div class="loader"></div>
                <p id="status-text">Sisteme Yükleniyor...</p>
            </div>

            <div class="results-panel" id="results-panel" style="display: none;">
                <h3>🧠 Yapay Zeka Analizi</h3>
                <ul id="labels-list">
                    </ul>
            </div>
        </main>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

---

### <a id="📄-style-css"></a>📄 `style.css`

**File Info:**
- **Size**: 2.06 KB
- **Extension**: `.css`
- **Language**: `css`
- **Location**: `style.css`
- **Relative Path**: `root`
- **Created**: 2026-04-25 14:35:26 (Europe/Istanbul / GMT+03:00)
- **Modified**: 2026-04-25 14:35:28 (Europe/Istanbul / GMT+03:00)
- **MD5**: `c14e02a771b5bf1d3be27475aef08ebe`
- **SHA256**: `7fc0a949750553d3047814c716415cc8c3744ae4f1a47d90a75e6bee22f70c42`
- **Encoding**: ASCII

**File code content:**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Rajdhani', sans-serif;
}

body {
    background-color: #0a0a0f;
    color: #e0e0e0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #0a0a0f 70%);
}

.container {
    width: 100%;
    max-width: 600px;
    padding: 2rem;
    background: rgba(16, 16, 24, 0.8);
    border: 1px solid #2a2a3f;
    border-radius: 15px;
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.1);
    backdrop-filter: blur(10px);
}

header {
    text-align: center;
    margin-bottom: 2rem;
}

.glow-text {
    font-size: 3rem;
    letter-spacing: 4px;
    color: #fff;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.7), 0 0 20px rgba(0, 212, 255, 0.5);
}

.accent {
    color: #00d4ff;
}

.upload-zone {
    border: 2px dashed #00d4ff;
    border-radius: 10px;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background: rgba(0, 212, 255, 0.05);
}

.upload-zone:hover {
    background: rgba(0, 212, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
}

.btn-neon {
    background: transparent;
    color: #00d4ff;
    border: 1px solid #00d4ff;
    padding: 10px 25px;
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 15px;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.btn-neon:hover {
    background: #00d4ff;
    color: #000;
    box-shadow: 0 0 15px #00d4ff;
}

.status-panel, .results-panel {
    margin-top: 2rem;
    text-align: center;
    padding: 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
}

#labels-list {
    list-style: none;
    margin-top: 1rem;
    text-align: left;
}

#labels-list li {
    background: #1a1a2e;
    padding: 10px 15px;
    margin-bottom: 8px;
    border-left: 4px solid #00d4ff;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
}
```

---

