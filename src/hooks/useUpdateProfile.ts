import { useState } from "react";
import { useToast } from "panelui-native";
import useUser from "@/src/hooks/useUser";
import { backendAPI } from "@/src/utils/backendAPI";
import AppToast from "@/components/custom/Toast";

type UpdateProfileInput = {
  username: string;
  profilePic: string;
};

export const useUpdateProfile = () => {
  const { user, token, refetchUser } = useUser();
  const { showToast } = AppToast();
  const [saving, setSaving] = useState(false);

  const updateProfile = async (
    values: UpdateProfileInput,
  ): Promise<boolean> => {
    if (!token) {
      showToast({
        message: "User not found, Please login again",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      await backendAPI.patch(
        "/auth/user-update",
        {
          profilePic: values.profilePic || user?.profilePic,
          username: values.username.trim() || user?.username,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      showToast({
        message: "Profile updated successfully",
        variant: "success",
      });
      await refetchUser();
      return true;
    } catch (err) {
       showToast({
        message: "Failed to update profile",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { updateProfile, saving };
};
