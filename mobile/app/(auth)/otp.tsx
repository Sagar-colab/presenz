import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { signInWithOtp } from "../../src/lib/auth";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";

const REASON_MAP: Record<string, string> = {
  invalid_code: "That code didn't match.",
  invite_required: "An invite code is required to join.",
  invite_invalid: "That invite code isn't valid.",
  rate_limited: "Too many attempts. Wait a moment.",
  network: "Network error. Check your connection.",
};

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy || code.length !== 6) return;
    setBusy(true);
    setErr(null);
    const res = await signInWithOtp(phone, code);
    setBusy(false);
    if (res.ok) {
      router.replace("/(tabs)/home");
      return;
    }
    setErr(REASON_MAP[res.reason] ?? "Something went wrong. Try again.");
  }

  // Auto-submit when 6 digits typed — same behaviour as the web app.
  useEffect(() => {
    if (code.length === 6 && !busy) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter your code</Text>
          <Text style={styles.sub}>
            We sent a six-digit code to <Text style={styles.phone}>+91 {phone}</Text>.
          </Text>
        </View>
        <Input
          autoFocus
          keyboardType="number-pad"
          inputMode="numeric"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          placeholder="• • • • • •"
          maxLength={6}
          error={err ?? undefined}
          style={styles.code}
        />
        <Button
          title={busy ? "Verifying…" : "Verify"}
          onPress={submit}
          disabled={code.length !== 6 || busy}
          loading={busy}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, padding: spacing.xl, gap: spacing.xl },
  header: { gap: spacing.sm },
  title: { fontSize: 26, fontWeight: "600", color: colors.ink, letterSpacing: -0.3 },
  sub: { fontSize: 14.5, lineHeight: 21, color: colors.inkMuted },
  phone: { color: colors.inkSoft, fontWeight: "500" },
  code: { textAlign: "center", letterSpacing: 12, fontSize: 22 },
});
