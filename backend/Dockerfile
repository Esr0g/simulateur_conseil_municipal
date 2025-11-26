FROM python:3.14-alpine3.22
RUN apk add --no-cache \
    build-base \
    cmake 
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
