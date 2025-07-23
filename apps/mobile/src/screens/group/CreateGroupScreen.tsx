import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  AnimatedInput,
  Button,
  Dropdown,
  MultiSelect,
  MultiSelectItem,
  DropdownItem,
  showToast,
  Caption,
  BodySmall,
} from '@components';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  groupSchemas,
  CreateGroupFormValues,
} from '@utils/validation/groupValidation';
import {loggingService} from '@services/logging.service';
import {useCreateGroup} from '@services/group.service';
import {useGetCities} from '@services/city.service';
import {EnumUtils} from '@utils/enumUtils';
import {ICreateGroup, GroupPrivacy, GroupTag} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<MultiSelectItem[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);

  const {cities, loading: citiesLoading} = useGetCities();
  const privacyOptions = EnumUtils.getGroupPrivacyOptions().filter(
    option => option.value !== GroupPrivacy.ALL,
  );
  const groupTags = EnumUtils.getGroupTags();

  const tagOptions: MultiSelectItem[] = groupTags.map(tag => ({
    id: tag.value,
    label: tag.label,
    value: tag.value,
  }));

  // Use group service hook for creating a group
  const {createGroup, loading: createGroupLoading} = useCreateGroup(() => {
    // On success callback
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  });

  // Get schemas with translations
  const {createGroupSchema} = groupSchemas(t);

  // Setup form with Zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      cover: null,
      city: '',
      privacy: '',
      membersCapacity: null,
      tags: [],
    },
    mode: 'onChange',
  });

  const handleSelectLogo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check file size - 10MB limit
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          showToast({
            type: 'error',
            text1: t('common.error'),
            text2: t('screens.group.image_too_large'),
          });
          return;
        }

        // Use base64 data instead of URI
        setLogo(asset.uri || '');
        setValue(
          'logo',
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '',
          {
            shouldValidate: true,
          },
        );
      }
    } catch (error) {
      loggingService.error('Error selecting image:', error);
    }
  };

  const handleSelectCover = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check file size - 10MB limit
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          showToast({
            type: 'error',
            text1: t('common.error'),
            text2: t('screens.group.image_too_large'),
          });
          return;
        }

        // Use base64 data instead of URI
        setCover(asset.uri || '');
        setValue(
          'cover',
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null,
          {
            shouldValidate: true,
          },
        );
      }
    } catch (error) {
      loggingService.error('Error selecting cover image:', error);
    }
  };

  const handleTagsChange = (items: MultiSelectItem[]) => {
    setSelectedTags(items);
    setValue(
      'tags',
      items.map(item => item.id.toString()),
      {shouldValidate: true},
    );
  };

  function handlePrivacySelect(item: DropdownItem | null) {
    setSelectedPrivacy(item);
    setValue('privacy', item?.value || '', {shouldValidate: true});
  }

  function handleCitySelect(item: DropdownItem | null) {
    setSelectedCity(item);
    setValue('city', item?.value || '', {shouldValidate: true});
  }

  const onSubmit = async (data: CreateGroupFormValues) => {
    try {
      // Prepare form data for the group service
      const createGroupInput: ICreateGroup = {
        name: data.name,
        description: data.description,
        logo: data.logo,
        cover: data.cover,
        cityId: selectedCity?.id as string,
        privacy: selectedPrivacy?.value as GroupPrivacy,
        membersCapacity: data.membersCapacity
          ? parseInt(data.membersCapacity, 10)
          : null,
        tags: selectedTags.map(tag => tag.id.toString() as GroupTag),
      };

      // Call the group service createGroup method
      await createGroup(createGroupInput);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.group.error_creating_group'),
      });
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.group.create_group')}
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
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={handleSelectCover}
            activeOpacity={0.8}>
            {cover ? (
              <Image source={{uri: cover}} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <BodySmall color={colors.neutral.grey}>
                  {t('screens.group.upload_cover_photo')}
                </BodySmall>
              </View>
            )}
          </TouchableOpacity>
          {/* Group Profile Image Selection */}
          <View style={styles.imageSelectionContainer}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={handleSelectLogo}
              activeOpacity={0.8}>
              {logo ? (
                <Image source={{uri: logo}} style={styles.logo} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Caption color={colors.neutral.grey} align="center">
                    {t('screens.group.upload_logo')}
                  </Caption>
                </View>
              )}
            </TouchableOpacity>
            {errors.logo && (
              <Caption
                color={colors.status.error}
                style={{marginTop: spacing.xs}}
                align="center">
                {errors.logo.message}
              </Caption>
            )}
          </View>
          <View style={styles.formFields}>
            <AnimatedInput
              control={control}
              name="name"
              label={t('screens.group.group_name')}
              error={errors.name}
            />

            <AnimatedInput
              control={control}
              name="description"
              label={t('screens.group.description')}
              multiline
              error={errors.description}
            />
            <MultiSelect
              data={tagOptions}
              label={t('screens.group.tags')}
              selectedItems={selectedTags}
              onSelectionChange={handleTagsChange}
              maxSelectedItems={3}
              error={errors.tags?.message}
              maxHeight={200}
            />

            <Dropdown
              data={cities.map(city => ({
                label: city.value,
                value: city.id,
                id: city.id,
              }))}
              label={t('screens.group.city')}
              onSelect={item => {
                handleCitySelect(item);
              }}
              selectedItem={selectedCity}
              error={errors.city?.message}
              loading={citiesLoading}
              showClearButton={false}
            />

            <Dropdown
              data={privacyOptions}
              label={t('screens.group.privacy')}
              onSelect={item => {
                handlePrivacySelect(item);
              }}
              selectedItem={selectedPrivacy}
              error={errors.privacy?.message}
              showClearButton={false}
            />

            <AnimatedInput
              control={control}
              name="membersCapacity"
              label={t('screens.group.members_capacity')}
              error={errors.membersCapacity}
              keyboardType="numeric"
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <View style={styles.buttonContainer}>
        <Button
          title={createGroupLoading ? t('common.creating') : t('common.create')}
          variant="dark"
          size="medium"
          shape="round"
          onPress={handleSubmit(onSubmit)}
          loading={createGroupLoading}
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
  imageSelectionContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('small'),
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: radius.round,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  coverContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: colors.secondary.light,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFields: {
    gap: spacing.lg,
    padding: spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
});
