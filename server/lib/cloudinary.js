import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CHAT_APP_CLOUD_NAME,
    api_key: process.env.CHAT_APP_API_KEY,
    api_secret: process.env.CHAT_APP_SECRET
})
export default cloudinary;