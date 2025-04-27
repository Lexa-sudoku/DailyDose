import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Button,
  Keyboard,
  Platform,
  InputAccessoryView,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { translations } from "@/constants/translations";

interface InputProps {
  label?: string;
  desc?: string;
  mark?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessoryViewID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  desc,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  accessoryViewID = undefined,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={[]}>
        <View style={[styles.container, style]}>
          {label && (
            <Text style={styles.label}>
              {label}
              {desc && <Text style={styles.desc}>{desc}</Text>}
            </Text>
          )}

          <View
            style={[
              styles.inputContainer,
              error && styles.inputError,
              disabled && styles.inputDisabled,
              multiline && styles.inputMultiline,
            ]}
          >
            {leftIcon && (
              <View style={styles.leftIconContainer}>{leftIcon}</View>
            )}

            <TextInput
              style={[
                styles.input,
                leftIcon ? styles.inputWithLeftIcon : null,
                rightIcon || secureTextEntry ? styles.inputWithRightIcon : null,
                multiline ? styles.textMultiline : null,
                inputStyle,
              ]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.darkGray}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              editable={!disabled}
              multiline={multiline}
              numberOfLines={multiline ? numberOfLines : 1}
              inputAccessoryViewID={accessoryViewID || undefined}
            />
            {secureTextEntry ? (
              <TouchableOpacity
                style={styles.rightIconContainer}
                onPress={togglePasswordVisibility}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color={colors.darkGray} />
                ) : (
                  <Eye size={20} color={colors.darkGray} />
                )}
              </TouchableOpacity>
            ) : (
              rightIcon && (
                <View style={styles.rightIconContainer}>{rightIcon}</View>
              )
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </SafeAreaView>

      {/* кастомная кнопка "Готово" для клавиатуры ios */}
      {Platform.OS === "ios" && accessoryViewID && (
        <InputAccessoryView nativeID={accessoryViewID}>
          <View
            style={{
              height: 40,
              alignItems: "flex-end",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
              }}
            >
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Path
                  d="M100 0 Q 100 100 0 100 L 100 100 Z"
                  fill={colors.mediumGray}
                />
              </Svg>
            </View>
            <View
              style={{
                backgroundColor: colors.mediumGray,
                alignItems: "flex-end",
                borderWidth: 1,
                borderColor: colors.mediumGray,
                borderTopEndRadius: 10,
                borderTopStartRadius: 10,
              }}
            >
              <Button
                onPress={Keyboard.dismiss}
                title={translations.done}
                color={colors.white}
              />
            </View>
            <View
              style={{
                width: 20,
                height: 20,
              }}
            >
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Path
                  d="M0,0 Q0,100 100,100 L0,100 Z"
                  fill={colors.mediumGray}
                />
              </Svg>
            </View>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 16,
  },
  rightIconContainer: {
    paddingRight: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.lightGray,
    borderColor: colors.border,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 70,
    paddingTop: 12,
    paddingBottom: 12,
  },
  textMultiline: {
    height: undefined,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  desc: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
    marginBottom: 8,
  },
});
