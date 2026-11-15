import axios from "axios";


export const backendAPI = axios.create({
  baseURL:process.env.EXPO_PUBLIC_BACKEND_URL
});
