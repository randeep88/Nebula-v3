import { useState } from "react";
import { useToast } from "panelui-native";
import { pickImage } from "@/src/utils/pickImage";
import { uploadImage } from "@/src/utils/uploadImage";
import AppToast from "@/components/custom/Toast";

export const useImageUpload = () => {
  const { showToast } = AppToast();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async (): Promise<string | null> => {
    const uri = await pickImage();
    if (!uri) return null;

    setUploading(true);
    try {
      return await uploadImage(uri);
    } catch (err: any) {
      showToast({
        message: err?.message || "Image upload failed",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { pickAndUpload, uploading };
};
