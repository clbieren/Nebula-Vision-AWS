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