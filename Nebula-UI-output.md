# 📁 PROJECT EXPORT FOR LLMs

## 📊 Project Information

- **Project Name**: `Nebula-UI`
- **Generated On**: 2026-04-28 16:23:40 (Europe/Istanbul / GMT+03:00)
- **Total Files Processed**: 8
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
├── 📄 D
├── 📄 Dockerfile (443 B)
├── 📄 index.html (1.55 KB)
├── 📄 README.md (5.86 KB)
├── 📄 style.css (2.06 KB)
├── 📄 task-definition.json (2.83 KB)
└── 📄 worker.py (2.53 KB)
```

## 📑 Table of Contents

**Project Files:**

- [📄 app.js](#📄-app-js)
- [📄 index.html](#📄-index-html)
- [📄 README.md](#📄-readme-md)
- [📄 style.css](#📄-style-css)
- [📄 task-definition.json](#📄-task-definition-json)
- [📄 worker.py](#📄-worker-py)

---

## 📈 Project Statistics

| Metric | Count |
|--------|-------|
| Total Files | 8 |
| Total Directories | 0 |
| Text Files | 6 |
| Binary Files | 2 |
| Total Size | 19.33 KB |

### 📄 File Types Distribution

| Extension | Count |
|-----------|-------|
| `no extension` | 2 |
| `.js` | 1 |
| `.html` | 1 |
| `.md` | 1 |
| `.css` | 1 |
| `.json` | 1 |
| `.py` | 1 |

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

### <a id="📄-readme-md"></a>📄 `README.md`

**File Info:**
- **Size**: 5.86 KB
- **Extension**: `.md`
- **Language**: `text`
- **Location**: `README.md`
- **Relative Path**: `root`
- **Created**: 2026-04-28 15:56:36 (Europe/Istanbul / GMT+03:00)
- **Modified**: 2026-04-28 16:14:09 (Europe/Istanbul / GMT+03:00)
- **MD5**: `158b0e9fe4388e16edce3e05ac163571`
- **SHA256**: `46c3a9e0232f5f3f8ebceae4c418780041c6826da7a402a7e90327ffa8d24087`
- **Encoding**: UTF-8

**File code content:**

````markdown
# 🌌 Nebula Vision
# Cloud-Native AI Image Analysis Pipeline on AWS

Nebula Vision is a scalable, event-driven image processing system built on AWS.
It analyzes images using AI and delivers real-time insights via a modern web UI.

------------------------------------------------------------
🚀 FEATURES
------------------------------------------------------------

✔ Event-Driven Architecture (S3 + SQS)
✔ Scalable Fargate Workers (Dockerized Python)
✔ AI Image Analysis (AWS Rekognition)
✔ Serverless API Layer (Lambda + API Gateway)
✔ Real-Time UI (Polling-based dashboard)

------------------------------------------------------------
🏗️ ARCHITECTURE
------------------------------------------------------------

        ┌──────────────┐
        │   Frontend   │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ API Gateway  │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   Lambda     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │      S3      │
        └──────┬───────┘
               │ (event)
               ▼
        ┌──────────────┐
        │     SQS      │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ ECS Fargate  │
        │   Worker     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ Rekognition  │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ DynamoDB     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Frontend    │
        └──────────────┘

------------------------------------------------------------
🔄 DATA FLOW
------------------------------------------------------------

1. User uploads image from frontend
2. Image is sent to S3 (via Lambda or pre-signed URL)
3. S3 triggers event → SQS queue
4. Fargate worker consumes message
5. Worker:
   - downloads image
   - sends to Rekognition
   - stores results in DynamoDB
6. Frontend polls API for results

------------------------------------------------------------
🛠️ TECH STACK
------------------------------------------------------------

Cloud:
- AWS S3
- AWS SQS
- AWS ECS (Fargate)
- AWS Rekognition
- AWS DynamoDB
- AWS Lambda
- AWS API Gateway

Backend:
- Python 3.12
- Boto3

Frontend:
- HTML5 / CSS3
- Vanilla JS

DevOps:
- Docker
- AWS ECR
- IAM

------------------------------------------------------------
⚙️ ENV VARIABLES (WORKER)
------------------------------------------------------------

export AWS_REGION=your-region
export SQS_QUEUE_URL=your-queue-url
export S3_BUCKET=your-bucket
export DYNAMODB_TABLE=your-table

------------------------------------------------------------
📦 SETUP
------------------------------------------------------------

# 1. Clone project
git clone https://github.com/clbieren/Nebula-Vision-AWS.git
cd nebula-vision


# 2. Build Docker image
docker build -t nebula-worker .


# 3. Tag image
docker tag nebula-worker:latest <ECR_URI>:latest


# 4. Push to ECR
docker push <ECR_URI>:latest


------------------------------------------------------------
☁️ AWS SETUP (MANUAL)
------------------------------------------------------------

Create:

- S3 Bucket
- SQS Queue
- DynamoDB Table
  Partition Key: ImageName
- ECS Cluster (Fargate)
- ECR Repository

------------------------------------------------------------
🚀 ECS DEPLOY
------------------------------------------------------------

- Create Task Definition
- Use ECR image
- Add environment variables
- Attach IAM Role with:

  ✔ S3 Read
  ✔ SQS Read
  ✔ DynamoDB Write
  ✔ Rekognition Access

------------------------------------------------------------
🔌 API ENDPOINTS
------------------------------------------------------------

POST   /upload
GET    /results/{image_id}

------------------------------------------------------------
🖥️ FRONTEND
------------------------------------------------------------

cd frontend
live-server

# update API URL in app.js
const API_URL = "https://your-api-id.execute-api.region.amazonaws.com"

------------------------------------------------------------
📊 SAMPLE RESPONSE
------------------------------------------------------------

<img width="2443" height="1431" alt="Ekran görüntüsü 2026-04-28 190412" src="https://github.com/user-attachments/assets/6907225f-a6a0-4752-8859-73fa9ebd025a" />


------------------------------------------------------------
🔐 IAM (MINIMUM)
------------------------------------------------------------

- AmazonS3ReadOnlyAccess
- AmazonSQSFullAccess
- AmazonDynamoDBFullAccess
- AmazonRekognitionFullAccess

------------------------------------------------------------
📈 FUTURE IDEAS
------------------------------------------------------------

- WebSocket real-time updates
- Auth (AWS Cognito)
- Batch processing
- Image history UI

------------------------------------------------------------
📄 LICENSE
------------------------------------------------------------

MIT

````

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

### <a id="📄-task-definition-json"></a>📄 `task-definition.json`

**File Info:**
- **Size**: 2.83 KB
- **Extension**: `.json`
- **Language**: `json`
- **Location**: `task-definition.json`
- **Relative Path**: `root`
- **Created**: 2026-04-28 16:10:36 (Europe/Istanbul / GMT+03:00)
- **Modified**: 2026-04-28 16:14:09 (Europe/Istanbul / GMT+03:00)
- **MD5**: `8abdb08ed8befad8e62852179be0ed88`
- **SHA256**: `845b283c0a390ac695287312bd789bbe2aabd93907f58bdc1b64c822c7ca9236`
- **Encoding**: ASCII

**File code content:**

```json
{
    "taskDefinitionArn": "arn:aws:ecs:eu-central-1:290061316029:task-definition/Nebula-Worker-Task:1",
    "containerDefinitions": [
        {
            "name": "nebula-container",
            "image": "290061316029.dkr.ecr.eu-central-1.amazonaws.com/nebula-worker",
            "cpu": 0,
            "portMappings": [
                {
                    "containerPort": 80,
                    "hostPort": 80,
                    "protocol": "tcp",
                    "name": "nebula-container-80-tcp",
                    "appProtocol": "http"
                }
            ],
            "essential": true,
            "environment": [],
            "environmentFiles": [],
            "mountPoints": [],
            "volumesFrom": [],
            "ulimits": [],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/Nebula-Worker-Task",
                    "awslogs-create-group": "true",
                    "awslogs-region": "eu-central-1",
                    "awslogs-stream-prefix": "ecs"
                },
                "secretOptions": []
            },
            "systemControls": []
        }
    ],
    "family": "Nebula-Worker-Task",
    "taskRoleArn": "arn:aws:iam::290061316029:role/NebulaTaskRoleV2",
    "executionRoleArn": "arn:aws:iam::290061316029:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "revision": 1,
    "volumes": [],
    "status": "ACTIVE",
    "requiresAttributes": [
        {
            "name": "com.amazonaws.ecs.capability.logging-driver.awslogs"
        },
        {
            "name": "ecs.capability.execution-role-awslogs"
        },
        {
            "name": "com.amazonaws.ecs.capability.ecr-auth"
        },
        {
            "name": "com.amazonaws.ecs.capability.docker-remote-api.1.19"
        },
        {
            "name": "com.amazonaws.ecs.capability.task-iam-role"
        },
        {
            "name": "ecs.capability.execution-role-ecr-pull"
        },
        {
            "name": "com.amazonaws.ecs.capability.docker-remote-api.1.18"
        },
        {
            "name": "ecs.capability.task-eni"
        },
        {
            "name": "com.amazonaws.ecs.capability.docker-remote-api.1.29"
        }
    ],
    "placementConstraints": [],
    "compatibilities": [
        "EC2",
        "FARGATE",
        "MANAGED_INSTANCES"
    ],
    "runtimePlatform": {
        "cpuArchitecture": "X86_64",
        "operatingSystemFamily": "LINUX"
    },
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "512",
    "memory": "1024",
    "registeredAt": "2026-04-28T14:28:33.267Z",
    "registeredBy": "arn:aws:iam::290061316029:user/eren-admin",
    "enableFaultInjection": false,
    "tags": []
}
```

---

### <a id="📄-worker-py"></a>📄 `worker.py`

**File Info:**
- **Size**: 2.53 KB
- **Extension**: `.py`
- **Language**: `python`
- **Location**: `worker.py`
- **Relative Path**: `root`
- **Created**: 2026-04-28 16:20:03 (Europe/Istanbul / GMT+03:00)
- **Modified**: 2026-04-28 16:20:08 (Europe/Istanbul / GMT+03:00)
- **MD5**: `a982dfab6f8bd524e52eb1f7e88ed6a3`
- **SHA256**: `f60139307b6d1ac941b1fe6003c21e87d4bef740ee23762033bda71ef49209cc`
- **Encoding**: UTF-8

**File code content:**

```python
import boto3
import json
import time

