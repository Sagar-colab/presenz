import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { hasStoredSession } from "../src/lib/auth";
import { colors } from "../src/theme/colors";

// Boot screen: decide whether to land on the auth stack or the tabs based on
// whether a token is persisted in secure-store. We don't validate the token
// here — the first authenticated request will 401 and bounce back to /invite
// if it's expired. Cheap and avoids a blocking network call at launch.

export default function Index() {
  const [decision, setDecision] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    hasStoredSession().then((has) => setDecision(has ? "in" : "out"));
  }, []);

  if (decision === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return decision === "in" ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/invite" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
});
