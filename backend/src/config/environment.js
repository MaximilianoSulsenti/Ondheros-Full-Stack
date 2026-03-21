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
    BACKEND_URL: process.env.BACKEND_URL
};