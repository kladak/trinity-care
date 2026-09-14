import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Banner({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'warning' | 'success';
  children: React.ReactNode;
}) {
  const map = {
    info: { bg: colors.primaryMuted, fg: colors.primary },
    error: { bg: colors.dangerMuted, fg: colors.danger },
    warning: { bg: colors.warningMuted, fg: colors.warning },
    success: { bg: colors.successMuted, fg: colors.success },
  }[tone];
  return (
    <View style={[styles.banner, { backgroundColor: map.bg }]}>
      <Text style={[styles.bannerText, { color: map.fg }]}>{children}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.accent
        : variant === 'danger'
          ? colors.danger
          : 'transparent';
  const color = variant === 'ghost' ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.buttonGhost,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.centerLabel}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.centerLabel}>{body}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={[styles.emptyTitle, { color: colors.danger }]}>Something went wrong</Text>
      <Text style={styles.centerLabel}>{message}</Text>
      {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

export function TypeChip({ type }: { type: string }) {
  const bg =
    type === 'check_in' ? colors.chipCheckIn : type === 'message' ? colors.chipMessage : colors.chipUpdate;
  const label = type === 'check_in' ? 'Check-in' : type === 'message' ? 'Message' : 'Update';
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    requested: { bg: colors.warningMuted, fg: colors.warning },
    confirmed: { bg: colors.successMuted, fg: colors.success },
    cancelled: { bg: colors.dangerMuted, fg: colors.danger },
    completed: { bg: colors.primaryMuted, fg: colors.primary },
  };
  const tone = map[status] || map.requested;
  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }]}>
      <Text style={[styles.chipText, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  muted: {
    fontSize: 13,
    color: colors.textMuted,
  },
  banner: {
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  button: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  center: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  centerLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
});
