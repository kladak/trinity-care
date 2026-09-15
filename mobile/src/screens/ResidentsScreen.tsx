import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Muted,
  Screen,
  Title,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api, Resident } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { RootStackParamList } from '../navigation/types';

export function ResidentsScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setItems(await api.residents(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load residents');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  return (
    <Screen>
      <Title>Residents</Title>
      <Muted>Tap a resident for updates and visits</Muted>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          style={{ marginTop: spacing.md }}
          data={items}
          keyExtractor={(r) => String(r.id)}
          ListEmptyComponent={<EmptyState title="No residents" body="No linked residents for this demo account." />}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ResidentDetail', { id: item.id })}>
              <Card>
                <Text style={styles.name}>{item.display_name}</Text>
                <Muted>
                  Room {item.room}
                  {item.facility_name ? ` · ${item.facility_name}` : ''}
                </Muted>
                <Text style={styles.notes} numberOfLines={2}>
                  {item.care_notes}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  notes: { marginTop: spacing.sm, color: colors.textSecondary, lineHeight: 20 },
});
