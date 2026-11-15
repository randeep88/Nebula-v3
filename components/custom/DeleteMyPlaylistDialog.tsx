import { Button, Dialog } from "panelui-native";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";

const DeleteProfileContent = ({
  onDone,
  playlist,
}: {
  onDone: () => void;
  playlist: any;
}) => {
  const { deletePlaylist, deletingPlaylist } = useMyPlaylist();

  return (
    <>
      <Dialog.Title>Delete "{playlist?.name}"</Dialog.Title>

      <Dialog.Description>
        Are you sure you want to delete this playlist?
      </Dialog.Description>

      <Dialog.Footer>
        <Dialog.Close>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </Dialog.Close>

        <Button
          size="sm"
          loading={deletingPlaylist}
          disabled={deletingPlaylist}
          variant="destructive"
          onPress={() => {
            deletePlaylist(
              { playlistId: playlist?._id },
              {
                onSuccess: () => onDone(),
              },
            );
          }}
        >
          {deletingPlaylist ? "Deleting..." : "Delete"}
        </Button>
      </Dialog.Footer>
    </>
  );
};

const DeleteMyPlaylistDialog = ({
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
          <DeleteProfileContent
            onDone={() => onOpenChange(false)}
            playlist={playlist}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};

export default DeleteMyPlaylistDialog;