import React from 'react';

// SVG imports
import Eye from '@assets/icons/eye.svg';
import EyeSlash from '@assets/icons/eye-slash.svg';
import Envelope from '@assets/icons/envelope.svg';
import Google from '@assets/icons/google.svg';
import Apple from '@assets/icons/apple.svg';
import Facebook from '@assets/icons/facebook.svg';
import ArrowLeft from '@assets/icons/arrow-left.svg';
import User from '@assets/icons/user.svg';
import Close from '@assets/icons/close.svg';
import ChevronUp from '@assets/icons/chevron-up.svg';
import ChevronDown from '@assets/icons/chevron-down.svg';
import Check from '@assets/icons/check.svg';
import MapPin from '@assets/icons/map-pin.svg';
import Route from '@assets/icons/route.svg';
import Users from '@assets/icons/users.svg';
import Wrench from '@assets/icons/wrench.svg';
import Home from '@assets/icons/home.svg';
import MapLocation from '@assets/icons/map-location.svg';
import UserGear from '@assets/icons/user-gear.svg';
import Bell from '@assets/icons/bell.svg';
import Sunny from '@assets/icons/weather/sunny.svg';
import Cloudy from '@assets/icons/weather/cloudy.svg';
import PartlyCloudy from '@assets/icons/weather/partly-cloudy.svg';
import Rainy from '@assets/icons/weather/rainy.svg';
import Stormy from '@assets/icons/weather/stormy.svg';
import Snowy from '@assets/icons/weather/snowy.svg';
import Foggy from '@assets/icons/weather/foggy.svg';
import Windy from '@assets/icons/weather/windy.svg';

// Type for icons
export type IconName =
  | 'eye'
  | 'eye-slash'
  | 'envelope'
  | 'google'
  | 'apple'
  | 'facebook'
  | 'arrow-left'
  | 'user'
  | 'close'
  | 'chevron-up'
  | 'chevron-down'
  | 'check'
  | 'map-pin'
  | 'route'
  | 'users'
  | 'wrench'
  | 'home'
  | 'map-location'
  | 'user-gear'
  | 'bell'
  | 'sunny'
  | 'cloudy'
  | 'partly-cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({name, size = 24, color = '#888', style}: IconProps) {
  // Set specific props for the SVG components
  const commonProps = {
    width: size,
    height: size,
    fill: color,
    style,
  };

  // Render the appropriate SVG component based on name
  switch (name) {
    case 'eye':
      return <Eye {...commonProps} />;
    case 'eye-slash':
      return <EyeSlash {...commonProps} />;
    case 'envelope':
      return <Envelope {...commonProps} />;
    case 'google':
      return <Google {...commonProps} />;
    case 'apple':
      return <Apple {...commonProps} />;
    case 'facebook':
      return <Facebook {...commonProps} />;
    case 'arrow-left':
      return <ArrowLeft {...commonProps} />;
    case 'user':
      return <User {...commonProps} />;
    case 'close':
      return <Close {...commonProps} />;
    case 'chevron-up':
      return <ChevronUp {...commonProps} />;
    case 'chevron-down':
      return <ChevronDown {...commonProps} />;
    case 'check':
      return <Check {...commonProps} />;
    case 'map-pin':
      return <MapPin {...commonProps} />;
    case 'route':
      return <Route {...commonProps} />;
    case 'users':
      return <Users {...commonProps} />;
    case 'wrench':
      return <Wrench {...commonProps} />;
    case 'home':
      return <Home {...commonProps} />;
    case 'map-location':
      return <MapLocation {...commonProps} />;
    case 'user-gear':
      return <UserGear {...commonProps} />;
    case 'bell':
      return <Bell {...commonProps} />;
    case 'sunny':
      return <Sunny {...commonProps} />;
    case 'cloudy':
      return <Cloudy {...commonProps} />;
    case 'partlyCloudy':
      return <PartlyCloudy {...commonProps} />;
    case 'rainy':
      return <Rainy {...commonProps} />;
    case 'stormy':
      return <Stormy {...commonProps} />;
    case 'snowy':
      return <Snowy {...commonProps} />;
    case 'foggy':
      return <Foggy {...commonProps} />;
    case 'windy':
      return <Windy {...commonProps} />;
    default:
      return null;
  }
}
