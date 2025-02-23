FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++ 

COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend ./

FROM node:20-alpine
WORKDIR /app

COPY --from=backend-builder /app/backend /app/backend

COPY --from=frontend-builder /app/frontend/dist /app/backend/public

EXPOSE 3000 5173

WORKDIR /app/backend
CMD ["node", "index.js"]
