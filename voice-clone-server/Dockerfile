FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir "transformers<5" gradio==5.23.0 TTS==0.22.0

COPY app.py .

EXPOSE 7860

CMD ["python", "app.py"]
