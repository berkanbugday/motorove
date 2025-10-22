import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  AnimatedInput,
  Button,
  Dropdown,
  DropdownItem,
  showToast,
  MultiSelectItem,
  MultiSelect,
  BodySmall,
  Caption,
} from '@components';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  groupSchemas,
  UpdateGroupFormValues,
} from '@utils/validation/groupValidation';
import {loggingService} from '@services/logging.service';
import {EnumUtils} from '@utils/enumUtils';
import {useUpdateGroup, useGetGroup} from '@services/group.service';
import {useGetCities} from '@services/city.service';
import {useTranslation} from '@hooks/useTranslation';
import {GroupPrivacy, GroupTag, IUpdateGroup} from '@motorove/shared';

type EditGroupParams = {
  groupId: string;
};

export const EditGroupScreen = () => {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{EditGroup: EditGroupParams}, 'EditGroup'>>();
  const {groupId} = route.params;
  const {t} = useTranslation();
  const formInitialized = useRef(false);

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

  const {
    group,
    loading: groupLoading,
    error: groupError,
  } = useGetGroup(groupId);

  const {updateGroup: updateGroup, loading: updateGroupLoading} =
    useUpdateGroup(() => {
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    });

  const {updateGroupSchema} = groupSchemas(t);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    reset,
  } = useForm<UpdateGroupFormValues>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: {
      id: '',
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

  useEffect(() => {
    if (groupError) {
      loggingService.error('Error fetching group data:', groupError);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('error.group.fetch'),
      });
      navigation.goBack();
    }
  }, [groupError, navigation, t]);

  useEffect(() => {
    if (groupLoading || !group || formInitialized.current) {
      return;
    }

    try {
      reset({
        id: groupId,
        name: group.name,
        description: group.description,
        logo: group.logo || '',
        cover: group.cover || '',
        city: group.city?.id || '',
        privacy: group.privacy || '',
        membersCapacity: group.membersCapacity
          ? group.membersCapacity.toString()
          : null,
        tags: group.tags,
      });

      // Set logo and cover preview
      if (group.logo) {
        setLogo(group.logo);
      }
      if (group.cover) {
        setCover(group.cover);
      }

      // Set selected city
      if (group.city) {
        setSelectedCity({
          id: group.city.id,
          label: group.city.value,
          value: group.city.id,
        });
      }

      // Set selected privacy
      if (group.privacy) {
        const privacyOption = privacyOptions.find(
          option => option.value === group.privacy,
        );
        if (privacyOption) {
          setSelectedPrivacy(privacyOption);
        }
      }

      // Set selected tags
      if (group.tags && group.tags.length > 0) {
        setSelectedTags(
          group.tags.map(tag => ({
            id: tag,
            label: tagOptions.find(option => option.value === tag)?.label || '',
            value: tag,
          })),
        );
      }

      formInitialized.current = true;
    } catch (error) {
      loggingService.error('Error populating form data:', error);
    }
  }, [group, groupId, groupLoading, privacyOptions, reset]);

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

  const onSubmit = async (data: UpdateGroupFormValues) => {
    try {
      // Prepare form data for the group service
      const updateGroupInput: IUpdateGroup = {
        id: data.id || groupId,
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

      // Call the group service updateGroup method
      await updateGroup(updateGroupInput);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.group.error_updating_group'),
      });
    }
  };

  if (groupLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.group.edit_group')}
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
          {/* Group Cover Image Selection - Moved to top */}
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
              onSelect={(item: DropdownItem | null) => {
                handleCitySelect(item);
              }}
              selectedItem={selectedCity}
              error={errors.city?.message}
              loading={citiesLoading}
              showClearButton={false}
              searchable
            />

            <Dropdown
              data={privacyOptions}
              label={t('screens.group.privacy')}
              onSelect={(item: DropdownItem | null) => {
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
          title={updateGroupLoading ? t('common.updating') : t('common.update')}
          variant="dark"
          size="medium"
          shape="round"
          onPress={handleSubmit(onSubmit)}
          loading={updateGroupLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
