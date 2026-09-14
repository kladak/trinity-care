import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Banner,
  Button,
  Card,
  Input,
  LoadingState,
  Muted,
  Screen,
  Subtitle,
  Title,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api, Resident } from '../services/api';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

function defaultVisitIso() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(14, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function ScheduleVisitScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentId, setResidentId] = useState<number | null>(null);
  const [when, setWhen] = useState(defaultVisitIso());
  const [notes, setNotes] = useState('Weekend visit — bring photos (demo)');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const list = await api.residents(token);
        setResidents(list);
        if (list[0]) setResidentId(list[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load residents');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const submit = async () => {
    if (!token || !residentId) {
      setError('Select a resident.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const scheduled = new Date(when);
      if (Number.isNaN(scheduled.getTime())) {
        throw new Error('Enter a valid date/time (YYYY-MM-DDTHH:MM).');
      }
      await api.createVisit(token, {
        resident_id: residentId,
        scheduled_at: scheduled.toISOString(),
        notes: notes.trim() || 'Demo visit request',
      });
      setSuccess('Visit requested — staff can confirm from their view.');
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <Title>Schedule a visit</Title>
        <Subtitle>Request a time to visit a linked resident. Demo workflow only.</Subtitle>
        {error ? <Banner tone="error">{error}</Banner> : null}
        {success ? <Banner tone="success">{success}</Banner> : null}

        <Card>
          <Text style={styles.label}>Resident</Text>
          {residents.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => setResidentId(r.id)}
              style={[styles.option, residentId === r.id && styles.optionOn]}
            >
              <Text style={styles.optionText}>{r.display_name}</Text>
              <Muted>Room {r.room}</Muted>
            </Pressable>
          ))}

          <Text style={[styles.label, { marginTop: spacing.md }]}>Date & time (local)</Text>
          <Input
            value={when}
            onChangeText={setWhen}
            placeholder="YYYY-MM-DDTHH:MM"
            autoCapitalize="none"
          />
          <Muted>Use ISO-like local format, e.g. 2026-09-16T14:00</Muted>

          <Text style={[styles.label, { marginTop: spacing.md }]}>Notes</Text>
          <Input
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes for facility staff"
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <View style={{ height: spacing.md }} />
          <Button label="Request visit" onPress={submit} loading={saving} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  optionText: { fontWeight: '600', color: colors.text },
});
