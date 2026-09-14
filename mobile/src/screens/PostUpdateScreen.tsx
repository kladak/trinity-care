import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Banner,
  Button,
  Card,
  ErrorState,
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

const TYPES = [
  { id: 'check_in', label: 'Check-in' },
  { id: 'update', label: 'Update' },
  { id: 'message', label: 'Message' },
] as const;

export function PostUpdateScreen() {
  const { token, role } = useAuth();
  const navigation = useNavigation();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentId, setResidentId] = useState<number | null>(null);
  const [updateType, setUpdateType] = useState<(typeof TYPES)[number]['id']>('check_in');
  const [body, setBody] = useState('');
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

  if (role !== 'facility_staff') {
    return (
      <Screen>
        <ErrorState message="Only facility staff can post updates in this demo." />
      </Screen>
    );
  }

  const submit = async () => {
    if (!token || !residentId || !body.trim()) {
      setError('Select a resident and enter a message.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.createUpdate(token, {
        resident_id: residentId,
        update_type: updateType,
        body: body.trim() + ' (Synthetic demo note)',
      });
      setSuccess('Update posted — families will see it on their feed.');
      setBody('');
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post');
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
        <Title>Post update</Title>
        <Subtitle>Share a check-in or note with linked family members. Demo only.</Subtitle>
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

          <Text style={[styles.label, { marginTop: spacing.md }]}>Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setUpdateType(t.id)}
                style={[styles.typeChip, updateType === t.id && styles.typeChipOn]}
              >
                <Text style={[styles.typeChipText, updateType === t.id && { color: '#fff' }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: spacing.md }]}>Message</Text>
          <Input
            multiline
            numberOfLines={4}
            value={body}
            onChangeText={setBody}
            placeholder="e.g. Joined morning stretch group — good energy today."
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
          <Muted>Posts are labeled synthetic in this educational demo.</Muted>
          <View style={{ height: spacing.md }} />
          <Button label="Publish to family feed" onPress={submit} loading={saving} />
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
  typeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontWeight: '600', color: colors.text },
});
