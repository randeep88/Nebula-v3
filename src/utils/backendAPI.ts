import axios from "axios";


export const backendAPI = axios.create({
  baseURL: "https://nebula-backend-wzrs.onrender.com",
  // baseURL: "http://localhost:3000",
  // baseURL: "http://192.168.1.40:3000",
});
