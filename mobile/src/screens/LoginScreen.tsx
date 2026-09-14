import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, Card, Muted, Screen, Subtitle, Title } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [busy, setBusy] = useState<'family' | 'staff' | null>(null);

  const onLogin = async (persona: 'family' | 'staff') => {
    setBusy(persona);
    try {
      await login(persona);
    } catch {
      /* surfaced via context.error */
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Trinity Care</Text>
          <Text style={styles.tag}>Family ↔ facility connection demo</Text>
        </View>

        <Banner tone="warning">
          Educational portfolio demo — not a medical device, not affiliated with Trinity Health,
          synthetic seed data only. Demo auth (no real accounts / PHI).
        </Banner>

        <Card>
          <Title>Demo login</Title>
          <Subtitle>
            Pick a persona to walk the product. Same seeded accounts every time — great for
            interview walkthroughs.
          </Subtitle>

          {error ? <Banner tone="error">{error}</Banner> : null}

          <View style={styles.persona}>
            <Text style={styles.personaTitle}>Family member</Text>
            <Muted>Jordan Lee — linked to Margaret, Harold, and Robert (synthetic)</Muted>
            <View style={styles.gap} />
            <Button
              label="Continue as Family"
              onPress={() => onLogin('family')}
              loading={busy === 'family' || loading}
              disabled={!!busy}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.persona}>
            <Text style={styles.personaTitle}>Facility staff</Text>
            <Muted>Alex Rivera — Willow Grove Assisted Living (demo facility)</Muted>
            <View style={styles.gap} />
            <Button
              label="Continue as Staff"
              variant="secondary"
              onPress={() => onLogin('staff')}
              loading={busy === 'staff' || loading}
              disabled={!!busy}
            />
          </View>
        </Card>

        <Muted>API: {getApiBase()}</Muted>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  hero: { marginBottom: spacing.lg, marginTop: spacing.md },
  brand: { fontSize: 32, fontWeight: '800', color: colors.primary },
  tag: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
  persona: { marginTop: spacing.sm },
  personaTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  gap: { height: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
});
