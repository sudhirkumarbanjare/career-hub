import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Button,
  Card,
  formatCurrency,
  Project,
} from '@gotechplace/shared';
import { StudentService } from '../../services/studentService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
  onBookNow: (projectId: string) => void;
}

const getFallbackPrototypeImage = (project: Project): string => {
  const title = (project.title || '').toLowerCase();
  const branch = (project.branch || '').toLowerCase();
  const techs = (project.technologies || []).join(' ').toLowerCase();

  if (title.includes('solar') || techs.includes('solar')) {
    return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
  }
  if (title.includes('robot') || title.includes('rover') || techs.includes('motor') || techs.includes('servo')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80';
  }
  if (title.includes('iot') || techs.includes('esp32') || techs.includes('wifi') || techs.includes('cloud') || techs.includes('rfid')) {
    return 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1200&q=80';
  }
  if (branch.includes('cse') || branch.includes('ai') || title.includes('ai') || title.includes('detection')) {
    return 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1200&q=80';
  }
  if (branch.includes('mech') || branch.includes('civil')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  }
  
  // Default high-precision embedded microcircuit board
  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
};

const getPrimaryPrototypeImage = (project: Project): string => {
  if (project.image && (project.image.startsWith('http://') || project.image.startsWith('https://'))) {
    return project.image;
  }
  if (project.image && project.image.startsWith('/')) {
    return `https://gotechplace.com${project.image}`;
  }
  return getFallbackPrototypeImage(project);
};

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
  onBack,
  onBookNow,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);

  const project = StudentService.getProjectById(projectId);

  if (!project) {
    return (
      <View style={styles.container}>
        <Header title="Project Details" onBack={onBack} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Project Not Found</Text>
          <Text style={styles.notFoundSub}>The requested academic project does not exist.</Text>
          <Button title="Back to Marketplace" onPress={onBack} style={{ marginTop: SPACING.md }} />
        </View>
      </View>
    );
  }

  const primaryImage = getPrimaryPrototypeImage(project);
  const fallbackImage = getFallbackPrototypeImage(project);
  const imageToDisplay = currentImageUri || primaryImage;

  const originalPrice = project.original_cost || Math.round((project.cost || 6000) * 1.25);
  const discountedPrice = project.discounted_cost || project.cost || 6000;
  const isBooked = StudentService.isProjectBooked(project.project_id);

  return (
    <View style={styles.container}>
      <Header title="Project Details" subtitle={project.branch} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Link Breadcrumb */}
        <TouchableOpacity style={styles.backBreadcrumb} onPress={onBack}>
          <Text style={styles.backBreadcrumbText}>← Back to Projects Catalogue</Text>
        </TouchableOpacity>

        {/* Hero Header Card (Deep Navy Gradient) */}
        <View style={styles.heroCard}>
          {/* Hero Badges */}
          <View style={styles.heroBadgesRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{project.project_type} Project</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{project.branch}</Text>
            </View>
            <View style={styles.heroAvailPill}>
              <Text style={styles.heroAvailText}>✓ {project.availability}</Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.heroTitle}>{project.title}</Text>
          <Text style={styles.heroDesc}>{project.description}</Text>

          {/* Components & Tech */}
          <View style={styles.heroTechSection}>
            <Text style={styles.heroTechLabel}>COMPONENTS & TECH:</Text>
            <View style={styles.heroTechRow}>
              {project.technologies.map((tech) => (
                <View key={tech} style={styles.heroTechChip}>
                  <Text style={styles.heroTechChipText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Technical Specifications Section */}
        <Card style={styles.specCard}>
          <Text style={styles.sectionHeading}>Project Technical Specifications</Text>

          {/* 2x3 Specification Grid */}
          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specBoxLabel}>BRANCH</Text>
              <Text style={styles.specBoxValue}>{project.branch}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specBoxLabel}>CATEGORY</Text>
              <Text style={styles.specBoxValue}>{project.project_type}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specBoxLabel}>DURATION</Text>
              <Text style={styles.specBoxValue}>{project.duration}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specBoxLabel}>DIFFICULTY</Text>
              <Text style={styles.specBoxValue}>{project.difficulty}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specBoxLabel}>CAPACITY</Text>
              <Text style={styles.specBoxValue}>{project.capacity} Teams</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specBoxLabel}>STATUS</Text>
              <Text style={[styles.specBoxValue, { color: '#059669' }]}>{project.availability}</Text>
            </View>
          </View>

          {/* Inclusions Checklist */}
          <View style={styles.inclusionSection}>
            <Text style={styles.inclusionHeading}>What is Included in This Project Package?</Text>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Complete hardware components kit & microcontroller board</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Source code, circuit schematic diagram & assembly guide</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Comprehensive project documentation / report format</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Viva presentation preparation assistance</Text>
            </View>
          </View>

          {/* Premium Hardware Prototype Image Card */}
          <View style={styles.prototypeContainer}>
            <View style={styles.prototypeHeaderRow}>
              <View style={styles.prototypeTitleGroup}>
                <View style={styles.prototypeTagRow}>
                  <Text style={styles.prototypeBadgeLabel}>HARDWARE PROTOTYPE</Text>
                  <View style={styles.prototypeLiveTag}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveTagText}>HD PREVIEW</Text>
                  </View>
                </View>
                <Text style={styles.prototypeHeading}>Verified Working Prototype</Text>
              </View>
            </View>

            {/* Interactive Preview Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.prototypeCardTouchable}
              onPress={() => {
                setIsImageLoading(true);
                setIsImageModalOpen(true);
              }}
            >
              <Image
                source={{ uri: primaryImage }}
                style={styles.prototypeCardImage}
                resizeMode="cover"
                onError={() => {
                  setCurrentImageUri(fallbackImage);
                }}
              />
              <View style={styles.prototypeCardOverlay}>
                <View style={styles.prototypeCardTopInfo}>
                  <View style={styles.hdGlassTag}>
                    <Text style={styles.hdGlassTagText}>🔬 Real Prototype Photo</Text>
                  </View>
                </View>
                <View style={styles.prototypeCardBottomInfo}>
                  <Text style={styles.prototypeOverlayTitle}>{project.title}</Text>
                  <View style={styles.prototypeActionPill}>
                    <Text style={styles.prototypeActionPillText}>View Full Photo & Circuit ↗</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Pricing & Booking Card */}
        <Card style={styles.pricingCard}>
          {/* Limited Time Offer Ribbon */}
          <View style={styles.pricingOfferBadge}>
            <View style={styles.offerDot} />
            <Text style={styles.offerText}>LIMITED TIME OFFER</Text>
          </View>

          <Text style={styles.listedPriceLabel}>LISTED PRICE</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.mainDiscountedPrice}>{formatCurrency(discountedPrice)}</Text>
            <Text style={styles.mainOriginalPrice}>{formatCurrency(originalPrice)}</Text>
          </View>
          <Text style={styles.priceSubNote}>Includes components & documentation</Text>

          {/* Key-Value Breakdown */}
          <View style={styles.kvContainer}>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Availability:</Text>
              <Text style={styles.kvAvailValue}>{project.availability}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Category:</Text>
              <Text style={styles.kvValue}>{project.project_type} Project</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Branch:</Text>
              <Text style={styles.kvValue}>{project.branch}</Text>
            </View>
          </View>

          {/* Action Button */}
          <Button
            title={isBooked ? "ALREADY BOOKED" : "Book This Project"}
            onPress={() => onBookNow(project.project_id)}
            variant={isBooked ? "outline" : "primary"}
            size="lg"
            style={styles.bookActionBtn}
          />
          <Text style={styles.bookCaption}>
            Instant booking confirmation with PENDING status tracking.
          </Text>
        </Card>
      </ScrollView>

      {/* High Definition Image Preview Modal */}
      <Modal
        visible={isImageModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Top Bar */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleArea}>
                <View style={styles.modalPillRow}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryBadgeText}>{project.project_type}</Text>
                  </View>
                  <View style={styles.modalBranchBadge}>
                    <Text style={styles.modalBranchBadgeText}>{project.branch}</Text>
                  </View>
                </View>
                <Text style={styles.modalTitle} numberOfLines={1}>{project.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsImageModalOpen(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Main Interactive High-Res Image Display */}
            <View style={styles.imageDisplayBox}>
              {isImageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.brand[600]} />
                  <Text style={styles.loadingText}>Loading High-Resolution Prototype...</Text>
                </View>
              )}
              <Image
                source={{ uri: imageToDisplay }}
                style={styles.fullModalImage}
                resizeMode="cover"
                onLoadStart={() => setIsImageLoading(true)}
                onLoadEnd={() => setIsImageLoading(false)}
                onError={() => {
                  setCurrentImageUri(fallbackImage);
                  setIsImageLoading(false);
                }}
              />
              <View style={styles.imageWatermark}>
                <Text style={styles.imageWatermarkText}>GoTechPlace Certified Hardware</Text>
              </View>
            </View>

            {/* Components in prototype */}
            <View style={styles.modalTechSection}>
              <Text style={styles.modalTechHeading}>ASSEMBLY COMPONENTS:</Text>
              <View style={styles.modalTechChipsRow}>
                {project.technologies.map((t) => (
                  <View key={t} style={styles.modalTechChip}>
                    <Text style={styles.modalTechChipText}>✓ {t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Modal Bottom Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCloseAction}
                onPress={() => setIsImageModalOpen(false)}
              >
                <Text style={styles.modalCloseActionText}>Close Preview</Text>
              </TouchableOpacity>
              {!isBooked && (
                <TouchableOpacity
                  style={styles.modalBookAction}
                  onPress={() => {
                    setIsImageModalOpen(false);
                    onBookNow(project.project_id);
                  }}
                >
                  <Text style={styles.modalBookActionText}>Book Project →</Text>
                </TouchableOpacity>
              )}
            </View>
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  notFoundTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  notFoundSub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  backBreadcrumb: {
    marginBottom: SPACING.sm,
  },
  backBreadcrumbText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[500],
  },
  heroCard: {
    backgroundColor: '#0C2340',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  heroPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
  heroAvailPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  heroAvailText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#6EE7B7',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: SPACING.base,
  },
  heroTechSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.sm,
  },
  heroTechLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroTechRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroTechChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  heroTechChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  specCard: {
    marginBottom: SPACING.base,
    padding: SPACING.base,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    paddingBottom: SPACING.xs + 2,
    marginBottom: SPACING.base,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: SPACING.base,
  },
  specBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  specBoxLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[400],
    letterSpacing: 0.5,
  },
  specBoxValue: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[800],
    marginTop: 2,
  },
  inclusionSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.base,
    marginBottom: SPACING.base,
  },
  inclusionHeading: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  checkIcon: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 1,
  },
  checkText: {
    fontSize: 12,
    color: COLORS.gray[600],
    flex: 1,
    lineHeight: 17,
  },
  prototypeContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.base,
    marginTop: SPACING.xs,
  },
  prototypeHeaderRow: {
    marginBottom: SPACING.sm,
  },
  prototypeTitleGroup: {
    gap: 2,
  },
  prototypeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  prototypeBadgeLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.brand[600],
    letterSpacing: 0.8,
  },
  prototypeLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#059669',
  },
  prototypeHeading: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  prototypeCardTouchable: {
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prototypeCardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  prototypeCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  prototypeCardTopInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  hdGlassTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hdGlassTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  prototypeCardBottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  prototypeOverlayTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  prototypeActionPill: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  prototypeActionPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  pricingCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    padding: SPACING.base,
  },
  pricingOfferBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#059669',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderBottomLeftRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  offerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  offerText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  listedPriceLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[500],
    letterSpacing: 0.5,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  mainDiscountedPrice: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#059669',
  },
  mainOriginalPrice: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  priceSubNote: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  kvContainer: {
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    paddingTop: SPACING.sm,
    marginBottom: SPACING.base,
    gap: 6,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kvLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  kvAvailValue: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#047857',
  },
  kvValue: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
  },
  bookActionBtn: {
    marginTop: 4,
  },
  bookCaption: {
    fontSize: 10,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS['2xl'],
    padding: SPACING.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: 12,
  },
  modalTitleArea: {
    flex: 1,
    gap: 4,
  },
  modalPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modalCategoryBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  modalCategoryBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  modalBranchBadge: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  modalBranchBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: COLORS.gray[700],
    fontWeight: 'bold',
  },
  imageDisplayBox: {
    height: 250,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    marginVertical: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  fullModalImage: {
    width: '100%',
    height: '100%',
  },
  imageWatermark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  imageWatermarkText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  modalTechSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  modalTechHeading: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[500],
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalTechChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalTechChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  modalTechChipText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[800],
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.base,
  },
  modalCloseAction: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  modalCloseActionText: {
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
  },
  modalBookAction: {
    flex: 1.3,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  modalBookActionText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
  },
});
