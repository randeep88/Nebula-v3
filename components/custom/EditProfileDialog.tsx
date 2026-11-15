import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  View,
} from "react-native";
import { Camera, UserPen } from "lucide-react-native";
import {
  Button,
  createForm,
  Dialog,
  Input,
  Text,
  usePanelside,
} from "panelui-native";
import useUser from "@/src/hooks/useUser";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { useUpdateProfile } from "@/src/hooks/useUpdateProfile";

type Edit = {
  username: string;
  profilePic: string;
};

const EditProfileForm = createForm<Edit>();

const EditProfileContent = ({ onDone }: { onDone: () => void }) => {
  const { user, refetchUser } = useUser();
  const { pickAndUpload, uploading } = useImageUpload();
  const { updateProfile, saving } = useUpdateProfile();

  const form = EditProfileForm.useForm({
    defaultValues: {
      username: user?.username ?? "",
      profilePic: user?.profilePic ?? "",
    },
    onSubmit: async (values) => {
      const ok = await updateProfile(values);
      if (ok) {
        refetchUser();
        onDone();
      }
    },
  });

  return (
    <>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Update your photo and username.</Dialog.Description>

      <View className="gap-4">
        <EditProfileForm form={form}>
          <EditProfileForm.Field name="profilePic">
            {(field) => (
              <Pressable
                disabled={uploading}
                onPress={async () => {
                  const url = await pickAndUpload();
                  if (url) field.onChange(url);
                }}
                className="self-center mt-4"
              >
                <View className="size-35 rounded-full overflow-hidden bg-muted items-center justify-center">
                  {uploading ? (
                    <ActivityIndicator color="#d1d5db" />
                  ) : field.value ? (
                    <Image
                      source={{ uri: field.value }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text size="3xl" weight="bold">
                      {user?.username?.[0]}
                    </Text>
                  )}
                </View>
                {!uploading && (
                  <View className="absolute bottom-0 right-0 size-8 rounded-full bg-primary items-center justify-center border-2 border-background">
                    <Camera size={16} color="white" />
                  </View>
                )}
              </Pressable>
            )}
          </EditProfileForm.Field>

          <EditProfileForm.Field
            name="username"
            validate={(value) =>
              !value?.trim() ? "Please enter your username." : undefined
            }
          >
            {(field) => (
              <Input
                variant="filled"
                label="Username"
                placeholder="Enter your username"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorMessage={field.error}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          </EditProfileForm.Field>
        </EditProfileForm>

        <Input
          variant="filled"
          label="Email"
          disabled
          value={user?.email ?? ""}
          editable={false}
          readOnly
        />
      </View>

      <Dialog.Footer>
        <Dialog.Close>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          size="sm"
          disabled={uploading || saving}
          onPress={() => form.handleSubmit()}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </Dialog.Footer>
    </>
  );
};

const EditProfileDialog = () => {
  const [open, setOpen] = useState(false);
  const { isLoading, isFetching } = useUser();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button loading={isLoading || isFetching} variant="social" size="sm">
          <UserPen size={18} color="white" />
          Edit profile
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        {open && (
          <KeyboardAvoidingView
            behavior={"padding"}
            keyboardVerticalOffset={100}
            style={{ maxHeight: 600 }}
          >
            <EditProfileContent
              onDone={() => {
                setOpen(false);
              }}
            />
          </KeyboardAvoidingView>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

export default EditProfileDialog;
