import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import {
  Banner,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Muted,
  Screen,
  StatusChip,
  Title,
  TypeChip,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api, ResidentDetail } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { RootStackParamList } from '../navigation/types';

export function ResidentDetailScreen() {
  const { token } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'ResidentDetail'>>();
  const [data, setData] = useState<ResidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setData(await api.residentDetail(token, route.params.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load resident');
    } finally {
      setLoading(false);
    }
  }, [token, route.params.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading resident…" />
      </Screen>
    );
  }
  if (error || !data) {
    return (
      <Screen>
        <ErrorState message={error || 'Not found'} onRetry={load} />
      </Screen>
    );
  }

  const { resident, updates, visits } = data;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Title>{resident.display_name}</Title>
        <Muted>
          Room {resident.room}
          {resident.facility_name ? ` · ${resident.facility_name}` : ''}
        </Muted>
        <Banner tone="info">Synthetic demo profile — not real PHI.</Banner>
        <Card>
          <Text style={styles.section}>About (demo notes)</Text>
          <Text style={styles.body}>{resident.care_notes}</Text>
        </Card>

        <Text style={styles.heading}>Recent updates</Text>
        {updates.length === 0 ? (
          <EmptyState title="No updates" body="Staff have not posted for this resident yet." />
        ) : (
          updates.map((u) => (
            <Card key={u.id}>
              <View style={styles.row}>
                <TypeChip type={u.update_type} />
                <Muted>{new Date(u.created_at).toLocaleString()}</Muted>
              </View>
              <Text style={styles.body}>{u.body}</Text>
              <Muted>By {u.author_name}</Muted>
            </Card>
          ))
        )}

        <Text style={styles.heading}>Visits</Text>
        {visits.length === 0 ? (
          <EmptyState title="No visits" body="Schedule a visit from the family home screen." />
        ) : (
          visits.map((v) => (
            <Card key={v.id}>
              <View style={styles.row}>
                <StatusChip status={v.status} />
                <Muted>{new Date(v.scheduled_at).toLocaleString()}</Muted>
              </View>
              <Text style={styles.body}>{v.notes || 'No notes'}</Text>
              <Muted>Requested by {v.requester_name}</Muted>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontWeight: '700', color: colors.text, marginBottom: 6 },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  body: { color: colors.textSecondary, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
