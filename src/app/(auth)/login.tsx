import { useLogin } from "@/src/hooks/useLogin";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, createForm, Input, InputGroup } from "panelui-native";
import { Link } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";

type Login = {
  username: string;
  password: string;
};

const SignInForm = createForm<Login>();

const LoginScreen = () => {
  const [hidden, setHidden] = useState(true);
  const insets = useSafeAreaInsets();
  const { loginMutate, isPending } = useLogin();

  const form = SignInForm.useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async (values) => {
      loginMutate({
        username: values.username.trim(),
        password: values.password,
      });
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: insets.top + 16,
          paddingBottom: 40,
          paddingHorizontal: 16,
          gap: 20,
        }}
      >
        <View className="gap-7">
          <View className="w-full items-center justify-center mb-2 gap-2">
            <Image
              source={require("../../../assets/images/logo-new.png")}
              style={{ width: 110, height: 110 }}
            />

            <Text className="w-full text-3xl text-white font-semibold text-center">
              Welcome Back!
            </Text>
            <Text className="w-full text- text-muted-foreground font-normal text-center">
              Pick up where your music left off.
            </Text>
          </View>

          <View className="gap-5">
            <SignInForm form={form}>
              <SignInForm.Field
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
              </SignInForm.Field>

              <SignInForm.Field
                name="password"
                validate={(value) =>
                  !value?.trim() ? "Please enter your password." : undefined
                }
              >
                {(field) => (
                  <InputGroup>
                    <InputGroup.Input
                      secureTextEntry={hidden}
                      variant="filled"
                      label="Password"
                      placeholder="Enter your password"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      errorMessage={field.error}
                      autoCapitalize="none"
                      autoComplete="current-password"
                    />

                    <InputGroup.Suffix className="mt-6.5 self-center items-center justify-center px-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onPress={() => setHidden((prev) => !prev)}
                      >
                        {hidden ? (
                          <EyeOff color="gray" size={18} />
                        ) : (
                          <Eye color="gray" size={18} />
                        )}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                )}
              </SignInForm.Field>

              <Button
                fullWidth
                loading={isPending}
                disabled={isPending}
                onPress={form.handleSubmit}
              >
                {isPending ? "Authenticating..." : "Login"}
              </Button>
            </SignInForm>

            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-muted-foreground font-normal">
                New to Nebula?
              </Text>

              <Link href="/(auth)/signup" className="text-white font-normal">
                Sign up
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
