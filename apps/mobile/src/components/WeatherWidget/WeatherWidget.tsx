import React from 'react';
import {View, Text, TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import {Icon, IconName} from '../Icon';
import {styles} from './WeatherWidget.styles';
import type {WeatherData} from './weather';
import {weatherColors, getConditionText} from './WeatherWidget.constants';

export interface WeatherWidgetProps {
  /**
   * Weather data to display
   */
  data: WeatherData;
  /**
   * Callback when the widget is pressed
   */
  onPress?: () => void;
  /**
   * Whether to show additional weather details
   * @default true
   */
  showDetails?: boolean;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
  /**
   * Additional styles for the text
   */
  textStyle?: TextStyle;
  /**
   * Optional title to display above the location
   */
  title?: string;
}

/**
 * A reusable weather widget component that displays current weather conditions.
 */
const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  data,
  onPress,
  showDetails = true,
  style,
  textStyle,
  title,
}) => {
  const {
    temperature,
    unit = 'C',
    condition,
    location,
    humidity,
    windSpeed,
    feelsLike,
    precipitation,
  } = data;

  // Get the weather condition styling
  const conditionStyle = weatherColors[condition] || weatherColors.sunny;

  const containerStyle = {
    backgroundColor: conditionStyle.background,
  };

  const textColorStyle = {
    color: conditionStyle.text,
  };

  const renderWeatherDetails = () => {
    if (!showDetails) {
      return null;
    }

    return (
      <View style={styles.weatherDetails}>
        {feelsLike !== undefined && (
          <WeatherDetailItem
            label="Feels like"
            value={`${feelsLike}°${unit}`}
            textStyle={
              textStyle
                ? [styles.detailText, textColorStyle, textStyle]
                : [styles.detailText, textColorStyle]
            }
          />
        )}
        {humidity !== undefined && (
          <WeatherDetailItem
            label="Humidity"
            value={`${humidity}%`}
            textStyle={
              textStyle
                ? [styles.detailText, textColorStyle, textStyle]
                : [styles.detailText, textColorStyle]
            }
          />
        )}
        {windSpeed && (
          <WeatherDetailItem
            label="Wind"
            value={windSpeed}
            textStyle={
              textStyle
                ? [styles.detailText, textColorStyle, textStyle]
                : [styles.detailText, textColorStyle]
            }
          />
        )}
        {precipitation !== undefined && (
          <WeatherDetailItem
            label="Precipitation"
            value={`${precipitation}%`}
            textStyle={
              textStyle
                ? [styles.detailText, textColorStyle, textStyle]
                : [styles.detailText, textColorStyle]
            }
          />
        )}
      </View>
    );
  };

  const weatherContent = (
    <View style={[styles.container, containerStyle, style]}>
      <View style={styles.contentContainer}>
        <View style={styles.weatherInfo}>
          <View style={styles.weatherInfoHeader}>
            {title ? (
              <Text style={[styles.titleText, textColorStyle, textStyle]}>
                {title}
              </Text>
            ) : (
              <View style={styles.locationContainer}>
                <Icon
                  name="map-pin"
                  size={14}
                  color={conditionStyle.text}
                  style={styles.locationIcon}
                />
                <Text style={[styles.locationText, textColorStyle, textStyle]}>
                  {location}
                </Text>
              </View>
            )}
            <Text style={[styles.condition, textColorStyle, textStyle]}>
              {getConditionText(condition)}
            </Text>
          </View>
          <View style={styles.tempContainer}>
            <Text style={[styles.temperature, textColorStyle, textStyle]}>
              {temperature}
            </Text>
            <Text style={[styles.unit, textColorStyle, textStyle]}>
              °{unit}
            </Text>
          </View>

          {renderWeatherDetails()}
        </View>

        <View style={styles.weatherIconContainer}>
          <Icon
            name={condition as IconName}
            color={conditionStyle.text}
            style={styles.weatherIcon}
          />
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>{weatherContent}</TouchableOpacity>
    );
  }

  return weatherContent;
};

interface WeatherDetailItemProps {
  label: string;
  value: string;
  textStyle: TextStyle | TextStyle[];
}

const WeatherDetailItem: React.FC<WeatherDetailItemProps> = ({
  label,
  value,
  textStyle,
}) => (
  <View style={styles.weatherDetail}>
    <Text style={textStyle}>
      {label}: {value}
    </Text>
  </View>
);

export default WeatherWidget;
