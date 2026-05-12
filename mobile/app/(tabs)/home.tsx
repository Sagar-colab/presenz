import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { signOut } from "../../src/lib/auth";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";

// Phase 5b placeholder. Proves the auth flow works end-to-end by showing
// "you're in" + a sign-out path. Real dashboard ships in Phase 5d.

export default function HomePlaceholder() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/invite");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Phase 5b · scaffold</Text>
        <Text style={styles.title}>You're signed in.</Text>
        <Text style={styles.body}>
          The dashboard, match flow, proposals and chat ship in Phase 5d. Today's milestone:
          a real Bengaluru beta user can install the app, enter their invite code, sign in,
          and reach this screen with a valid bearer token on every API call.
        </Text>
        <View style={{ height: spacing.xl }} />
        <Button title="Sign out" onPress={handleSignOut} variant="ghost" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, padding: spacing.xl, gap: spacing.md },
  eyebrow: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.inkFaint,
  },
  title: { fontSize: 24, fontWeight: "600", color: colors.ink, letterSpacing: -0.3 },
  body: { fontSize: 14.5, lineHeight: 21, color: colors.inkMuted },
});
