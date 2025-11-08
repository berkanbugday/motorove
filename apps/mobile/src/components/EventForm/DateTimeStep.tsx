import React from 'react';
import {View, StyleSheet} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Control, FieldError, FieldErrors} from 'react-hook-form';
import {
  DateTimePicker,
  Typography,
  Switch,
  Tabs,
  GroupSelector,
  UserSelector,
} from '@components';
import {colors, spacing, radius} from '@theme';
import {useTranslation} from '@hooks/useTranslation';

interface DateTimeStepProps {
  control: Control<any>;
  errors: FieldErrors;
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
  language: string;
  isPrivate: boolean;
  onTogglePrivacy: (value: boolean) => void;
  activeInviteTab: string;
  onTabChange: (key: string) => void;
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  selectedGroups: string[];
  onGroupsChange: (groupIds: string[]) => void;
  disableRestrictedFields?: boolean;
}

export const DateTimeStep: React.FC<DateTimeStepProps> = ({
  control,
  errors,
  startDate,
  startTime,
  endDate,
  endTime,
  language,
  isPrivate,
  onTogglePrivacy,
  activeInviteTab,
  onTabChange,
  selectedUsers,
  onUsersChange,
  selectedGroups,
  onGroupsChange,
  disableRestrictedFields = false,
}) => {
  const {t} = useTranslation();

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}>
      <View style={styles.formFields}>
        {/* Start Date and Time */}
        <View style={styles.dateTimeContainer}>
          <DateTimePicker
            control={control}
            name="startDate"
            placeholder={t('screens.event.start_date')}
            cancelText={t('common.cancel')}
            confirmText={t('common.confirm')}
            displayFormat="long"
            mode="date"
            defaultValue={startDate}
            minimumDate={new Date()}
            style={styles.dateTimePicker}
            error={errors.startDate as FieldError}
            key="startDate-picker"
            locale={language}
          />
          <DateTimePicker
            control={control}
            name="startTime"
            placeholder={t('screens.event.start_time')}
            cancelText={t('common.cancel')}
            confirmText={t('common.confirm')}
            mode="time"
            defaultValue={startTime}
            minuteInterval={15}
            style={styles.dateTimePicker}
            error={errors.startTime as FieldError}
            key="startTime-picker"
            locale={language}
          />
        </View>

        {/* End Date and Time */}
        <View style={styles.dateTimeContainer}>
          <DateTimePicker
            control={control}
            name="endDate"
            placeholder={t('screens.event.end_date')}
            cancelText={t('common.cancel')}
            confirmText={t('common.confirm')}
            displayFormat="long"
            mode="date"
            defaultValue={endDate}
            minimumDate={new Date()}
            style={styles.dateTimePicker}
            error={errors.endDate as FieldError}
            key="endDate-picker"
            locale={language}
          />
          <DateTimePicker
            control={control}
            name="endTime"
            placeholder={t('screens.event.end_time')}
            cancelText={t('common.cancel')}
            confirmText={t('common.confirm')}
            mode="time"
            defaultValue={endTime}
            minuteInterval={15}
            style={styles.dateTimePicker}
            error={errors.endTime as FieldError}
            key="endTime-picker"
            locale={language}
          />
        </View>

        {/* Privacy Settings */}
        <View>
          <Typography
            variant="body"
            weight="semiBold"
            style={styles.subSectionTitle}>
            {t('screens.event.privacy_settings')}
          </Typography>

          {/* Privacy Switch */}
          <View style={styles.privacySwitchContainer}>
            <Switch
              value={isPrivate}
              onValueChange={onTogglePrivacy}
              label={t('screens.event.private_event')}
              description={t('screens.event.private_event_description')}
              style={{paddingVertical: spacing.md}}
              disabled={disableRestrictedFields}
            />
            {/* Group/User Selectors for Private Events */}
            {isPrivate && !disableRestrictedFields && (
              <View style={styles.privateEventSection}>
                <Tabs
                  items={[
                    {key: 'users', label: t('screens.event.users')},
                    {key: 'groups', label: t('screens.event.groups')},
                  ]}
                  selectedKey={activeInviteTab}
                  onTabChange={onTabChange}
                  variant="minimal"
                  equalWidth={true}
                />

                {activeInviteTab === 'users' && (
                  <View style={styles.tabContent}>
                    <UserSelector
                      selectedUsers={selectedUsers}
                      onUsersChange={onUsersChange}
                      maxUsers={10}
                      disabled={disableRestrictedFields}
                    />
                  </View>
                )}

                {activeInviteTab === 'groups' && (
                  <View style={styles.tabContent}>
                    <GroupSelector
                      selectedGroups={selectedGroups}
                      onGroupsChange={onGroupsChange}
                      maxGroups={3}
                      disabled={disableRestrictedFields}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  formFields: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    gap: spacing.lg,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimePicker: {
    flex: 1,
    marginBottom: spacing.xs,
  },
  subSectionTitle: {
    marginBottom: spacing.xs,
  },
  privacySwitchContainer: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  privateEventSection: {
    margin: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    paddingVertical: spacing.md,
  },
  tabContent: {
    marginTop: spacing.md,
  },
});
