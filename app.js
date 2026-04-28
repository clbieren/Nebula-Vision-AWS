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