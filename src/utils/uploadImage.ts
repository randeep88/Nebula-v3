import { File } from "expo-file-system";

const IMAGEKIT_PUBLIC_KEY = process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY;

export const uploadImage = async (uri: string): Promise<string> => {
  const base64 = await new File(uri).base64();

  const formData = new FormData();
  formData.append("file", base64);
  formData.append("fileName", "image.jpg");
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY!);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: "Basic " + btoa(IMAGEKIT_PRIVATE_KEY + ":"),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.url) {
    throw new Error(data?.message || `Image upload failed (${res.status})`);
  }

  return data.url as string;
};