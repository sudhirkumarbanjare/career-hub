import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  Button,
  Modal,
  Category,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminCategoriesScreenProps {
  onBack?: () => void;
}

export const AdminCategoriesScreen: React.FC<AdminCategoriesScreenProps> = ({
  onBack,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setCategories(AdminService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (cat: Category) => {
    AdminService.toggleCategory(cat.id);
    loadData();
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    setSaving(true);
    AdminService.createCategory(name.trim(), description.trim());
    loadData();
    setSaving(false);
    setModalVisible(false);
    setName('');
    setDescription('');
    Alert.alert('Category Added', `Category "${name}" is now available in project & job listings.`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Listing Categories"
        subtitle="Manage job and project taxonomy"
        showBack={!!onBack}
        onBack={onBack}
      />

      <View style={styles.headerRow}>
        <Text style={styles.countText}>{categories.length} Categories Configured</Text>
        <Button
          title="+ Add Category"
          variant="primary"
          size="small"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => (
          <Card key={cat.id} style={styles.catCard}>
            <View style={styles.catHeader}>
              <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                <Text style={styles.catName}>{cat.name}</Text>
                {cat.description && (
                  <Text style={styles.catDesc}>{cat.description}</Text>
                )}
              </View>
              <Switch
                value={cat.isEnabled}
                onValueChange={() => handleToggle(cat)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.catFooter}>
              <Badge
                text={cat.isEnabled ? 'ACTIVE' : 'DISABLED'}
                variant={cat.isEnabled ? 'success' : 'default'}
              />
              <Text style={styles.jobCountMeta}>
                {cat.jobsCount} associated active listings
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        title="Add Category"
        onClose={() => setModalVisible(false)}
      >
        <Text style={styles.fieldLabel}>Category Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cybersecurity & InfoSec"
        />

        <Text style={styles.fieldLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.inputMultiline}
          value={description}
          onChangeText={setDescription}
          placeholder="Short description of projects and roles categorized under this topic..."
          multiline
          numberOfLines={2}
        />

        <View style={styles.modalBtnRow}>
          <Button
            title="Cancel"
            variant="outline"
            size="medium"
            style={{ flex: 1, marginRight: SPACING.sm }}
            onPress={() => setModalVisible(false)}
          />
          <Button
            title="Save Category"
            variant="primary"
            size="medium"
            style={{ flex: 1 }}
            onPress={handleCreate}
            loading={saving}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  countText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  catCard: {
    marginBottom: SPACING.sm,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  catDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  catFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  jobCountMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  inputMultiline: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    minHeight: 60,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
});
