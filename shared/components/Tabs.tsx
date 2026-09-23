import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  badge?: number | string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onSelectTab: (key: T) => void;
  scrollable?: boolean;
  style?: ViewStyle;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onSelectTab,
  scrollable = false,
  style,
}: TabsProps<T>) {
  const content = (
    <View style={[styles.tabBar, style]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabItem, isActive ? styles.activeTabItem : null]}
          >
            <Text style={[styles.tabLabel, isActive ? styles.activeTabLabel : null]}>
              {tab.label}
            </Text>
            {tab.badge !== undefined ? (
              <View style={[styles.badge, isActive ? styles.activeBadge : null]}>
                <Text style={[styles.badgeText, isActive ? styles.activeBadgeText : null]}>
                  {tab.badge}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: SPACING.base,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: RADIUS.lg,
    padding: 3,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  activeTabItem: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[600],
  },
  activeTabLabel: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  badge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  activeBadge: {
    backgroundColor: COLORS.brand[100],
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[600],
  },
  activeBadgeText: {
    color: COLORS.brand[800],
  },
});
