import React from "react";
import {
  Pill,
  Stethoscope,
  Heart,
  Activity,
  Droplet,
  Thermometer,
  Syringe,
  Bandage,
  Brain,
  Eye,
  Ear,
  Bone,
} from "lucide-react-native";
import { colors } from "@/constants/colors";

interface MedicationIconProps {
  iconName: string;
  color?: string;
  size?: number;
}

export const MedicationIcon: React.FC<MedicationIconProps> = ({
  iconName,
  color = colors.primary,
  size = 24,
}) => {
  const renderIcon = () => {
    switch (iconName) {
      case "Pill":
        return <Pill size={size} color={color} />;
      case "Stethoscope":
        return <Stethoscope size={size} color={color} />;
      case "Heart":
        return <Heart size={size} color={color} />;
      case "Activity":
        return <Activity size={size} color={color} />;
      case "Droplet":
        return <Droplet size={size} color={color} />;
      case "Thermometer":
        return <Thermometer size={size} color={color} />;
      case "Syringe":
        return <Syringe size={size} color={color} />;
      case "Bandage":
        return <Bandage size={size} color={color} />;
      case "Brain":
        return <Brain size={size} color={color} />;
      case "Eye":
        return <Eye size={size} color={color} />;
      case "Ear":
        return <Ear size={size} color={color} />;
      case "Bone":
        return <Bone size={size} color={color} />;
      default:
        return <Pill size={size} color={color} />;
    }
  };

  return renderIcon();
};
