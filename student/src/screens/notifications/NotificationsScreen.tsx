import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  formatRelativeTime,
  AppNotification,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface NotificationsScreenProps {
  onBack: () => void;
  onOpenNotification?: (deepLink?: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenNotification,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    StudentService.getNotifications()
  );

  const handlePressNotification = (notif: AppNotification) => {
    StudentService.markNotificationAsRead(notif.id);
    setNotifications([...StudentService.getNotifications()]);
    if (notif.deepLink && onOpenNotification) {
      onOpenNotification(notif.deepLink);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" onBack={onBack} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>You are all caught up with your announcements.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePressNotification(item)}
          >
            <Card style={[styles.notifCard, !item.read ? styles.unreadCard : null]}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.body}>{item.body}</Text>
              {item.deepLink ? (
                <Text style={styles.tapText}>Tap to open →</Text>
              ) : null}
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  notifCard: {
    marginBottom: SPACING.sm,
  },
  unreadCard: {
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[300],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.gray[400],
  },
  body: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    lineHeight: 16,
  },
  tapText: {
    fontSize: 10,
    color: COLORS.brand[600],
    fontWeight: 'bold',
    marginTop: 6,
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
  },
  emptySub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    marginTop: 4,
  },
});
