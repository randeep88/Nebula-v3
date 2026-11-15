import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  View,
} from "react-native";
import { Camera, Plus } from "lucide-react-native";
import { Button, createForm, Dialog, Input } from "panelui-native";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import { useState } from "react";

const DEFAULT_COVER = "https://ik.imagekit.io/yxxt8q97s/gray-logo.png";

type Create = {
  name: string;
  coverImage: string;
};

const CreateMyPlaylistForm = createForm<Create>();

const CreateMyPlaylistContent = ({ onDone }: { onDone: () => void }) => {
  const { pickAndUpload, uploading } = useImageUpload();
  const { createPlaylist, creatingPlaylist } = useMyPlaylist();

  const form = CreateMyPlaylistForm.useForm({
    defaultValues: {
      name: "",
      coverImage: DEFAULT_COVER,
    },

    onSubmit: (values) => {
      createPlaylist(
        {
          name: values.name.trim(),
          coverImage: values.coverImage || DEFAULT_COVER,
        },
        { onSuccess: onDone },
      );
    },
  });

  return (
    <>
      <Dialog.Title>Create Playlist</Dialog.Title>
      <Dialog.Description>
        Give your playlist a name and choose a cover image.
      </Dialog.Description>

      <View className="gap-4">
        <CreateMyPlaylistForm form={form}>
          <CreateMyPlaylistForm.Field name="coverImage">
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
                  ) : (
                    <Image
                      source={{ uri: field.value || DEFAULT_COVER }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  )}
                </View>
                {!uploading && (
                  <View className="absolute bottom-0 right-0 size-8 rounded-md bg-secondary m-0.5 items-center justify-center">
                    <Camera size={16} color="white" />
                  </View>
                )}
              </Pressable>
            )}
          </CreateMyPlaylistForm.Field>

          <CreateMyPlaylistForm.Field
            name="name"
            validate={(value) =>
              !value?.trim() ? "Please enter a playlist name." : undefined
            }
          >
            {(field) => (
              <Input
                variant="filled"
                label="Playlist Name"
                placeholder="e.g. My Favorites"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorMessage={field.error}
                autoCapitalize="sentences"
                autoCorrect={false}
              />
            )}
          </CreateMyPlaylistForm.Field>
        </CreateMyPlaylistForm>
      </View>

      <Dialog.Footer>
        <Dialog.Close>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          size="sm"
          loading={creatingPlaylist}
          disabled={uploading || creatingPlaylist}
          onPress={() => form.handleSubmit()}
        >
          {creatingPlaylist ? "Creating..." : "Create Playlist"}
        </Button>
      </Dialog.Footer>
    </>
  );
};

type CreateMyPlaylistDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

const CreateMyPlaylistDialog = ({
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: CreateMyPlaylistDialogProps) => {
  const [innerOpen, setInnerOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : innerOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) setInnerOpen(value);
    onOpenChange?.(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <Dialog.Trigger>
          <Button size="sm" variant="ghost" className="rounded-full size-5">
            <Plus color="white" />
          </Button>
        </Dialog.Trigger>
      )}
      <Dialog.Content>
        <KeyboardAvoidingView
          behavior={"padding"}
          keyboardVerticalOffset={100}
          style={{ maxHeight: 600 }}
        >
          {open && <CreateMyPlaylistContent onDone={() => setOpen(false)} />}
        </KeyboardAvoidingView>
      </Dialog.Content>
    </Dialog>
  );
};

export default CreateMyPlaylistDialog;