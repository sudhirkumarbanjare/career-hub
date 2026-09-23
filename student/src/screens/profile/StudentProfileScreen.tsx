import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Avatar,
  Badge,
  Button,
  Modal,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface StudentProfileScreenProps {
  onLogout: () => void;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ onLogout }) => {
  const [student, setStudent] = useState(StudentService.getCurrentStudent());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(student.name);
  const [editCollege, setEditCollege] = useState(student.college);
  const [editLocation, setEditLocation] = useState(student.location);
  const [editBio, setEditBio] = useState(student.bio || '');
  const [editSkills, setEditSkills] = useState(student.skills.join(', '));
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = () => {
    setSaving(true);
    const skills = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = StudentService.updateProfile({
      name: editName,
      college: editCollege,
      location: editLocation,
      bio: editBio,
      skills,
    });
    setStudent(updated);
    setSaving(false);
    setIsEditModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Student Profile"
        rightAction={
          <Button
            title="Edit ✎"
            onPress={() => setIsEditModalOpen(true)}
            variant="ghost"
            size="sm"
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header Card */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <Avatar name={student.name} size="xl" />
            <View style={styles.nameBlock}>
              <Text style={styles.nameText}>{student.name}</Text>
              <Text style={styles.branchText}>{student.branch}</Text>
              <Text style={styles.collegeText}>{student.college}</Text>
              <Badge label="Active Student" variant="success" size="sm" style={{ marginTop: 4 }} />
            </View>
          </View>

          {student.bio ? (
            <Text style={styles.bioText}>{student.bio}</Text>
          ) : null}
        </Card>

        {/* Academic Details */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Academic Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID:</Text>
            <Text style={styles.infoValue}>{student.student_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Year:</Text>
            <Text style={styles.infoValue}>{student.year}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Semester:</Text>
            <Text style={styles.infoValue}>{student.semester}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile:</Text>
            <Text style={styles.infoValue}>{student.mobile}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{student.location}</Text>
          </View>
        </Card>

        {/* Technical Skills */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Verified Skills</Text>
          <View style={styles.skillsGrid}>
            {student.skills.map((skill) => (
              <Badge key={skill} label={skill} variant="brand" size="md" />
            ))}
          </View>
        </Card>

        <Button
          title="LOG OUT OF STUDENT ACCOUNT"
          onPress={onLogout}
          variant="danger"
          size="md"
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
      >
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          value={editName}
          onChangeText={setEditName}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>College / Institute</Text>
        <TextInput
          value={editCollege}
          onChangeText={setEditCollege}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Location / City</Text>
        <TextInput
          value={editLocation}
          onChangeText={setEditLocation}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Skills (comma-separated)</Text>
        <TextInput
          value={editSkills}
          onChangeText={setEditSkills}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          value={editBio}
          onChangeText={setEditBio}
          multiline
          numberOfLines={3}
          style={[styles.textInput, { minHeight: 64, textAlignVertical: 'top' }]}
        />

        <Button
          title="SAVE CHANGES ✓"
          onPress={handleSaveProfile}
          loading={saving}
          size="lg"
          style={{ marginTop: SPACING.base }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  profileHeaderCard: {
    marginBottom: SPACING.base,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nameBlock: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  branchText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 1,
  },
  collegeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  bioText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  sectionCard: {
    marginBottom: SPACING.base,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[900],
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  logoutBtn: {
    marginTop: SPACING.base,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
});
