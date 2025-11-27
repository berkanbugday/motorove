import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  IBusiness,
  DayOfWeek,
  BusinessStatus,
  Language,
  ContentType,
} from '@motorove/shared';
import {colors, radius, spacing} from '@theme';
import {
  Body,
  Title,
  Caption,
  Icon,
  Button,
  BottomSheet,
  BodySmall,
  showToast,
  Chip,
  RNMap,
  openMapAppsBottomSheet,
  LoadingIndicator,
} from '@components';
import DropdownMenu, {DropdownMenuItem} from '@components/DropdownMenu';
import {BusinessComments} from '@components/BusinessComments/BusinessComments';
import {EnumUtils} from '@utils/enumUtils';
import type {BottomSheetRef, RNMapMarkerItem} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {
  useGetBusinessComments,
  useGetBusinessAverageRating,
  useGetBusinessCommentCount,
  useCreateBusinessComment,
  useUpdateBusinessComment,
  useRemoveBusinessComment,
} from '@services/business-comment.service';
import {useAuth} from '@contexts/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {
  MainStackParamList,
  MainScreenNavigationProp,
} from '@navigation/types/navigationTypes';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';

type BusinessDetailScreenRouteProp = RouteProp<
  MainStackParamList,
  'BusinessDetail'
>;

