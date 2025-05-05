import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Mail, Lock } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/store/auth-store";
import { translations } from "@/constants/translations";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function EditProfileScreen() {
  const { user, updateProfile, updatePassword, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = translations.required;
    }

    if (!email.trim()) {
      newErrors.email = translations.required;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = translations.invalidEmail;
    }

    // Проверяем пароль только если пользователь пытается его изменить
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = translations.required;
      }

      if (!newPassword) {
        newErrors.newPassword = translations.required;
      } else if (newPassword.length < 6) {
        newErrors.newPassword = translations.passwordTooShort;
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = translations.required;
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = translations.passwordsDoNotMatch;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      // Обновляем профиль
      await updateProfile({ name, email });

      // Обновляем пароль, если пользователь его изменил
      if (currentPassword && newPassword) {
        await updatePassword(currentPassword, newPassword);
      }

      router.back();
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const handlePhotoSelected = async (photoUrl: string) => {
    try {
      await updateProfile({ photoUrl });
    } catch (error) {
      console.error("Update photo error:", error);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={[]}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid
          extraScrollHeight={10}
          keyboardShouldPersistTaps="handled"
        >
          <ProfilePhoto
            photoUrl={user?.photoUrl}
            onPhotoSelected={handlePhotoSelected}
          />

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              {translations.editYourProfile}
            </Text>

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
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{translations.password}</Text>

            <Input
              label={translations.currentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••"
              secureTextEntry
              error={errors.currentPassword}
              leftIcon={<Lock size={20} color={colors.darkGray} />}
            />

            <Input
              label={translations.newPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••"
              secureTextEntry
              error={errors.newPassword}
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
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={translations.updateProfile}
              onPress={handleUpdateProfile}
              loading={isLoading}
              style={styles.updateButton}
            />

            <Button
              title={translations.cancel}
              onPress={() => router.back()}
              variant="outline"
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  updateButton: {
    marginBottom: 12,
  },
});
