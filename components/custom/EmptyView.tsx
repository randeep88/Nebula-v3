import { ReactNode } from "react";
import { View } from "react-native";
import { Button, EmptyState, SearchIcon, Text } from "panelui-native";

export type EmptyAction = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
};

type EmptyViewProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  hint?: string;
  hintIcon?: ReactNode;
  actions?: EmptyAction[];
  fill?: boolean;
  className?: string;
};

const EmptyView = ({
  title,
  description,
  icon,
  hint,
  hintIcon,
  actions,
  fill = false,
  className,
}: EmptyViewProps) => (
  <View
    className={`w-full items-center justify-center gap-0 px-6 ${
      fill ? "flex-1" : "py-20"
    } ${className ?? ""}`}
  >
    <EmptyState className="w-full max-w-full flex-none p-0">
      <EmptyState.Header className="w-full max-w-full flex-none">
        <EmptyState.Media variant="icon">
          {icon ?? <SearchIcon size={18} />}
        </EmptyState.Media>
        <EmptyState.Title className="text-center">{title}</EmptyState.Title>
        {description ? (
          <EmptyState.Description className="text-center">
            {description}
          </EmptyState.Description>
        ) : null}
      </EmptyState.Header>
    </EmptyState>

    {hint ? (
      <View className="max-w-full flex-row items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 mt-5 mb-3">
        {hintIcon}
        <Text size="xs" className="shrink text-muted-foreground">
          {hint}
        </Text>
      </View>
    ) : null}

    {actions && actions.length > 0 ? (
      <View
        className={`max-w-full flex-row flex-wrap items-center justify-center gap-2 ${
          hint ? "" : "mt-4"
        }`}
      >
        {actions.map((action, index) => (
          <Button
            className="rounded-full"
            key={action.label}
            size="sm"
            variant={action.variant ?? (index === 0 ? "primary" : "secondary")}
            disabled={action.disabled}
            onPress={action.onPress}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </View>
    ) : null}
  </View>
);

export const Empty = ({
  label,
  description,
}: {
  label: string;
  description?: string;
}) => (
  <EmptyView
    title={`No ${label} found`}
    description={description ?? "Try adjusting your search or filters."}
  />
);

export default EmptyView;
