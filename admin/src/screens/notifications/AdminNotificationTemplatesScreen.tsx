import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  BadgeVariant,
  SearchBar,
  Button,
  Modal,
  ConfirmationModal,
  SuccessModal,
  ErrorModal,
  NotificationTemplate,
  NotificationTemplateApp,
  NotificationCategory,
  NotificationService,
} from '@gotechplace/shared';
import { AdminService } from '../../services/adminService';

export interface AdminNotificationTemplatesScreenProps {
  onBack: () => void;
  onUseTemplate?: (template: NotificationTemplate) => void;
}

export const AdminNotificationTemplatesScreen: React.FC<AdminNotificationTemplatesScreenProps> = ({
  onBack,
  onUseTemplate,
}) => {
  const [appFilter, setAppFilter] = useState<NotificationTemplateApp>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState<NotificationTemplate[]>(
    AdminService.getNotificationTemplates()
  );

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});

  // Create / Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formApp, setFormApp] = useState<NotificationTemplateApp>('student');
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState<NotificationCategory>('general');
  const [formDeepLink, setFormDeepLink] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState<NotificationTemplate | null>(null);

  // Success Feedback
  const [successModal, setSuccessModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  // Android BackHandler for inner modals & returning to composer
  useEffect(() => {
    const onBackPress = (): boolean => {
      if (previewTemplate) {
        setPreviewTemplate(null);
        return true;
      }
      if (editModalVisible) {
        setEditModalVisible(false);
        return true;
      }
      if (deleteConfirmTemplate) {
        setDeleteConfirmTemplate(null);
        return true;
      }
      if (successModal.visible) {
        setSuccessModal({ visible: false, title: '', message: '' });
        return true;
      }
      onBack();
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      backSub.remove();
    };
  }, [previewTemplate, editModalVisible, deleteConfirmTemplate, successModal.visible, onBack]);

  const reloadTemplates = () => {
    setTemplates([...AdminService.getNotificationTemplates()]);
  };

  const filteredTemplates = useMemo(() => {
    return AdminService.getNotificationTemplates({
      app: appFilter !== 'all' ? appFilter : undefined,
      category: categoryFilter !== 'all' ? (categoryFilter as NotificationCategory) : undefined,
      search: search.trim() || undefined,
    });
  }, [appFilter, categoryFilter, search, templates]);

  const apps: { id: NotificationTemplateApp; label: string }[] = [
    { id: 'all', label: 'All Apps' },
    { id: 'student', label: 'Student App' },
    { id: 'client', label: 'Client App' },
    { id: 'admin', label: 'Admin App' },
  ];

  const categories = ['all', 'general', 'jobs', 'applications', 'account', 'admin', 'system'];

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setFormApp('student');
    setFormName('');
    setFormTitle('');
    setFormBody('');
    setFormCategory('general');
    setFormDeepLink('');
    setFormImageUrl('');
    setFormError('');
    setEditModalVisible(true);
  };

  const handleOpenEditModal = (tmpl: NotificationTemplate) => {
    setEditingTemplateId(tmpl.id);
    setFormApp(tmpl.app);
    setFormName(tmpl.name);
    setFormTitle(tmpl.title);
    setFormBody(tmpl.body);
    setFormCategory(tmpl.category);
    setFormDeepLink(tmpl.deepLink || '');
    setFormImageUrl(tmpl.imageUrl || '');
    setFormError('');
    setEditModalVisible(true);
  };

  const handleSaveTemplate = () => {
    setFormError('');

    if (editingTemplateId) {
      const res = AdminService.updateNotificationTemplate(editingTemplateId, {
        app: formApp,
        name: formName,
        title: formTitle,
        body: formBody,
        category: formCategory,
        deepLink: formDeepLink.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
      });

      if (res.success) {
        reloadTemplates();
        setEditModalVisible(false);
        setSuccessModal({
          visible: true,
          title: 'Template Updated',
          message: `Notification template "${formName}" has been saved.`,
        });
      } else {
        setFormError(res.error || 'Failed to update template.');
      }
    } else {
      const res = AdminService.createNotificationTemplate({
        app: formApp,
        name: formName,
        title: formTitle,
        body: formBody,
        category: formCategory,
        deepLink: formDeepLink.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
      });

      if (res.success) {
        reloadTemplates();
        setEditModalVisible(false);
        setSuccessModal({
          visible: true,
          title: 'Template Created',
          message: `Custom push template "${formName}" created and ready for broadcasts.`,
        });
      } else {
        setFormError(res.error || 'Failed to create template.');
      }
    }
  };

  const handleDuplicate = (tmpl: NotificationTemplate) => {
    const res = AdminService.duplicateNotificationTemplate(tmpl.id);
    if (res.success) {
      reloadTemplates();
      setSuccessModal({
        visible: true,
        title: 'Template Duplicated',
        message: `Created editable custom copy of "${tmpl.name}".`,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTemplate) return;
    const res = AdminService.deleteNotificationTemplate(deleteConfirmTemplate.id);
    if (res.success) {
      reloadTemplates();
      setDeleteConfirmTemplate(null);
      setSuccessModal({
        visible: true,
        title: 'Template Deleted',
        message: `Template "${deleteConfirmTemplate.name}" has been removed.`,
      });
    }
  };

  const handleOpenPreview = (tmpl: NotificationTemplate) => {
    setPreviewTemplate(tmpl);
    // Initialize sample vars
    const initVars: Record<string, string> = {};
    tmpl.variables.forEach((v) => {
      if (v.includes('name')) initVars[v] = 'Himanshu Sharma';
      else if (v.includes('job')) initVars[v] = 'React Native Engineer';
      else if (v.includes('company')) initVars[v] = 'Nexus Innovations';
      else if (v.includes('status')) initVars[v] = 'SHORTLISTED';
      else if (v.includes('college')) initVars[v] = 'National Institute of Technology';
      else if (v.includes('branch')) initVars[v] = 'CSE / IT';
      else if (v.includes('time') || v.includes('date')) initVars[v] = 'Tomorrow, 3:00 PM';
      else initVars[v] = 'Sample Value';
    });
    setPreviewVars(initVars);
  };

  const detectedFormVars = useMemo(() => {
    return Array.from(
      new Set([
        ...NotificationService.extractVariables(formTitle),
        ...NotificationService.extractVariables(formBody),
      ])
    );
  }, [formTitle, formBody]);

  return (
    <View style={styles.container}>
      <Header
        title="Push Notification Templates"
        subtitle={`${filteredTemplates.length} templates available`}
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={handleOpenCreateModal}
            activeOpacity={0.8}
          >
            <Text style={styles.headerAddBtnText}>+ New Template</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Header */}
      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search templates by title, body, or name..."
        />

        {/* App Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {apps.map((a) => {
            const isSel = appFilter === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => setAppFilter(a.id)}
                style={[styles.filterPill, isSel ? styles.filterPillActive : null]}
              >
                <Text style={[styles.filterPillText, isSel ? styles.filterPillTextActive : null]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
          {categories.map((c) => {
            const isSel = categoryFilter === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategoryFilter(c)}
                style={[styles.subPill, isSel ? styles.subPillActive : null]}
              >
                <Text style={[styles.subPillText, isSel ? styles.subPillTextActive : null]}>
                  {c.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Template List */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Templates Found</Text>
            <Text style={styles.emptySub}>No push notification templates match your filters.</Text>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <Card style={styles.templateCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                  <Text style={styles.templateName}>{item.name}</Text>
                  <Text style={styles.templateApp}>App: {item.app.toUpperCase()}</Text>
                </View>
                <View style={styles.badgeGroup}>
                  <Badge
                    label={item.isSystem ? 'SYSTEM' : 'CUSTOM'}
                    variant={item.isSystem ? 'purple' : 'brand'}
                    size="sm"
                  />
                  <Badge
                    label={item.category.toUpperCase()}
                    variant="gray"
                    size="sm"
                  />
                </View>
              </View>

              <View style={styles.previewBox}>
                <Text style={styles.pushTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.pushBody} numberOfLines={2}>
                  {item.body}
                </Text>
                {item.deepLink ? (
                  <Text style={styles.pushDeepLink} numberOfLines={1}>
                    🔗 {item.deepLink}
                  </Text>
                ) : null}
              </View>

              {item.variables.length > 0 && (
                <View style={styles.varsContainer}>
                  <Text style={styles.varsLabel}>Placeholders:</Text>
                  <View style={styles.varsRow}>
                    {item.variables.map((v) => (
                      <View key={v} style={styles.varPill}>
                        <Text style={styles.varText}>{'{{' + v + '}}'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.cardActions}>
                {onUseTemplate ? (
                  <TouchableOpacity
                    style={styles.useBtn}
                    onPress={() => onUseTemplate(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.useBtnText}>Use in Composer 🚀</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => handleOpenPreview(item)}
                >
                  <Text style={styles.secondaryActionText}>Preview 👁️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => handleDuplicate(item)}
                >
                  <Text style={styles.secondaryActionText}>Duplicate 📑</Text>
                </TouchableOpacity>

                {!item.isSystem ? (
                  <>
                    <TouchableOpacity
                      style={styles.secondaryActionBtn}
                      onPress={() => handleOpenEditModal(item)}
                    >
                      <Text style={styles.secondaryActionText}>Edit ✎</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteActionBtn}
                      onPress={() => setDeleteConfirmTemplate(item)}
                    >
                      <Text style={styles.deleteActionText}>Delete 🗑️</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </Card>
          );
        }}
      />

      {/* Live Preview Modal */}
      {previewTemplate && (
        <Modal
          visible={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          title="Template Push Preview"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.previewDialogSub}>
              Simulate live variable substitution on Android lock screen & notification shade.
            </Text>

            {/* Simulated Push Notification Banner */}
            <View style={styles.phonePushPreview}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewAppName}>GoTechPlace • now</Text>
                <Badge label={previewTemplate.app.toUpperCase()} variant="brand" size="sm" />
              </View>
              <Text style={styles.renderedTitle}>
                {NotificationService.renderTemplate(previewTemplate, previewVars).renderedTitle}
              </Text>
              <Text style={styles.renderedBody}>
                {NotificationService.renderTemplate(previewTemplate, previewVars).renderedBody}
              </Text>
              {previewTemplate.deepLink ? (
                <Text style={styles.renderedDeepLink}>
                  🔗 {previewTemplate.deepLink}
                </Text>
              ) : null}
            </View>

            {/* Variable Inputs */}
            {previewTemplate.variables.length > 0 && (
              <View style={styles.varInputsSection}>
                <Text style={styles.varSectionHeading}>Test Variable Values:</Text>
                {previewTemplate.variables.map((v) => (
                  <View key={v} style={styles.varInputGroup}>
                    <Text style={styles.varInputLabel}>{'{{' + v + '}}'}:</Text>
                    <TextInput
                      style={styles.varTextInput}
                      value={previewVars[v] || ''}
                      onChangeText={(val) =>
                        setPreviewVars({
                          ...previewVars,
                          [v]: val,
                        })
                      }
                      placeholder={`Enter test ${v}...`}
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginTop: SPACING.md }}>
              <Button
                title="Done Previewing"
                onPress={() => setPreviewTemplate(null)}
                variant="primary"
                size="md"
              />
            </View>
          </ScrollView>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {editModalVisible && (
        <Modal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          title={editingTemplateId ? 'Edit Notification Template' : 'Create Custom Template'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Target Application</Text>
            <View style={styles.appRadioRow}>
              {(['student', 'client', 'admin'] as const).map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.appRadioChip, formApp === a && styles.appRadioChipActive]}
                  onPress={() => setFormApp(a)}
                >
                  <Text style={[styles.appRadioText, formApp === a && styles.appRadioTextActive]}>
                    {a.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Template Name</Text>
            <TextInput
              style={styles.textInput}
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g. Engineering Hackathon Announcement"
            />

            <Text style={styles.inputLabel}>Headline / Title (supports {'{{var}}'})</Text>
            <TextInput
              style={styles.textInput}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="e.g. 🏆 Major Hackathon Live, {{student_name}}!"
            />

            <Text style={styles.inputLabel}>Message Body (supports {'{{var}}'})</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 70, textAlignVertical: 'top' }]}
              value={formBody}
              onChangeText={setFormBody}
              placeholder="e.g. Submit your project on {{category}} before {{deadline_date}}."
              multiline
              numberOfLines={3}
            />

            {detectedFormVars.length > 0 && (
              <View style={styles.detectedVarsBox}>
                <Text style={styles.detectedVarsHeading}>Detected Variables:</Text>
                <View style={styles.varsRow}>
                  {detectedFormVars.map((v) => (
                    <View key={v} style={styles.varPill}>
                      <Text style={styles.varText}>{'{{' + v + '}}'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Deep Link (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formDeepLink}
              onChangeText={setFormDeepLink}
              placeholder="gotechplace://student/projects"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Banner Image URL (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formImageUrl}
              onChangeText={setFormImageUrl}
              placeholder="https://assets.gotechplace.com/banners/hackathon.png"
              autoCapitalize="none"
            />

            {formError ? <Text style={styles.errorInlineText}>{formError}</Text> : null}

            <Button
              title={editingTemplateId ? 'SAVE CHANGES ✓' : 'CREATE TEMPLATE ✓'}
              onPress={handleSaveTemplate}
              variant="primary"
              size="lg"
              style={{ marginTop: SPACING.md }}
            />
          </ScrollView>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTemplate && (
        <ConfirmationModal
          visible={Boolean(deleteConfirmTemplate)}
          title="Delete Custom Template"
          message={`Are you sure you want to delete "${deleteConfirmTemplate.name}"? This action cannot be undone.`}
          confirmText="Delete Template"
          cancelText="Cancel"
          isDestructive
          icon="🗑️"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmTemplate(null)}
        />
      )}

      {/* Success Notification Modal */}
      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ visible: false, title: '', message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerAddBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  headerAddBtnText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterScroll: {
    marginTop: SPACING.sm,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginRight: SPACING.xs,
  },
  filterPillActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[600],
  },
  filterPillTextActive: {
    color: COLORS.brand[700],
  },
  subPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[100],
    marginRight: 6,
  },
  subPillActive: {
    backgroundColor: COLORS.gray[800],
  },
  subPillText: {
    fontSize: 9,
    color: COLORS.gray[600],
  },
  subPillTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  templateCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  templateName: {
    fontSize: TYPOGRAPHY.sizes.sm + 1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  templateApp: {
    fontSize: 10,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  previewBox: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginVertical: SPACING.xs,
  },
  pushTitle: {
    fontSize: TYPOGRAPHY.sizes.xs + 1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  pushBody: {
    fontSize: 11,
    color: COLORS.gray[600],
    lineHeight: 16,
  },
  pushDeepLink: {
    fontSize: 10,
    color: COLORS.brand[600],
    marginTop: 3,
  },
  varsContainer: {
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  varsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  varsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  varPill: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  varText: {
    fontSize: 9,
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.xs + 2,
    marginTop: 6,
  },
  useBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    marginRight: 4,
  },
  useBtnText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  secondaryActionBtn: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  secondaryActionText: {
    fontSize: 10,
    color: COLORS.gray[700],
    fontWeight: '600',
  },
  deleteActionBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    marginLeft: 'auto',
  },
  deleteActionText: {
    fontSize: 10,
    color: COLORS.danger[700],
    fontWeight: 'bold',
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
  previewDialogSub: {
    fontSize: 11,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  phonePushPreview: {
    backgroundColor: '#1e293b',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewAppName: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  renderedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  renderedBody: {
    fontSize: 12,
    color: '#e2e8f0',
    lineHeight: 18,
  },
  renderedDeepLink: {
    fontSize: 11,
    color: '#38bdf8',
    marginTop: 6,
  },
  varInputsSection: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  varSectionHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  varInputGroup: {
    marginBottom: 6,
  },
  varInputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  varTextInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.gray[300],
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: COLORS.gray[900],
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray[700],
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 12,
    color: COLORS.gray[900],
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  appRadioRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  appRadioChip: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  appRadioChipActive: {
    backgroundColor: COLORS.brand[600],
    borderColor: COLORS.brand[600],
  },
  appRadioText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[700],
  },
  appRadioTextActive: {
    color: COLORS.white,
  },
  detectedVarsBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  detectedVarsHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  errorInlineText: {
    fontSize: 11,
    color: COLORS.danger[600],
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
});
