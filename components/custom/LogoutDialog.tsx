import { Button, Dialog } from "panelui-native";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
};

const LogoutDialog = ({
  open,
  onOpenChange,
  onLogout,
}: LogoutDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Log out?</Dialog.Title>

        <Dialog.Description>
          Are you sure you want to log out of your Nebula account?
        </Dialog.Description>

        <Dialog.Footer>
          <Dialog.Close>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </Dialog.Close>

          <Button
            size="sm"
            variant="destructive"
            onPress={onLogout}
          >
            Log out
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

export default LogoutDialog;