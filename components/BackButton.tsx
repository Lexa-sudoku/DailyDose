import { colors } from "@/constants/colors";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export const BackButton = () => {
  return (
    <TouchableOpacity
      style={{ marginRight: 10 }}
      onPress={() => router.back()}
      hitSlop={20}
    >
      <ChevronLeft size={24} color={colors.primary} />
    </TouchableOpacity>
  );
};
