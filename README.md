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
git clone https://github.com/your-username/nebula-vision.git
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
  Partition Key: image_id
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

{
  "image_id": "12345",
  "labels": [
    { "name": "Car", "confidence": 98.2 },
    { "name": "Road", "confidence": 95.1 }
  ],
  "status": "completed"
}

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