import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { checkInvite } from "../../src/lib/auth";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";

export default function InviteScreen() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    const res = await checkInvite(code);
    setBusy(false);
    if (res.ok) {
      router.push({ pathname: "/(auth)/phone", params: { inviteCode: code.trim().toUpperCase() } });
      return;
    }
    if (res.reason === "invalid") setErr("That invite code doesn't look right.");
    else if (res.reason === "already_used") setErr("This invite has already been used.");
    else if (res.reason === "rate_limited") setErr("Too many tries. Wait a minute.");
    else setErr("Something went wrong. Try again.");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter your invite code</Text>
          <Text style={styles.sub}>
            Presenz is invite-only in Bengaluru. If you have a code, enter it below.
          </Text>
        </View>
        <Input
          autoFocus
          autoCapitalize="characters"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="ABCD1234"
          maxLength={16}
          error={err ?? undefined}
          style={styles.codeInput}
        />
        <Button title={busy ? "Checking…" : "Continue"} onPress={submit} disabled={code.length < 4 || busy} />
        <Text style={styles.footer}>
          Don't have a code?{" "}
          <Text style={styles.link} onPress={() => Linking.openURL("https://presenz-opal.vercel.app/waitlist")}>
            Join the waitlist
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, padding: spacing.xl, gap: spacing.xl },
  header: { gap: spacing.sm },
  title: { fontSize: 24, fontWeight: "600", color: colors.ink, letterSpacing: -0.3 },
  sub: { fontSize: 14.5, lineHeight: 21, color: colors.inkMuted },
  codeInput: { textAlign: "center", letterSpacing: 4, fontSize: 18 },
  footer: { fontSize: 13, color: colors.inkMuted, textAlign: "center", marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: "500" },
});
