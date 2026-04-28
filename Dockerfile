# 1. Temel resmi seç (Hafif bir Python sürümü)
FROM python:3.12-slim

# 2. Çalışma klasörünü oluştur
WORKDIR /app

# 3. Gerekli kütüphaneleri yükle (boto3 şart)
RUN pip install --no-cache-dir boto3

# 4. Kendi Python kodunu bilgisayardan konteynerin içine kopyala
# (NOT: worker.py dosyasının bu klasörde olduğundan emin ol!)
COPY worker.py .

# 5. Konteyner çalıştığında başlayacak komut
CMD ["python", "worker.py"]