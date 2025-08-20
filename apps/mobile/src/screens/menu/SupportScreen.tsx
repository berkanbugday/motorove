import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {
  TopHeaderBar,
  Button,
  Body,
  Title,
  Dropdown,
  showToast,
  AnimatedInput,
  DropdownItem,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useTranslation} from '@hooks/useTranslation';
import {useCreateSupportRequest} from '@services/support.service';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SupportCategory} from '@motorove/shared';
import {loggingService} from '@services/logging.service';
import {
  supportSchemas,
  SupportFormValues,
} from '@utils/validation/supportValidation';
import {EnumUtils} from '@utils/enumUtils';

// Get schema with translations

export const SupportScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Support'>>();
  const {t} = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<DropdownItem | null>(
    null,
  );

  const {createSupportRequest, loading: isLoading} = useCreateSupportRequest(
    () => {
      // On success callback
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    },
  );

  // Get support categories from the shared enum
  const categoryOptions = EnumUtils.getSupportCategories();

  // Get schema with translations
  const {supportRequestSchema} = supportSchemas(t);

  // Setup form with React Hook Form and zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      category: '',
      subject: '',
      message: '',
    },
    mode: 'onChange',
  });

  const handleCategorySelect = (item: DropdownItem | null) => {
    setSelectedCategory(item);
    setValue('category', item?.value || '', {shouldValidate: true});
  };

  const onSubmit = async (data: SupportFormValues) => {
    try {
      // Prepare form data for the support request
      const supportRequestInput = {
        category: data.category as SupportCategory,
        subject: data.subject,
        message: data.message,
        deviceInfo: {}, // This will be populated by the service
      };

      // Call the createSupportRequest method
      await createSupportRequest(supportRequestInput);
    } catch (error) {
      loggingService.error('Error submitting support request:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.support.submission_error'),
      });
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.support_request')}
        showBackButton
        showShadow={false}
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          snapToStart={true}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Title style={styles.screenTitle}>
              {t('screens.support.heading')}
            </Title>
            <Body style={styles.description}>
              {t('screens.support.description')}
            </Body>

            <View style={styles.form}>
              <Dropdown
                label={t('screens.support.category')}
                data={categoryOptions}
                onSelect={handleCategorySelect}
                selectedItem={selectedCategory}
                error={errors.category?.message}
                showClearButton={false}
              />

              <AnimatedInput
                control={control}
                name="subject"
                label={t('screens.support.subject')}
                error={errors.subject}
              />

              <AnimatedInput
                control={control}
                name="message"
                label={t('screens.support.message')}
                error={errors.message}
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
          loading={isLoading}
        />
      </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  screenTitle: {
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.neutral.grey,
    marginBottom: spacing.xl,
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
