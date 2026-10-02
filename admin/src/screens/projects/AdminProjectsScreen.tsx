import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  Button,
  Input,
  SearchBar,
  EmptyState,
  Project,
  formatCurrency,
  BRANCHES,
  PROJECT_TYPES,
  DIFFICULTIES,
} from '@gotechplace/shared';
import { AdminService } from '../../services/adminService';

export interface AdminProjectsScreenProps {
  onBack?: () => void;
}

export const AdminProjectsScreen: React.FC<AdminProjectsScreenProps> = ({ onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modal State for Add / Edit
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form Fields (All 12 fields)
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBranch, setFormBranch] = useState('CSE / IT');
  const [formType, setFormType] = useState<'Minor' | 'Major'>('Minor');
  const [formDifficulty, setFormDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [formDuration, setFormDuration] = useState('4–6 weeks');
  const [formOriginalCost, setFormOriginalCost] = useState('8900');
  const [formDiscountedCost, setFormDiscountedCost] = useState('7100');
  const [formAvailability, setFormAvailability] = useState<'Available' | 'Booked'>('Available');
  const [formCapacity, setFormCapacity] = useState('25');
  const [formTechs, setFormTechs] = useState('ESP32, 4-Channel Relay, Mobile App (Blynk), Wi-Fi Module');
  const [formImage, setFormImage] = useState('/images/projects/1.webp');

  const loadData = () => {
    const list = AdminService.getAllProjects();
    setProjects(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProjectId(null);
    setFormTitle('');
    setFormDesc('');
    setFormBranch('CSE / IT');
    setFormType('Minor');
    setFormDifficulty('Intermediate');
    setFormDuration('4–6 weeks');
    setFormOriginalCost('8900');
    setFormDiscountedCost('7100');
    setFormAvailability('Available');
    setFormCapacity('25');
    setFormTechs('ESP32, 4-Channel Relay, Mobile App (Blynk), Wi-Fi Module');
    setFormImage('/images/projects/1.webp');
    setIsModalVisible(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProjectId(p.project_id);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormBranch(p.branch);
    setFormType(p.project_type);
    setFormDifficulty(p.difficulty);
    setFormDuration(p.duration);
    setFormOriginalCost(String(p.original_cost || 8000));
    setFormDiscountedCost(String(p.discounted_cost || p.cost || 6000));
    setFormAvailability(p.availability === 'Booked' ? 'Booked' : 'Available');
    setFormCapacity(String(p.capacity || 25));
    setFormTechs(p.technologies ? p.technologies.join(', ') : '');
    setFormImage(p.image || '/images/projects/1.webp');
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      Alert.alert('Validation Error', 'Project title is required.');
      return;
    }

    const techArray = formTechs
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectData: Partial<Project> = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      branch: formBranch,
      project_type: formType,
      difficulty: formDifficulty,
      duration: formDuration.trim() || '4–6 weeks',
      original_cost: Number(formOriginalCost) || 8900,
      discounted_cost: Number(formDiscountedCost) || 7100,
      cost: Number(formDiscountedCost) || 7100,
      availability: formAvailability,
      capacity: Number(formCapacity) || 25,
      technologies: techArray.length > 0 ? techArray : ['General Engineering'],
      image: formImage.trim() || '/images/projects/1.webp',
      components: techArray,
    };

    if (editingProjectId) {
      AdminService.updateProject(editingProjectId, projectData);
      Alert.alert('Success', 'Project updated successfully.');
    } else {
      AdminService.createProject(projectData);
      Alert.alert('Success', 'New project created successfully.');
    }

    setIsModalVisible(false);
    loadData();
  };

  const handleDelete = (p: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${p.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            AdminService.deleteProject(p.project_id);
            loadData();
          },
        },
      ]
    );
  };

  const handleToggleAvailability = (p: Project) => {
    AdminService.toggleProjectAvailability(p.project_id);
    loadData();
  };

  const filteredProjects = projects.filter((p) => {
    const matchesBranch = selectedBranch === 'All' || p.branch.toLowerCase().includes(selectedBranch.toLowerCase());
    const matchesType = selectedType === 'All' || p.project_type === selectedType;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesBranch && matchesType && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Projects Control"
        subtitle="Catalog & pricing management for all branches"
        showBack={!!onBack}
        onBack={onBack}
      />

      {/* Top Action & Search Bar */}
      <View style={styles.topBar}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search projects by title or tech..."
        />
        <Button
          title="+ ADD NEW PROJECT"
          onPress={openAddModal}
          size="sm"
          style={styles.addBtn}
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', ...BRANCHES].map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => setSelectedBranch(b)}
              style={[styles.filterPill, selectedBranch === b && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, selectedBranch === b && styles.filterPillTextActive]}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Projects List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No Projects Found"
            message="Try changing the branch filter or search query."
          />
        ) : (
          filteredProjects.map((item) => {
            const orig = item.original_cost || Math.round((item.cost || 6000) * 1.25);
            const disc = item.discounted_cost || item.cost || 6000;
            const isAvailable = item.availability === 'Available';

            return (
              <Card key={item.project_id} style={styles.projectCard}>
                {/* Header row with badges */}
                <View style={styles.cardHeader}>
                  <View style={styles.badgeRow}>
                    <Badge
                      label={`${item.project_type} Project`}
                      variant={item.project_type === 'Major' ? 'brand' : 'purple'}
                      size="sm"
                    />
                    <View style={styles.branchPill}>
                      <Text style={styles.branchPillText}>{item.branch}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.statusToggle, isAvailable ? styles.statusAvail : styles.statusBooked]}
                    onPress={() => handleToggleAvailability(item)}
                  >
                    <Text style={[styles.statusToggleText, isAvailable ? styles.statusAvailText : styles.statusBookedText]}>
                      {item.availability}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Title and description */}
                <Text style={styles.projectTitle}>{item.title}</Text>
                <Text style={styles.projectDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Tech chips */}
                <View style={styles.techRow}>
                  {item.technologies.slice(0, 4).map((tech) => (
                    <View key={tech} style={styles.techChip}>
                      <Text style={styles.techChipText}>{tech}</Text>
                    </View>
                  ))}
                  {item.technologies.length > 4 && (
                    <Text style={styles.moreTechText}>+{item.technologies.length - 4}</Text>
                  )}
                </View>

                {/* Specs metadata */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>🕒 {item.duration} • 👥 {item.capacity} Teams</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.origPrice}>{formatCurrency(orig)}</Text>
                    <Text style={styles.discPrice}>{formatCurrency(disc)}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit All Fields</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add / Edit Project Full Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProjectId ? 'Edit Academic Project' : 'Create New Academic Project'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Input
                label="Project Title"
                placeholder="e.g. IoT-Based 4 Channel Home Automation"
                value={formTitle}
                onChangeText={setFormTitle}
              />

              <Input
                label="Description & Summary"
                placeholder="Detailed explanation of the project hardware & software..."
                value={formDesc}
                onChangeText={setFormDesc}
                multiline
                numberOfLines={3}
              />

              {/* Branch Selector */}
              <Text style={styles.fieldLabel}>Engineering Branch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                {BRANCHES.map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setFormBranch(b)}
                    style={[styles.formPill, formBranch === b && styles.formPillActive]}
                  >
                    <Text style={[styles.formPillText, formBranch === b && styles.formPillTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Project Type & Difficulty Row */}
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Category / Type</Text>
                  <View style={styles.segmentedRow}>
                    {(['Minor', 'Major'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setFormType(t)}
                        style={[styles.segmentBtn, formType === t && styles.segmentBtnActive]}
                      >
                        <Text style={[styles.segmentText, formType === t && styles.segmentTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.fieldLabel}>Difficulty</Text>
                  <View style={styles.segmentedRow}>
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setFormDifficulty(d)}
                        style={[styles.segmentBtn, formDifficulty === d && styles.segmentBtnActive]}
                      >
                        <Text style={[styles.segmentText, formDifficulty === d && styles.segmentTextActive]}>
                          {d.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Duration & Capacity Row */}
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label="Estimated Duration"
                    placeholder="e.g. 4–6 weeks"
                    value={formDuration}
                    onChangeText={setFormDuration}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Input
                    label="Max Team Capacity"
                    placeholder="e.g. 25"
                    value={formCapacity}
                    onChangeText={setFormCapacity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Pricing Row */}
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label="Original Price (₹ Strike)"
                    placeholder="8900"
                    value={formOriginalCost}
                    onChangeText={setFormOriginalCost}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Input
                    label="Listed / Discounted Price (₹)"
                    placeholder="7100"
                    value={formDiscountedCost}
                    onChangeText={setFormDiscountedCost}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Availability Status */}
              <Text style={styles.fieldLabel}>Availability Status</Text>
              <View style={styles.segmentedRow}>
                {(['Available', 'Booked'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setFormAvailability(st)}
                    style={[styles.segmentBtn, formAvailability === st && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentText, formAvailability === st && styles.segmentTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Technologies / Components */}
              <Input
                label="Components & Technologies (Comma-separated)"
                placeholder="ESP32, 4-Channel Relay, Mobile App (Blynk), Wi-Fi Module"
                value={formTechs}
                onChangeText={setFormTechs}
              />

              {/* Image Preview URL */}
              <Input
                label="Hardware Prototype Image Path / URL"
                placeholder="/images/projects/1.webp"
                value={formImage}
                onChangeText={setFormImage}
              />

              <Button
                title={editingProjectId ? "SAVE ALL CHANGES" : "PUBLISH PROJECT TO MARKETPLACE"}
                onPress={handleSave}
                size="lg"
                style={{ marginVertical: SPACING.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    gap: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  addBtn: {
    marginTop: 4,
  },
  filterSection: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.base,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.gray[100],
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.brand[600],
  },
  filterPillText: {
    fontSize: 11,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  projectCard: {
    marginBottom: SPACING.md,
    padding: SPACING.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchPill: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  branchPillText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[600],
  },
  statusToggle: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  statusAvail: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBooked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statusAvailText: {
    color: '#047857',
  },
  statusBookedText: {
    color: '#DC2626',
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 12,
    color: COLORS.gray[600],
    lineHeight: 16,
    marginBottom: SPACING.xs + 2,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  techChip: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  techChipText: {
    fontSize: 10,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  moreTechText: {
    fontSize: 10,
    color: COLORS.gray[400],
    alignSelf: 'center',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    marginBottom: SPACING.sm,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.gray[500],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  origPrice: {
    fontSize: 11,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  discPrice: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#059669',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[200],
    borderWidth: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.base,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    paddingBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.gray[500],
    fontWeight: 'bold',
  },
  modalScroll: {
    paddingBottom: SPACING.xl,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[700],
    marginBottom: 4,
    marginTop: 6,
  },
  pillsScroll: {
    marginBottom: SPACING.sm,
  },
  formPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.gray[100],
    marginRight: 6,
  },
  formPillActive: {
    backgroundColor: COLORS.brand[600],
  },
  formPillText: {
    fontSize: 11,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  formPillTextActive: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: RADIUS.md,
    padding: 2,
    marginBottom: SPACING.sm,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: RADIUS.md - 2,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.brand[600],
  },
  segmentText: {
    fontSize: 11,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
