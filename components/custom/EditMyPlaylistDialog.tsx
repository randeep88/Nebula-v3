import { ActivityIndicator, Image, KeyboardAvoidingView, Pressable, View } from "react-native";
import { Camera } from "lucide-react-native";
import { Button, createForm, Dialog, Input, Item, Text } from "panelui-native";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";

type Edit = {
  playlistId: string;
  name: string;
  coverImage: string;
};

const EditMyPlaylistForm = createForm<Edit>();

const EditProfileContent = ({
  onDone,
  playlist,
}: {
  onDone: () => void;
  playlist: any;
}) => {
  const { pickAndUpload, uploading } = useImageUpload();
  const { updatePlaylist, updatingPlaylist } = useMyPlaylist();

  const form = EditMyPlaylistForm.useForm({
    defaultValues: {
      playlistId: String(playlist?._id ?? ""),
      name: playlist?.name ?? "",
      coverImage: playlist?.coverImage ?? "",
    },

    onSubmit: async (values) => {
      try {
        await updatePlaylist(values);
        onDone();
      } catch (error) {
        console.log("Playlist update failed:", error);
      }
    },
  });

  return (
    <>
      <Dialog.Title>Edit Playlist</Dialog.Title>
      <Dialog.Description>
        Update your Playlist Cover Image and Name.
      </Dialog.Description>

      <View className="gap-4">
        <EditMyPlaylistForm form={form}>
          <EditMyPlaylistForm.Field name="coverImage">
            {(field) => (
              <Pressable
                disabled={uploading}
                onPress={async () => {
                  const url = await pickAndUpload();
                  if (url) field.onChange(url);
                }}
                className="self-center mt-4"
              >
                <View className="size-35 rounded-lg overflow-hidden bg-muted items-center justify-center">
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
                      {playlist?.name?.[0]}
                    </Text>
                  )}
                </View>
                {!uploading && (
                  <View className="absolute bottom-0 right-0 size-8 rounded-md m-0.5 bg-secondary items-center justify-center">
                    <Camera size={16} color="white" />
                  </View>
                )}
              </Pressable>
            )}
          </EditMyPlaylistForm.Field>

          <EditMyPlaylistForm.Field
            name="name"
            validate={(value) =>
              !value?.trim() ? "Please enter your playlist name." : undefined
            }
          >
            {(field) => (
              <Input
                variant="filled"
                label="Playlist Name"
                placeholder="Enter your playlist name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorMessage={field.error}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          </EditMyPlaylistForm.Field>
        </EditMyPlaylistForm>
      </View>

      <Dialog.Footer>
        <Dialog.Close>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          size="sm"
          loading={updatingPlaylist}
          disabled={uploading || updatingPlaylist}
          onPress={() => form.handleSubmit()}
        >
          {updatingPlaylist ? "Saving..." : "Save"}
        </Button>
      </Dialog.Footer>
    </>
  );
};

const EditMyPlaylistDialog = ({
  playlist,
  open,
  onOpenChange,
}: {
  playlist: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        {open && (
          <KeyboardAvoidingView
            behavior={"padding"}
            keyboardVerticalOffset={100}
            style={{ maxHeight: 600 }}
          >
            <EditProfileContent
              onDone={() => onOpenChange(false)}
              playlist={playlist}
            />
          </KeyboardAvoidingView>
        )}
      </Dialog.Content>
    </Dialog>
  );
};
export default EditMyPlaylistDialog;