export const BusinessDetailScreen: React.FC = () => {
  const route = useRoute<BusinessDetailScreenRouteProp>();
  const navigation =
    useNavigation<MainScreenNavigationProp<'BusinessDetail'>>();
  const {business: businessParam} = route.params;

  const [currentBusiness, setCurrentBusiness] = useState<IBusiness | null>(
    businessParam,
  );
  const [showAllWorkingHours, setShowAllWorkingHours] = useState(false);

  // Bottom sheet refs
  const commentActionsBottomSheetRef = useRef<BottomSheetRef>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );
  const [triggerEdit, setTriggerEdit] = useState<string | null>(null);

  const {t} = useTranslation();
  const {language} = useLanguage();
  const {id: currentUserId} = useAuth();

  // Business comments hooks
  const {
    businessComments,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useGetBusinessComments(currentBusiness?.id || '');
  const {averageRating, refetch: refetchAverageRating} =
    useGetBusinessAverageRating(currentBusiness?.id || '');
  const {commentCount, refetch: refetchCommentCount} =
    useGetBusinessCommentCount(currentBusiness?.id || '');

  const {createBusinessComment, loading: createLoading} =
    useCreateBusinessComment(() => {
      refetchComments();
      refetchAverageRating();
      refetchCommentCount();
    });

  const {removeBusinessComment, loading: removeLoading} =
    useRemoveBusinessComment(() => {
      refetchComments();
      refetchAverageRating();
      refetchCommentCount();
    });

  const {updateBusinessComment, loading: updateLoading} =
    useUpdateBusinessComment(() => {
      refetchComments();
      refetchAverageRating();
      refetchCommentCount();
    });

  // Comprehensive working hours utility
  const useWorkingHours = useCallback(() => {
    if (
      !currentBusiness?.workingHours ||
      currentBusiness.workingHours.length === 0
    ) {
      return {
        today: null,
        isOpen: false,
        status: t('enums.businessStatus.closed'),
        orderedDays: [],
        formatDayName: () => '',
        formatHours: () => '',
      };
    }

    const formatDayName = (dayOfWeek: DayOfWeek): string => {
      return t(`enums.dayOfWeek.${dayOfWeek.toLowerCase()}`);
    };

    const formatHours = (
      startHour?: string,
      endHour?: string,
      isOpen24h?: boolean,
    ): string => {
      if (isOpen24h) {
        return t('enums.businessStatus.open_24_hours');
      }
      if (!startHour || !endHour) {
        return t('enums.businessStatus.closed');
      }
      return `${startHour} - ${endHour}`;
    };

    const today = new Date().getDay();
    const dayMap = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    const todayHours = currentBusiness.workingHours.find(
      wh => wh.dayOfWeek === dayMap[today],
    );

    const isOpen =
      todayHours?.isOpen24h || !!(todayHours?.startHour && todayHours?.endHour);
    const status = todayHours
      ? formatHours(
          todayHours.startHour,
          todayHours.endHour,
          todayHours.isOpen24h,
        )
      : t('enums.businessStatus.closed');

    const dayOrder = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ];

    const orderedDays = dayOrder.map(day => {
      const wh = currentBusiness.workingHours.find(w => w.dayOfWeek === day);
      return (
        wh || {
          dayOfWeek: day,
          isOpen24h: false,
          startHour: undefined,
          endHour: undefined,
        }
      );
    });

    return {
      today: todayHours,
      isOpen,
      status,
      orderedDays,
      formatDayName,
      formatHours,
    };
  }, [currentBusiness, t, language]);

  const workingHours = useWorkingHours();

  // Calculate business status based on current time and working hours
  const businessStatus = React.useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert JavaScript day to DayOfWeek enum
    const dayMapping: {[key: number]: DayOfWeek} = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };

    const todayEnum = dayMapping[currentDay];
    const todayWorkingHours = currentBusiness?.workingHours?.find(
      wh => wh.dayOfWeek === todayEnum,
    );

    // If no working hours for today, business is closed
    if (!todayWorkingHours) {
      return {
        status: BusinessStatus.CLOSED,
        label: t('enums.businessStatus.closed'),
      };
    }

    // Check if business is open 24 hours
    if (todayWorkingHours.isOpen24h) {
      return {
        status: BusinessStatus.OPEN_24_HOURS,
        label: t('enums.businessStatus.open_24_hours'),
      };
    }

    // Check if current time is within working hours
    if (todayWorkingHours.startHour && todayWorkingHours.endHour) {
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

      // Parse start and end hours (format: "HH:MM")
      const [startHour, startMinute] = todayWorkingHours.startHour
        .split(':')
        .map(Number);
      const [endHour, endMinute] = todayWorkingHours.endHour
        .split(':')
        .map(Number);

      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      // Handle overnight hours (e.g., 22:00 to 06:00)
      if (startTimeMinutes > endTimeMinutes) {
        // Business closes the next day
        if (currentTime >= startTimeMinutes || currentTime <= endTimeMinutes) {
          return {
            status: BusinessStatus.OPEN,
            label: t('enums.businessStatus.open'),
          };
        }
      } else {
        // Normal hours within the same day
        if (currentTime >= startTimeMinutes && currentTime <= endTimeMinutes) {
          return {
            status: BusinessStatus.OPEN,
            label: t('enums.businessStatus.open'),
          };
        }
      }
    }

    // Default to closed
    return {
      status: BusinessStatus.CLOSED,
      label: t('enums.businessStatus.closed'),
    };
  }, [currentBusiness?.workingHours, t]);

  // Handle phone number call
  const handlePhoneNumberCall = useCallback(async () => {
    if (!currentBusiness?.phoneNumber) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.map.no_phone_number'),
      });
      return;
    }

    try {
      // Format phone number (remove spaces and combine country code with number)
      const phoneNumber =
        `${currentBusiness?.countryCode}${currentBusiness?.phoneNumber}`.replace(
          /\s/g,
          '',
        );
      const phoneUrl = `tel:${phoneNumber}`;

      // On Android, canOpenURL often returns false for tel: URLs even when supported
      // So we skip the check and directly try to open the dialer
      if (Platform.OS === 'android') {
        await Linking.openURL(phoneUrl);
      } else {
        // On iOS, check if the device can make phone calls first
        const canOpenURL = await Linking.canOpenURL(phoneUrl);

        if (canOpenURL) {
          await Linking.openURL(phoneUrl);
        } else {
          showToast({
            type: 'error',
            text1: t('common.error'),
            text2: t('screens.map.phone_not_supported'),
          });
        }
      }
    } catch (error) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.map.phone_call_error'),
      });
    }
  }, [currentBusiness?.countryCode, currentBusiness?.phoneNumber, t]);

  // Comment handlers for BusinessComments component
  const handleCreateComment = useCallback(
    async (rating: number, content: string) => {
      if (!currentBusiness?.id) {
        return;
      }

      await createBusinessComment({
        businessId: currentBusiness.id,
        rating,
        content,
      });
    },
    [currentBusiness?.id, createBusinessComment],
  );

  const handleUpdateComment = useCallback(
    async (id: string, rating: number, content: string) => {
      await updateBusinessComment({
        id,
        rating,
        content,
      });
    },
    [updateBusinessComment],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!currentBusiness?.id) {
        return;
      }

      await removeBusinessComment(commentId, currentBusiness.id);
    },
    [currentBusiness?.id, removeBusinessComment],
  );

  const handleProfilePress = useCallback(
    (userId: string | null) => {
      if (userId && userId !== currentUserId) {
        navigateToScreen(navigation, 'Profile', {userId});
      }
    },
    [navigation],
  );

  const handleGetDirections = useCallback(() => {
    if (!currentBusiness?.addresses || !currentBusiness.addresses[0]) {
      return;
    }
    openMapAppsBottomSheet(
      currentBusiness.addresses[0].latitude,
      currentBusiness.addresses[0].longitude,
      t,
    );
  }, [currentBusiness, t]);

  // Create dropdown menu items for business detail screen (only show report if user didn't create it)
  const businessDropdownMenuItems: DropdownMenuItem[] = [];

  businessDropdownMenuItems.push({
    id: 'report',
    label: t('common.report'),
    icon: 'error-filled',
    isHighlighted: true,
  });

  const handleBusinessDropdownSelect = useCallback(
    (item: DropdownMenuItem) => {
      switch (item.id) {
        case 'report':
          if (currentBusiness?.id) {
            navigateToScreen(navigation, 'ReportContent', {
              contentType: ContentType.BUSINESS,
              contentId: currentBusiness.id,
            });
          }
          break;
      }
    },
    [navigation, currentBusiness?.id],
  );

  // Update business if params change
  useEffect(() => {
    if (businessParam) {
      setCurrentBusiness(businessParam);
    }
  }, [businessParam]);

  if (!currentBusiness) {
    return null;
  }

  const getMarkers = (): RNMapMarkerItem[] => {
    return [
      {
        id: '1',
        coordinate: {
          latitude: currentBusiness.addresses[0].latitude,
          longitude: currentBusiness.addresses[0].longitude,
        },
        pinColor: colors.neutral.black,
        iconName: 'wrench-filled',
      },
    ];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Close Button */}
      <Button
        shape="circle"
        variant="dark"
        size="small"
        iconName="close"
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        testID="back-button"
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}>
          {/* Header Map Section */}
          <View style={styles.header}>
            <RNMap
              style={styles.headerImage}
              initialRegion={{
                latitude: currentBusiness.addresses[0].latitude,
                longitude: currentBusiness.addresses[0].longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              markers={getMarkers()}
            />

            {/* Business Title Overlay */}
            <View style={styles.headerOverlay}>
              <Title weight="bold" color={colors.neutral.white}>
                {currentBusiness.name}
              </Title>

              <View style={styles.categoryRatingRow}>
                <BodySmall weight="semiBold" color={colors.neutral.white}>
                  {EnumUtils.convertBusinessCategory(currentBusiness.category)}
                </BodySmall>
                <View style={styles.ratingContainer}>
                  <Icon
                    name="star-filled"
                    size={14}
                    color={colors.status.warning}
                  />
                  <Caption weight="semiBold" color={colors.neutral.white}>
                    {averageRating ? averageRating.toFixed(1) : '0.0'}
                  </Caption>
                  <Caption weight="semiBold" color={colors.neutral.white}>
                    ({commentCount || 0}{' '}
                    {t('screens.map.comment').toLowerCase()})
                  </Caption>
                </View>
              </View>
            </View>
          </View>

          {/* Business Information Section */}
          <View style={styles.infoSection}>
            {/* More Menu Button - Only show if there are menu items */}
            {businessDropdownMenuItems.length > 0 && (
              <DropdownMenu
                items={businessDropdownMenuItems}
                onSelect={handleBusinessDropdownSelect}
                position="bottom"
                triggerIcon="more-vertical"
                triggerIconSize={24}
                triggerIconColor={colors.neutral.grey}
                triggerContainerStyle={{alignSelf: 'flex-end'}}
                testID="business-detail-dropdown-menu"
              />
            )}
            {/* Address */}
            <View style={styles.infoRow}>
              <Icon name="map-pin-filled" size={20} />
              <View style={styles.infoTextContainer}>
                <Body weight="semiBold">{t('screens.map.address')}</Body>
                <Body lineHeight={25}>
                  {
                    currentBusiness.addresses.find(
                      address => address.language === Language.TR,
                    )?.address
                  }
                </Body>
              </View>
            </View>

            {/* Phone Number */}
            {currentBusiness.phoneNumber && (
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} />
                <View style={styles.infoTextContainer}>
                  <Body weight="semiBold">{t('screens.map.phone')}</Body>
                  <Body>
                    {currentBusiness.countryCode} {currentBusiness.phoneNumber}
                  </Body>
                </View>
              </View>
            )}

            {/* Working Hours */}
            {currentBusiness.workingHours &&
              currentBusiness.workingHours.length > 0 && (
                <View style={styles.infoRow}>
                  <Icon name="clock-filled" size={20} />
                  <View style={styles.infoTextContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        setShowAllWorkingHours(!showAllWorkingHours)
                      }
                      activeOpacity={0.7}
                      style={styles.workingHoursHeader}>
                      <Body weight="semiBold">
                        {t('screens.map.working_hours')}
                      </Body>
                      <Icon
                        name={
                          showAllWorkingHours ? 'chevron-up' : 'chevron-down'
                        }
                        size={20}
                        color={colors.neutral.grey}
                      />
                    </TouchableOpacity>

                    {/* Today's Hours (Always Visible) */}
                    {workingHours.today && (
                      <View style={styles.todayHoursRow}>
                        <Body style={styles.todayLabel}>
                          {workingHours.formatDayName(
                            workingHours.today.dayOfWeek,
                          )}
                        </Body>
                        <Chip
                          label={businessStatus.label}
                          variant="filled"
                          color={
                            businessStatus.status === BusinessStatus.OPEN
                              ? 'success'
                              : businessStatus.status ===
                                BusinessStatus.OPEN_24_HOURS
                              ? 'info'
                              : 'error'
                          }
                          size="small"
                        />
                      </View>
                    )}

                    {/* All Working Hours (Expandable) */}
                    {showAllWorkingHours && (
                      <View style={styles.allWorkingHours}>
                        {workingHours.orderedDays.map(wh => {
                          const isToday =
                            workingHours.today?.dayOfWeek === wh.dayOfWeek;
                          return (
                            <View
                              key={wh.dayOfWeek}
                              style={[styles.workingHourRow]}>
                              <Body style={[isToday && styles.todayDay]}>
                                {workingHours.formatDayName(wh.dayOfWeek)}
                              </Body>
                              <Body
                                style={[
                                  !wh.startHour &&
                                    !wh.isOpen24h &&
                                    styles.closedText,
                                  isToday && styles.todayDay,
                                ]}>
                                {workingHours.formatHours(
                                  wh.startHour,
                                  wh.endHour,
                                  wh.isOpen24h,
                                )}
                              </Body>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              )}

            {/* Description */}
            {currentBusiness.descriptions &&
              currentBusiness.descriptions.length > 0 && (
                <View style={styles.infoRow}>
                  <Icon name="file-filled" size={20} />
                  <View style={styles.infoTextContainer}>
                    <Body weight="semiBold">{t('screens.map.about')}</Body>
                    <Body lineHeight={25}>
                      {
                        currentBusiness.descriptions.find(
                          description =>
                            description.language.toLowerCase() ===
                            language.toLowerCase(),
                        )?.description
                      }
                    </Body>
                  </View>
                </View>
              )}
          </View>

          {/* Comments Section */}
          <BusinessComments
            onPressProfile={handleProfilePress}
            businessComments={businessComments || []}
            averageRating={averageRating || 0}
            commentCount={commentCount || 0}
            commentsLoading={commentsLoading}
            createLoading={createLoading}
            updateLoading={updateLoading}
            currentUserId={currentUserId}
            language={language}
            onCreateComment={handleCreateComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            commentActionsBottomSheetRef={commentActionsBottomSheetRef}
            onSelectComment={setSelectedCommentId}
            triggerEditCommentId={triggerEdit}
            onEditTriggered={() => setTriggerEdit(null)}
          />
        </ScrollView>
      </KeyboardAwareScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          title={t('screens.map.get_directions')}
          variant="dark"
          shape="round"
          iconName="location-arrow-filled"
          onPress={handleGetDirections}
          style={styles.getDirectionButton}
        />
        {currentBusiness.phoneNumber && (
          <Button
            title={t('screens.map.call')}
            variant="primary"
            shape="round"
            iconName="phone"
            onPress={handlePhoneNumberCall}
            style={styles.callButton}
          />
        )}
      </View>

      {/* Comment Actions Bottom Sheet */}
      <BottomSheet
        ref={commentActionsBottomSheetRef}
        initialSnap="closed"
        showBackdrop
        closeOnBackdropPress
        hideHandle={false}
        showCloseButton={false}
        title={t('screens.map.comment_actions')}
        titlePosition="center">
        <View style={styles.commentActionsContent}>
          {selectedCommentId &&
          businessComments?.find(c => c.id === selectedCommentId)?.createdBy
            ?.id === currentUserId ? (
            <>
              <Button
                title={t('common.edit')}
                variant="outline"
                shape="round"
                iconName="pen-filled"
                disabled={removeLoading}
                onPress={() => {
                  if (selectedCommentId) {
                    // Close the bottom sheet first
                    commentActionsBottomSheetRef.current?.close();
                    // Then trigger edit mode in BusinessComments
                    setTriggerEdit(selectedCommentId);
                    setSelectedCommentId(null);
                  }
                }}
                style={styles.commentActionButton}
              />
              <Button
                title={t('common.delete')}
                variant="primary"
                shape="round"
                iconName="trash"
                disabled={removeLoading}
                onPress={async () => {
                  if (selectedCommentId) {
                    await handleDeleteComment(selectedCommentId);
                    commentActionsBottomSheetRef.current?.close();
                    setSelectedCommentId(null);
                  }
                }}
                style={styles.commentActionButton}
              />
            </>
          ) : (
            <Button
              title={t('common.report')}
              variant="primary"
              shape="round"
              iconName="error-filled"
              disabled={removeLoading}
              onPress={() => {
                if (selectedCommentId) {
                  commentActionsBottomSheetRef.current?.close();
                  navigateToScreen(navigation, 'ReportContent', {
                    contentType: ContentType.BUSINESS_COMMENT,
                    contentId: selectedCommentId,
                  });
                  setSelectedCommentId(null);
                }
              }}
              style={styles.commentActionButton}
            />
          )}
        </View>
      </BottomSheet>
      <LoadingIndicator
        visible={createLoading || updateLoading || removeLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 280,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top:
      spacing.md +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44),
    right: spacing.md,
    zIndex: 10,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoSection: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  actionSection: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingVertical: spacing.md,
  },
  getDirectionButton: {
    flex: 1,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.status.successDark,
  },
  mapAppsScroll: {
    paddingBottom: spacing.lg,
  },
  mapAppsScrollContent: {
    gap: spacing.md,
  },
  mapAppName: {
    fontSize: 13,
    textAlign: 'center',
    color: colors.neutral.black,
  },
  mapAppCard: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mapAppCardDisabled: {
    opacity: 0.3,
  },
  mapLogo: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
  },
  commentActionsContent: {
    gap: spacing.md,
  },
  commentActionButton: {
    width: '100%',
  },
  workingHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  todayHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  todayLabel: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
  },
  allWorkingHours: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
  workingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  closedText: {
    color: colors.primary.main,
  },
  todayDay: {
    fontWeight: 'bold',
    color: colors.neutral.black,
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    shadowColor: colors.neutral.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
