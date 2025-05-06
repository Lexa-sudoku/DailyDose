import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  Bell,
  HelpCircle,
  Shield,
  ChevronRight,
  PieChart,
  Edit,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/store/auth-store";
import { useMedicationStore } from "@/store/medication-store";
import { translations } from "@/constants/translations";
import { ProfilePhoto } from "@/components/ProfilePhoto";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { getMedicationStats } = useMedicationStore();

  const stats = getMedicationStats();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const navigateToEditProfile = () => {
    router.push("/profile/edit");
  };

  const navigateToNotifications = () => {
    router.push("/profile/notifications");
  };

  const navigateToStatistics = () => {
    router.push("/profile/statistics");
  };

  const navigateToHelp = () => {
    router.push("/profile/help");
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    showBorder = true
  ) => (
    <TouchableOpacity
      style={[styles.menuItem, showBorder && styles.menuItemBorder]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <ChevronRight size={20} color={colors.darkGray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <ProfilePhoto
            photoUrl={user?.photoUrl}
            onPhotoSelected={() => {}}
            size={80}
            editable={false}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={navigateToEditProfile}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={styles.editProfileText}>
                {translations.editProfile}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>
            {translations.medicationStatistics}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>{translations.total}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {stats.taken}
              </Text>
              <Text style={styles.statLabel}>{translations.taken}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {stats.missed}
              </Text>
              <Text style={styles.statLabel}>{translations.missed}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.adherenceRate.toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>{translations.adherence}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>{translations.settings}</Text>

          {renderMenuItem(
            <Bell size={20} color={colors.primary} />,
            translations.notifications,
            navigateToNotifications
          )}

          {renderMenuItem(
            <PieChart size={20} color={colors.primary} />,
            translations.statistics,
            navigateToStatistics
          )}

          {renderMenuItem(
            <HelpCircle size={20} color={colors.primary} />,
            translations.helpAndSupport,
            navigateToHelp
          )}

          {renderMenuItem(
            <Shield size={20} color={colors.primary} />,
            translations.privacySecurity,
            () => {},
            false
          )}
        </View>

        <Button
          title={translations.logOut}
          onPress={handleLogout}
          variant="outline"
          icon={<LogOut size={18} color={colors.primary} />}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  editProfileText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  statsContainer: {
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
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuContainer: {
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
