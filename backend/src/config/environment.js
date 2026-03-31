import { config } from "dotenv";
config();

export const env = {
    MONGO_URI_DEV: process.env.MONGO_URI_DEV,
    MONGO_URI_TEST: process.env.MONGO_URI_TEST,
    PORT: process.env.PORT,
    SECRET_KEY: process.env.SECRET_KEY,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    MAIL_FROM: process.env.MAIL_FROM,
    BACKEND_URL: process.env.BACKEND_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
};
