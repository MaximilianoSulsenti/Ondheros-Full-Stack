# Ondheros FullStack

Aplicacion ecommerce fullstack para venta de indumentaria y accesorios. El proyecto incluye:

- Frontend en React + Vite
- Backend en Node.js + Express
- Base de datos MongoDB con Mongoose
- Autenticacion con JWT y Google
- Checkout con Mercado Pago y flujo manual por WhatsApp
- Panel admin para gestion de pedidos, pago y entrega

## Estructura del proyecto

- raiz: frontend React
- backend: API Express

## Funcionalidades principales

- Catalogo con categorias y detalle de producto
- Carrito con control de stock
- Compra y generacion de ticket
- Estados de pago: pending, approved, in_process, rejected, cancelled
- Estados de entrega: pending, delivered, cancelled
- Historial de pedidos para usuario
- Gestion de pedidos para admin
- Integracion con Mercado Pago:
  - creacion de preferencia
  - retorno al checkout
  - webhook para sincronizacion de estado en produccion

## Requisitos

- Node.js 18 o superior
- MongoDB Atlas o instancia local

## Configuracion local

### 1) Instalar dependencias

En la carpeta raiz:

npm install

En la carpeta backend:

cd backend
npm install

### 2) Variables de entorno

Frontend (archivo .env en la raiz):

VITE_BACKEND_URL=http://localhost:8080
VITE_MERCADOPAGO_CHECKOUT_URL=

Backend (archivo .env dentro de backend):

MONGO_URI_DEV=tu_mongo_uri
MONGO_URI_TEST=tu_mongo_uri_test
PORT=8080
SECRET_KEY=tu_secret
ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_WEBHOOK_URL=

Opcionales de email y servicios:

MAIL_USER=
MAIL_PASS=
MAIL_FROM=
SENDGRID_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

### 3) Levantar el proyecto

Backend:

cd backend
npm run dev

Frontend:

cd ..
npm run dev

## Scripts utiles

Frontend:

- npm run dev
- npm run build
- npm run preview

Backend:

- npm run dev
- npm run test1

## Deploy recomendado

### Frontend en Vercel

- Root Directory: raiz del repo
- Build Command: npm run build
- Output Directory: dist
- Variable obligatoria:
  - VITE_BACKEND_URL=https://tu-backend.onrender.com

### Backend en Render

- Root Directory: backend
- Build Command: npm install
- Start Command: npm run dev o node src/app.js
- Variables obligatorias:
  - MONGO_URI_DEV
  - SECRET_KEY
  - ALLOWED_ORIGINS=https://tu-frontend.vercel.app
  - FRONTEND_URL=https://tu-frontend.vercel.app
  - BACKEND_URL=https://tu-backend.onrender.com
  - MERCADOPAGO_ACCESS_TOKEN
  - MERCADOPAGO_WEBHOOK_URL=https://tu-backend.onrender.com/api/payments/mercadopago/webhook

## Notas sobre Mercado Pago

- En local, el redirect funciona.
- El webhook real necesita URL publica.
- En produccion, Render provee URL publica para webhook.

## Autor

Maximiliano Sulsenti