import { useToast } from "panelui-native";

export type ToastVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive";

type AppToastProps = {
  message: string;
  variant?: ToastVariant;
  description?: string;
  placement?: "top" | "bottom";
  duration?: number;
};

const AppToast = () => {
  const { toast } = useToast();

  const showToast = ({
    message,
    variant = "default",
    description,
    placement = "top",
    duration = 2500,
  }: AppToastProps) => {
    toast.show({
      label: message,
      description,
      variant,
      placement,
      duration,
    });
  };

  return { showToast };
};

export default AppToast;
