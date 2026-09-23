import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Button,
  Badge,
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    StudentService.markAllNotificationsAsRead();
    setNotifications([...StudentService.getNotifications()]);
  };

  const handlePressNotification = (notif: AppNotification) => {
    StudentService.markNotificationAsRead(notif.id);
    setNotifications([...StudentService.getNotifications()]);
    if (notif.deepLink && onOpenNotification) {
      onOpenNotification(notif.deepLink);
    }
  };

  const handleDeleteNotification = (id: string) => {
    StudentService.deleteNotification(id);
    setNotifications([...StudentService.getNotifications()]);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to remove all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            StudentService.clearAllNotifications();
            setNotifications([]);
          },
        },
      ]
    );
  };

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        onBack={onBack}
        rightAction={
          <View style={styles.headerActions}>
            {unreadCount > 0 ? (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={styles.markReadBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.markReadText}>Mark all read</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />

      {/* Filter Tabs Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'unread' && styles.filterTabTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>

        {notifications.length > 0 ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAll}
          >
            <Text style={styles.clearBtnText}>Clear all</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={displayedNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            </Text>
            <Text style={styles.emptySub}>
              {filter === 'unread'
                ? 'You have read all your messages and updates.'
                : 'You are all caught up with your announcements.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePressNotification(item)}
          >
            <Card style={[styles.notifCard, !item.read ? styles.unreadCard : null]}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  {!item.read && <View style={styles.unreadDot} />}
                  <Text style={[styles.title, !item.read && styles.unreadTitle]}>
                    {item.title}
                  </Text>
                </View>
                <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
              </View>

              <Text style={styles.body}>{item.body}</Text>

              <View style={styles.cardFooter}>
                {item.deepLink ? (
                  <Text style={styles.tapText}>Open details →</Text>
                ) : (
                  <View />
                )}
                <TouchableOpacity
                  onPress={() => handleDeleteNotification(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markReadBtn: {
    backgroundColor: COLORS.brand[100],
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  markReadText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.gray[100],
  },
  filterTabActive: {
    backgroundColor: COLORS.brand[600],
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  clearBtn: {
    marginLeft: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  notifCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  unreadCard: {
    backgroundColor: COLORS.brand[50] || '#eff6ff',
    borderColor: COLORS.brand[300] || '#93c5fd',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand[600],
    marginRight: 6,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[800],
    flex: 1,
  },
  unreadTitle: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.gray[400],
  },
  body: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.gray[200],
  },
  tapText: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.brand[600],
    fontWeight: 'bold',
  },
  deleteText: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.gray[400],
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
    textAlign: 'center',
  },
});
