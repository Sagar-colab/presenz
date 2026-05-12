import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leadingAdornment?: string;
};

export function Input({ label, error, hint, leadingAdornment, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {leadingAdornment && <Text style={styles.adornment}>{leadingAdornment}</Text>}
        <TextInput
          placeholderTextColor={colors.inkFaint}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.inkFaint,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceLine,
    backgroundColor: colors.surface,
  },
  fieldError: { borderColor: colors.danger },
  adornment: { fontSize: 15, color: colors.inkMuted, marginRight: spacing.sm },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: spacing.sm },
  errorText: { fontSize: 12.5, color: colors.danger },
  hintText: { fontSize: 12.5, color: colors.inkFaint },
});
