# Ondheros Backend

API REST para ecommerce, desarrollada con Node.js, Express y MongoDB.

Incluye autenticacion, gestion de productos y carrito, checkout, tickets de compra,
integracion con Mercado Pago y flujo manual por WhatsApp.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- Passport (JWT, Local, Google)
- Socket.io
- Nodemailer / SendGrid
- Mocha + Chai + Supertest

## Requisitos

- Node.js 18+
- MongoDB Atlas o local

## Instalacion

1. Entrar a backend:

cd backend

2. Instalar dependencias:

npm install

3. Crear archivo .env en backend con estas variables:

MONGO_URI_DEV=tu_mongo_uri
MONGO_URI_TEST=tu_mongo_uri_test
PORT=8080
SECRET_KEY=tu_secret

ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_WEBHOOK_URL=

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

4. Levantar en desarrollo:

npm run dev

Servidor local: http://localhost:8080

## Scripts

- npm run dev
- npm run test1

## Funcionalidades de pedidos

- Compra desde carrito y generacion de ticket
- Estado de pago del ticket:
    - pending
    - approved
    - in_process
    - rejected
    - cancelled
    - unknown
- Proveedor de pago:
    - mercadopago
    - whatsapp
- Estado de entrega:
    - pending
    - delivered
    - cancelled

## Endpoints de pago (resumen)

- POST /api/payments/mercadopago/preference
    - Crea preferencia de Mercado Pago para un ticket.

- POST /api/payments/mercadopago/webhook
    - Webhook de Mercado Pago para sincronizar estado de pago.

- PATCH /api/payments/mercadopago/tickets/:ticketCode/status
    - Actualiza estado de pago de un ticket (usuario autenticado).

- PATCH /api/payments/whatsapp/tickets/:ticketCode/submit
    - Marca pedido enviado por WhatsApp (usuario autenticado).

- PATCH /api/payments/whatsapp/admin/tickets/:ticketCode/status
    - Accion admin para marcar estado de pago de pedidos por WhatsApp.

- PATCH /api/payments/admin/tickets/:ticketCode/fulfillment
    - Accion admin para estado de entrega (pending, delivered, cancelled).

- PATCH /api/payments/mercadopago/tickets/:ticketCode/cancel
    - Oculta pedido no pagado para usuario (archivado).

## Deploy en Render

Recomendado para este backend:

- Root Directory: backend
- Build Command: npm install
- Start Command: npm run dev (o node src/app.js)

Variables minimas en Render:

- MONGO_URI_DEV
- SECRET_KEY
- ALLOWED_ORIGINS=https://tu-frontend.vercel.app
- FRONTEND_URL=https://tu-frontend.vercel.app
- BACKEND_URL=https://tu-backend.onrender.com
- MERCADOPAGO_ACCESS_TOKEN
- MERCADOPAGO_WEBHOOK_URL=https://tu-backend.onrender.com/api/payments/mercadopago/webhook

## Nota sobre webhook

- En local, Mercado Pago no puede llamar localhost directamente.
- En produccion (Render), la URL publica permite webhook real.
- Se utiliza **Singleton** para la conexión a MongoDB
- Socket.io está configurado para actualizaciones reactivas

## 📧 Contacto y Soporte

Para preguntas o problemas, contacta con el equipo de desarrollo.

---

**Versión:** 1.0.0  
**Autor:** Sulsenti  
**Licencia:** ISC  
**Última actualización:** Febrero 2026
