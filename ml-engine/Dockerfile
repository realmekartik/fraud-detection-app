# Use Python 3.10 slim image
FROM python:3.10-slim

WORKDIR /app

# Install build dependencies required by scikit-learn and shap
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY main.py .

# Expose the API port
EXPOSE 8000

# Start the FastAPI engine
CMD ["python", "main.py"]
