import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { sendOtp } from "../../src/lib/auth";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";

const REASON_MAP: Record<string, string> = {
  invalid_phone: "That doesn't look like an Indian mobile number.",
  rate_limited: "Too many requests. Wait a moment.",
  phone_rate_limited: "Too many codes sent to this number. Try again later.",
  invite_required: "An invite code is required to join.",
  invite_invalid: "That invite code isn't valid.",
  invite_used: "That invite has already been used.",
  sms_failed: "We couldn't send the code. Try again.",
};

export default function PhoneScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    const res = await sendOtp({ phone, inviteCode });
    setBusy(false);
    if (res.ok) {
      router.push({ pathname: "/(auth)/otp", params: { phone } });
      return;
    }
    setErr(REASON_MAP[res.reason] ?? "Something went wrong. Try again.");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>What's your number?</Text>
          <Text style={styles.sub}>
            We'll text you a six-digit code. Indian mobile numbers only.
          </Text>
        </View>
        <Input
          autoFocus
          keyboardType="phone-pad"
          inputMode="tel"
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
          placeholder="98XXXXXXXX"
          leadingAdornment="+91"
          maxLength={10}
          error={err ?? undefined}
        />
        <Button
          title={busy ? "Sending…" : "Send code"}
          onPress={submit}
          disabled={phone.length < 10 || busy}
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
});
