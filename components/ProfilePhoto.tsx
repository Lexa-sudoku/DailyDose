import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { User, Camera } from "lucide-react-native";
import { colors } from "@/constants/colors";
import * as ImagePicker from "expo-image-picker";
import { translations } from "@/constants/translations";

interface ProfilePhotoProps {
  photoUrl?: string;
  onPhotoSelected: (uri: string) => void;
  size?: number;
  editable?: boolean;
}

export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  photoUrl,
  onPhotoSelected,
  size = 100,
  editable = true,
}) => {
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Требуется разрешение на доступ к галерее");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onPhotoSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.photoContainer,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={[
              styles.photo,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <User size={size * 0.5} color={colors.white} />
        )}
      </View>

      {editable && (
        <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
          <Camera size={16} color={colors.primary} />
          <Text style={styles.changeText}>{translations.changePhoto}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  photoContainer: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    resizeMode: "cover",
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 24,
  },
  changeText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
});
