import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack, Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Mail, Lock } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/store/auth-store";
import { translations } from "@/constants/translations";
import { useSettingsStore } from "@/store/settings-store";
import { ErrorModal } from "@/components/ErrorModal";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signup, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) {
      newErrors.name = translations.required;
    }

    if (!email) {
      newErrors.email = translations.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
      newErrors.email = translations.invalidEmail;
    }

    if (!password) {
      newErrors.password = translations.required;
    } else if (password.length < 6) {
      newErrors.password = translations.passwordTooShort;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = translations.required;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = translations.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signup(Date.now().toString(), name, email, password);
      useSettingsStore.getState().setDefaultSettings();
      router.replace("/");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>{translations.createAccount}</Text>
            <Text style={styles.subtitle}>{translations.signUpToStart}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={translations.name}
              value={name}
              onChangeText={setName}
              placeholder="Иван Иванов"
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<User size={20} color={colors.darkGray} />}
            />

            <Input
              label={translations.email}
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color={colors.darkGray} />}
            />

            <Input
              label={translations.password}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              secureTextEntry
              error={errors.password}
              leftIcon={<Lock size={20} color={colors.darkGray} />}
            />

            <Input
              label={translations.confirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••"
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color={colors.darkGray} />}
            />

            <Button
              title={translations.signUp}
              onPress={handleSignup}
              loading={isLoading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {translations.alreadyHaveAccount}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>{translations.signIn}</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ErrorModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
});
