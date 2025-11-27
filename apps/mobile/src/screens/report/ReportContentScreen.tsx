import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {
  TopHeaderBar,
  Button,
  Dropdown,
  AnimatedInput,
  DropdownItem,
  Subtitle,
  BodySmall,
  LoadingIndicator,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useTranslation} from '@hooks/useTranslation';
import {useReportContent} from '@services/content-report.service';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ContentType, ReportReason} from '@motorove/shared';
import {loggingService} from '@services/logging.service';
import {
  contentReportSchemas,
  ContentReportFormValues,
} from '@utils/validation/contentReportValidation';
import {EnumUtils} from '@utils/enumUtils';

type ReportContentScreenRouteParams = {
  contentType: ContentType;
  contentId: string;
};

export const ReportContentScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'ReportContent'>>();
  const route = useRoute();
  const {t} = useTranslation();
  const {contentType: routeContentType, contentId} =
    (route.params as ReportContentScreenRouteParams) || {};

  const [selectedContentType, setSelectedContentType] =
    useState<DropdownItem | null>(
      routeContentType
        ? {
            id: routeContentType,
            label: EnumUtils.convertContentType(routeContentType),
            value: routeContentType,
          }
        : null,
    );
  const [selectedReason, setSelectedReason] = useState<DropdownItem | null>(
    null,
  );

  const {reportContent, loading: isLoading} = useReportContent(() => {
    // On success callback
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  });

  // Get content types and report reasons from the shared enums
  const contentTypeOptions = EnumUtils.getContentTypeDropdownOptions();
  const reasonOptions = EnumUtils.getReportReasonDropdownOptions();

  // Get schema with translations
  const {contentReportSchema} = contentReportSchemas(t);

  // Setup form with React Hook Form and zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<ContentReportFormValues>({
    resolver: zodResolver(contentReportSchema),
    defaultValues: {
      contentType: routeContentType || '',
      reason: '',
      description: '',
    },
    mode: 'onChange',
  });

  const handleContentTypeSelect = (item: DropdownItem | null) => {
    setSelectedContentType(item);
    setValue('contentType', item?.value || '', {shouldValidate: true});
  };

  const handleReasonSelect = (item: DropdownItem | null) => {
    setSelectedReason(item);
    setValue('reason', item?.value || '', {shouldValidate: true});
  };

  const onSubmit = async (data: ContentReportFormValues) => {
    try {
      if (!contentId) {
        loggingService.error('Content ID is missing');
        return;
      }

      // Prepare form data for the content report
      const reportInput = {
        contentType: data.contentType as ContentType,
        contentId: contentId,
        reason: data.reason as ReportReason,
        description: data.description || undefined,
      };

      // Call the reportContent method
      await reportContent(reportInput);
    } catch (error) {
      loggingService.error('Error submitting content report:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.reportContent.title')}
        showBackButton
        showShadow={false}
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Subtitle weight="bold" align="center" style={styles.screenTitle}>
              {t('screens.reportContent.heading')}
            </Subtitle>
            <BodySmall align="center" style={styles.description}>
              {t('screens.reportContent.description')}
            </BodySmall>

            <View style={styles.form}>
              <Dropdown
                label={t('screens.reportContent.content_type')}
                data={contentTypeOptions}
                onSelect={handleContentTypeSelect}
                selectedItem={selectedContentType}
                error={errors.contentType?.message}
                showClearButton={false}
                disabled={!!routeContentType}
              />

              <Dropdown
                label={t('screens.reportContent.reason')}
                data={reasonOptions}
                onSelect={handleReasonSelect}
                selectedItem={selectedReason}
                error={errors.reason?.message}
                showClearButton={false}
              />

              <AnimatedInput
                control={control}
                name="description"
                label={t('screens.reportContent.description_label')}
                error={errors.description}
                multiline
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <View style={styles.buttonContainer}>
        <Button
          title={t('common.submit')}
          variant="dark"
          size="medium"
          shape="round"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </View>
      <LoadingIndicator visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  content: {
    padding: spacing.md,
  },
  screenTitle: {
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  description: {
    color: colors.neutral.grey,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  form: {
    flex: 1,
    gap: spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
});
