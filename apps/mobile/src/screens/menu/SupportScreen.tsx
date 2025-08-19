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
import {supportService} from '@services/support.service';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// Support request categories
type SupportCategory = 'technical' | 'account' | 'feedback' | 'other';

// Create schema for form validation
const supportFormSchema = z.object({
  category: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1).min(10),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export const SupportScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Support'>>();
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<DropdownItem | null>(
    null,
  );

  const categoryOptions: DropdownItem[] = [
    {
      id: 'technical',
      label: t('screens.support.technical_support'),
      value: 'technical',
    },
    {
      id: 'account',
      label: t('screens.support.account_issues'),
      value: 'account',
    },
    {id: 'feedback', label: t('screens.support.feedback'), value: 'feedback'},
    {id: 'other', label: t('screens.support.other'), value: 'other'},
  ];

  // Setup form with React Hook Form and zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      category: 'technical',
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
    setIsLoading(true);
    try {
      // Send support request with form data
      await supportService.sendSupportRequest({
        category: data.category as SupportCategory,
        subject: data.subject,
        message: data.message,
      });
      showToast({
        type: 'success',
        text1: t('screens.support.success_title'),
        text2: t('screens.support.success_message'),
      });
      navigation.goBack();
    } catch (error) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.support.submission_error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.support.title')}
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
          title={t('screens.support.submit')}
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