# Servisleri tanımlıyoruz (DynamoDB eklendi)
sqs = boto3.client('sqs', region_name='eu-central-1')
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition', region_name='eu-central-1')
dynamodb = boto3.resource('dynamodb', region_name='eu-central-1')

# Tablomuzu koda bağlıyoruz
table = dynamodb.Table('NebulaResults')

QUEUE_URL = "https://sqs.eu-central-1.amazonaws.com/290061316029/nebula-image-queue"

def process_message(message):
    body = json.loads(message['Body'])
    
    for record in body.get('Records', []):
        bucket_name = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']
        
        print(f"\n--- Yeni İş Bulundu! Dosya: {object_key} ---")
        
        # Rekognition Analizi
        response = rekognition.detect_labels(
            Image={'S3Object': {'Bucket': bucket_name, 'Name': object_key}},
            MaxLabels=5
        )
        
        print("Analiz Sonuçları:")
        detected_labels = []
        for label in response['Labels']:
            print(f"- {label['Name']}: %{label['Confidence']:.2f}")
            # Veritabanı için etiketleri bir listeye topluyoruz
            detected_labels.append({
                'Label': label['Name'],
                'Confidence': str(round(label['Confidence'], 2)) # DynamoDB ondalık sayıları string olarak daha rahat alır
            })
            
        # DYNAMODB'YE KAYIT İŞLEMİ
        try:
            table.put_item(
                Item={
                    'ImageName': object_key,
                    'Labels': detected_labels,
                    'ProcessedTime': str(time.time())
                }
            )
            print(">>> Sonuçlar başarıyla DynamoDB veritabanına kaydedildi! <<<")
        except Exception as e:
            print(f"Veritabanı kayıt hatası: {e}")

def start_worker():
    print("Nebula İşçisi çalışıyor... Kuyruk dinleniyor.")
    while True:
        response = sqs.receive_message(
            QueueUrl=QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20 
        )
        messages = response.get('Messages', [])
        if not messages:
            continue
            
        for msg in messages:
            try:
                process_message(msg)
                sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=msg['ReceiptHandle'])
                print("Mesaj kuyruktan silindi.")
            except Exception as e:
                print(f"İşleme hatası: {e}")

if __name__ == "__main__":
    start_worker()
```

---

## 🚫 Binary/Excluded Files

The following files were not included in the text content:

- `D`
- `Dockerfile`

