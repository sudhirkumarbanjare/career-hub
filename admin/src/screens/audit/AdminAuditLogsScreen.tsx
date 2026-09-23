import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  SearchBar,
  EmptyState,
  AuditLogEntry,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminAuditLogsScreenProps {
  onBack?: () => void;
}

export const AdminAuditLogsScreen: React.FC<AdminAuditLogsScreenProps> = ({
  onBack,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');

  const loadData = () => {
    setLogs(AdminService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      selectedActionFilter === 'all'
        ? true
        : log.action.toLowerCase().includes(selectedActionFilter.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === '' ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('APPROVE') || action.includes('ACTIVATE') || action.includes('CREATE')) {
      return 'success';
    }
    if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('DELETE') || action.includes('DISABLE')) {
      return 'danger';
    }
    if (action.includes('MAINTENANCE') || action.includes('UPDATE')) {
      return 'warning';
    }
    return 'info';
  };

  return (
    <View style={styles.container}>
      <Header
        title="Security & Audit Logs"
        subtitle="Immutable ledger of administrative actions"
        showBack={!!onBack}
        onBack={onBack}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by admin name, action, target..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        {(
          [
            { id: 'all', label: 'All Events' },
            { id: 'JOB', label: 'Jobs' },
            { id: 'CLIENT', label: 'Clients' },
            { id: 'USER', label: 'Users' },
            { id: 'VERSION', label: 'Releases' },
            { id: 'NOTIFICATION', label: 'Push' },
          ] as const
        ).map((flt) => {
          const isSel = selectedActionFilter === flt.id;
          return (
            <TouchableOpacity
              key={flt.id}
              style={[styles.filterChip, isSel && styles.filterChipActive]}
              onPress={() => setSelectedActionFilter(flt.id)}
            >
              <Text style={[styles.filterText, isSel && styles.filterTextActive]}>
                {flt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Audit Records"
            message="No administrative actions match current search or filter."
            iconName="shield-checkmark-outline"
          />
        ) : (
          filteredLogs.map((entry) => (
            <Card key={entry.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={{ flex: 1, paddingRight: SPACING.xs }}>
                  <Text style={styles.actionName}>{entry.action}</Text>
                  <Text style={styles.operatorText}>
                    By {entry.adminName}
                  </Text>
                </View>
                <Badge
                  text={entry.targetType.toUpperCase()}
                  variant={getActionBadgeVariant(entry.action)}
                />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.targetLabel}>Target ID:</Text>
                <Text style={styles.targetVal}>{entry.targetId || 'N/A'}</Text>
              </View>

              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <View style={styles.metadataBox}>
                  <Text style={styles.metaBoxTitle}>Event Payload:</Text>
                  <Text style={styles.metadataJson}>
                    {JSON.stringify(entry.metadata, null, 2)}
                  </Text>
                </View>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.timestampText}>
                  {formatRelativeDate(entry.timestamp)} ({new Date(entry.timestamp).toLocaleTimeString()})
                </Text>
                <Text style={styles.idText}>ID: {entry.id.substring(0, 14)}...</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  logCard: {
    marginBottom: SPACING.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  actionName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text,
  },
  operatorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  targetLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginRight: 4,
  },
  targetVal: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  metadataBox: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: SPACING.xs + 2,
    marginVertical: SPACING.xs,
  },
  metaBoxTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metadataJson: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
    marginTop: 4,
  },
  timestampText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  idText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
});
