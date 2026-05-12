import { Tabs } from "expo-router";
import { colors } from "../../src/theme/colors";

// Tab navigator scaffold. Real tab screens land in Phase 5c/5d (home, proposals,
// chat, profile, settings). For 5b we ship only the placeholder Home so the
// post-OTP redirect has somewhere to land.

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Today" }} />
    </Tabs>
  );
}
