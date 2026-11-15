import { Link } from "expo-router";
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
import { useRegister } from "@/src/hooks/useRegister";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";

type Signup = {
  username: string;
  email: string;
  password: string;
};

const SignUpForm = createForm<Signup>();

const SignupScreen = () => {
  const [hidden, setHidden] = useState(true);
  const insets = useSafeAreaInsets();
  const { registerMutate, isPending } = useRegister();

  const form = SignUpForm.useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },

    onSubmit: async (values) => {
      const seed = Date.now() + Math.random();
      const randomUrl = `https://robohash.org/${seed}?set=set1`;

      registerMutate({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        profilePic: randomUrl,
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
              Create Your Account
            </Text>
            <Text className="w-full text- text-muted-foreground font-normal text-center">
              A world of music, just one account away.
            </Text>
          </View>

          <View className="gap-5">
            <SignUpForm form={form}>
              {/* Username */}
              <SignUpForm.Field
                name="username"
                validate={(value) =>
                  !value?.trim() ? "Please enter your username." : undefined
                }
              >
                {(field) => (
                  <Input
                    variant="filled"
                    label="Username"
                    placeholder="Enter a username"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    errorMessage={field.error}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              </SignUpForm.Field>

              {/* Email */}
              <SignUpForm.Field
                name="email"
                validate={(value) => {
                  if (!value?.trim()) return "Please enter your email.";
                  if (!/^\S+@\S+\.\S+$/.test(value.trim()))
                    return "Please enter a valid email address.";
                  return undefined;
                }}
              >
                {(field) => (
                  <Input
                    variant="filled"
                    label="Email"
                    placeholder="Enter your email"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    errorMessage={field.error}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                )}
              </SignUpForm.Field>

              {/* Password */}
              <SignUpForm.Field
                name="password"
                validate={(value) =>
                  !value?.trim()
                    ? "Please enter your password."
                    : value.length < 6
                      ? "Password must be at least 6 characters."
                      : undefined
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
              </SignUpForm.Field>

              {/* Submit */}
              <Button
                fullWidth
                loading={isPending}
                disabled={isPending}
                onPress={form.handleSubmit}
              >
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
            </SignUpForm>

            {/* Login Link */}
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-muted-foreground font-normal">
                Already have an account?
              </Text>

              <Link href="/(auth)/login" className="text-white font-normal">
                Login
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
