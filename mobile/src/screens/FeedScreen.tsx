import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Muted,
  Screen,
  TypeChip,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api, UpdateItem } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { RootStackParamList } from '../navigation/types';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function FeedScreen() {
  const { token, role, displayName, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await api.feed(token);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const isStaff = role === 'facility_staff';

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hello, {displayName?.split('(')[0].trim()}</Text>
          <Muted>{isStaff ? 'Staff feed · facility updates' : 'Family feed · linked residents'}</Muted>
        </View>
        <Button label="Sign out" variant="ghost" onPress={logout} />
      </View>

      <Banner tone="info">
        Seed data. All names and notes are fictional.
      </Banner>

      <View style={styles.actions}>
        <Button label="Residents" variant="secondary" onPress={() => navigation.navigate('Residents')} />
        <View style={{ width: spacing.sm }} />
        {isStaff ? (
          <Button label="Post update" onPress={() => navigation.navigate('PostUpdate')} />
        ) : (
          <Button label="Schedule visit" onPress={() => navigation.navigate('ScheduleVisit')} />
        )}
      </View>

      {loading ? (
        <LoadingState label="Loading updates…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No updates yet"
              body="When staff post check-ins, they will appear here."
            />
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ResidentDetail', { id: item.resident_id })}>
              <Card>
                <View style={styles.row}>
                  <TypeChip type={item.update_type} />
                  <Muted>{formatWhen(item.created_at)}</Muted>
                </View>
                <Text style={styles.resident}>{item.resident_name}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Muted>By {item.author_name}</Muted>
              </Card>
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hello: { fontSize: 22, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resident: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  body: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.sm },
});
