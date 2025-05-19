import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  AnimatedInput,
  Button,
  Typography,
  Dropdown,
  DropdownItem,
  showToast,
  Icon,
  DateTimePicker,
} from '@components';
import {colors, spacing, radius, getShadow} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {z} from 'zod';
import {loggingService} from '@services/logging.service';
import {useGetCities} from '@services/city.service';

// Define the form validation schema
const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location is required'),
  date: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),
  time: z.date({
    required_error: 'Time is required',
    invalid_type_error: 'Invalid time format',
  }),
  city: z.string().min(1, 'City is required'),
  category: z.string().min(1, 'Category is required'),
  maxParticipants: z
    .number()
    .min(2, 'At least 2 participants required')
    .nullable()
    .or(z.string().transform(val => (val ? parseInt(val, 10) : null))),
  cover: z.string().nullable(),
  isPrivate: z.boolean().default(false),
});

// Type for the form values
type CreateEventFormValues = z.infer<typeof createEventSchema>;

// Event categories
const EVENT_CATEGORIES: DropdownItem[] = [
  {id: '1', value: 'Group Ride', label: 'Group Ride'},
  {id: '2', value: 'Night Ride', label: 'Night Ride'},
  {id: '3', value: 'Off-Road', label: 'Off-Road'},
  {id: '4', value: 'Meet Up', label: 'Meet Up'},
  {id: '5', value: 'Race', label: 'Race'},
  {id: '6', value: 'Touring', label: 'Touring'},
  {id: '7', value: 'Workshop', label: 'Workshop'},
];

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateEvent'>>();
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DropdownItem | null>(
    null,
  );
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use city service hook
  const {cities, loading: citiesLoading} = useGetCities();

  // Setup form with Zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      location: '',
      date: new Date(),
      time: new Date(),
      city: '',
      category: '',
      maxParticipants: null,
      cover: null,
      isPrivate: false,
    },
    mode: 'onChange',
  });

  const handleGoBack = () => {
    navigation.goBack();
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
            text1: 'File too large',
            text2: 'Please select an image smaller than 10MB',
          });
          return;
        }

        // Use base64 data instead of URI
        setCoverImage(asset.uri || '');
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

  function handleCitySelect(item: DropdownItem | null) {
    setSelectedCity(item);
    setValue('city', item?.value || '', {shouldValidate: true});
  }

  function handleCategorySelect(item: DropdownItem | null) {
    setSelectedCategory(item);
    setValue('category', item?.value || '', {shouldValidate: true});
  }

  const togglePrivacy = () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    setValue('isPrivate', newValue, {shouldValidate: true});
  };

  const onSubmit = async (data: CreateEventFormValues) => {
    try {
      setLoading(true);
      // TODO: Implement API call to create event
      console.log('Event data:', data);

      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Event created successfully',
      });

      // Navigate back after successful creation
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create event',
      });
      loggingService.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert cities data for dropdown
  const cityItems: DropdownItem[] = cities.map(city => ({
    id: city.id || '',
    value: city.value || '',
    label: city.value || '',
  }));

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Create Event"
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {/* Event Cover Image Selection */}
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={handleSelectCover}
            activeOpacity={0.8}>
            {coverImage ? (
              <Image source={{uri: coverImage}} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Typography variant="bodySmall" color={colors.neutral.grey}>
                  Upload event cover image
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Form Fields */}
            <View style={styles.formFields}>
              {/* Event Title */}
              <AnimatedInput
                control={control as any}
                name="title"
                label="Event Title"
                error={errors.title}
              />

              {/* Event Description */}
              <AnimatedInput
                control={control as any}
                name="description"
                label="Description"
                multiline
                error={errors.description}
              />

              {/* Category Dropdown */}
              <Dropdown
                data={EVENT_CATEGORIES}
                label="Category"
                onSelect={item => {
                  handleCategorySelect(item);
                }}
                searchable={false}
                selectedItem={selectedCategory}
                error={errors.category?.message}
              />

              {/* Location */}
              <AnimatedInput
                control={control as any}
                name="location"
                label="Location"
                error={errors.location}
                icon={
                  <Icon name="map-pin" size={20} color={colors.neutral.grey} />
                }
                iconPosition="right"
              />

              {/* City Dropdown */}
              <Dropdown
                data={cityItems}
                label="City"
                onSelect={item => {
                  handleCitySelect(item);
                }}
                searchable={true}
                selectedItem={selectedCity}
                error={errors.city?.message}
                loading={citiesLoading}
              />

              {/* Date and Time */}
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  control={control as any}
                  name="date"
                  placeholder="Start Date"
                  displayFormat="medium"
                  mode="date"
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                  error={errors.date}
                />
                <DateTimePicker
                  control={control as any}
                  name="time"
                  placeholder="Start Time"
                  mode="time"
                  minuteInterval={15}
                  style={styles.dateTimePicker}
                  error={errors.time}
                />
              </View>

              {/* Max Participants */}
              <AnimatedInput
                control={control as any}
                name="maxParticipants"
                label="Maximum Participants (optional)"
                error={errors.maxParticipants}
                keyboardType="numeric"
              />

              {/* Privacy Toggle */}
              <View style={styles.privacyContainer}>
                <View style={styles.privacyTextContainer}>
                  <Typography variant="body" style={styles.privacyTitle}>
                    Private Event
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.neutral.grey}
                    style={styles.privacyDescription}>
                    Only invited riders can join this event
                  </Typography>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleContainer,
                    isPrivate ? styles.toggleActive : styles.toggleInactive,
                  ]}
                  onPress={togglePrivacy}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.toggleIndicator,
                      isPrivate
                        ? styles.toggleIndicatorRight
                        : styles.toggleIndicatorLeft,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Creating...' : 'Create Event'}
            variant="dark"
            size="medium"
            shape="round"
            onPress={handleSubmit(onSubmit as any)}
            loading={loading}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
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
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  emoji: {
    fontSize: 16,
  },
  inputLabel: {
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  dateTimePicker: {
    marginBottom: spacing.xs,
  },
  errorText: {
    paddingLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary.light,
    borderRadius: radius.md,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontWeight: '600',
  },
  privacyDescription: {
    marginTop: spacing.xs,
  },
  toggleContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.neutral.black,
  },
  toggleInactive: {
    backgroundColor: colors.neutral.lightGrey,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
  },
  toggleIndicatorLeft: {
    alignSelf: 'flex-start',
  },
  toggleIndicatorRight: {
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
});

export default CreateEventScreen;
