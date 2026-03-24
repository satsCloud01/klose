FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir aiofiles

# Copy backend source
COPY backend/src/ ./src/

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

ENV PYTHONPATH=/app/src

EXPOSE 8007

CMD ["uvicorn", "klose.main:app", "--host", "0.0.0.0", "--port", "8007"]
