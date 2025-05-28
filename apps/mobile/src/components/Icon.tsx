import React from 'react';

// SVG imports
import Eye from '@assets/icons/eye.svg';
import EyeSlash from '@assets/icons/eye-slash.svg';
import Envelope from '@assets/icons/envelope.svg';
// Brand Icons
import Google from '@assets/icons/brands/google.svg';
import Apple from '@assets/icons/brands/apple.svg';
import Facebook from '@assets/icons/brands/facebook.svg';
// Common Icons
import ArrowLeft from '@assets/icons/arrow-left.svg';
import User from '@assets/icons/user.svg';
import UserFilled from '@assets/icons/user-filled.svg';
import Close from '@assets/icons/close.svg';
import ChevronUp from '@assets/icons/chevron-up.svg';
import ChevronDown from '@assets/icons/chevron-down.svg';
import Check from '@assets/icons/check.svg';
import CheckFilled from '@assets/icons/check-filled.svg';
import MapPin from '@assets/icons/map-pin.svg';
import Route from '@assets/icons/route.svg';
import RouteFilled from '@assets/icons/route-filled.svg';
import Users from '@assets/icons/users.svg';
import UsersFilled from '@assets/icons/users-filled.svg';
import UsersSlashFilled from '@assets/icons/users-slash-filled.svg';
import Wrench from '@assets/icons/wrench.svg';
import Home from '@assets/icons/home.svg';
import HomeFilled from '@assets/icons/home-filled.svg';
import MapLocation from '@assets/icons/map-location.svg';
import MapLocationFilled from '@assets/icons/map-location-filled.svg';
import UserGear from '@assets/icons/user-gear.svg';
import UserGearFilled from '@assets/icons/user-gear-filled.svg';
import UserPlusFilled from '@assets/icons/user-plus-filled.svg';
import UserSlashFilled from '@assets/icons/user-slash-filled.svg';
import Bell from '@assets/icons/bell.svg';
import BellFilled from '@assets/icons/bell-filled.svg';
import BellExclamation from '@assets/icons/bell-exclamation.svg';
import BellExclamationFilled from '@assets/icons/bell-exclamation-filled.svg';
import Like from '@assets/icons/like.svg';
import LikeFilled from '@assets/icons/like-filled.svg';
import Comment from '@assets/icons/comment.svg';
import Comments from '@assets/icons/comments.svg';
import CommentsFilled from '@assets/icons/comments-filled.svg';
import CommentFilled from '@assets/icons/comment-filled.svg';
import Save from '@assets/icons/save.svg';
import SaveFilled from '@assets/icons/save-filled.svg';
import MoreVertical from '@assets/icons/more-vertical.svg';
import PaperPlane from '@assets/icons/paper-plane.svg';
import PaperPlaneFilled from '@assets/icons/paper-plane-filled.svg';
import Trash from '@assets/icons/trash.svg';
import Pen from '@assets/icons/pen.svg';
import PenFilled from '@assets/icons/pen-filled.svg';
import Error from '@assets/icons/error.svg';
import ErrorFilled from '@assets/icons/error-filled.svg';
import Share from '@assets/icons/share.svg';
import UserLocation from '@assets/icons/user-location.svg';
import Plus from '@assets/icons/plus.svg';
import Minus from '@assets/icons/minus.svg';
import Sliders from '@assets/icons/sliders.svg';
import Search from '@assets/icons/search.svg';
import WrenchFilled from '@assets/icons/wrench-filled.svg';
import Shop from '@assets/icons/shop.svg';
import Droplet from '@assets/icons/droplet.svg';
import Clock from '@assets/icons/clock.svg';
import ClockFilled from '@assets/icons/clock-filled.svg';
import Calendar from '@assets/icons/calendar.svg';
import CalendarFilled from '@assets/icons/calendar-filled.svg';
import Phone from '@assets/icons/phone.svg';
import Lock from '@assets/icons/lock.svg';
import LockFilled from '@assets/icons/lock-filled.svg';
import LockOpen from '@assets/icons/lock-open.svg';
import LockOpenFilled from '@assets/icons/lock-open-filled.svg';
import Earth from '@assets/icons/earth.svg';
import EarthFilled from '@assets/icons/earth-filled.svg';
import Filter from '@assets/icons/filter.svg';
import FilterFilled from '@assets/icons/filter-filled.svg';
import Crown from '@assets/icons/crown.svg';
import CrownFilled from '@assets/icons/crown-filled.svg';
import Gear from '@assets/icons/gear.svg';
import GearFilled from '@assets/icons/gear-filled.svg';
import Camera from '@assets/icons/camera.svg';
import CameraFilled from '@assets/icons/camera-filled.svg';
//Weather Icons
import Sunny from '@assets/icons/weather/sunny.svg';
import Cloudy from '@assets/icons/weather/cloudy.svg';
import PartlyCloudy from '@assets/icons/weather/partly-cloudy.svg';
import Rainy from '@assets/icons/weather/rainy.svg';
import Stormy from '@assets/icons/weather/stormy.svg';
import Snowy from '@assets/icons/weather/snowy.svg';
import Foggy from '@assets/icons/weather/foggy.svg';
import Windy from '@assets/icons/weather/windy.svg';
import {colors} from '@theme/colors';

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
  | 'user-filled'
  | 'close'
  | 'chevron-up'
  | 'chevron-down'
  | 'check'
  | 'check-filled'
  | 'map-pin'
  | 'route'
  | 'route-filled'
  | 'users'
  | 'users-filled'
  | 'users-slash-filled'
  | 'wrench'
  | 'home'
  | 'home-filled'
  | 'map-location'
  | 'map-location-filled'
  | 'user-gear'
  | 'user-gear-filled'
  | 'user-plus-filled'
  | 'user-slash-filled'
  | 'bell'
  | 'bell-filled'
  | 'bell-exclamation'
  | 'bell-exclamation-filled'
  | 'like'
  | 'like-filled'
  | 'comment'
  | 'comments'
  | 'comments-filled'
  | 'comment-filled'
  | 'save'
  | 'save-filled'
  | 'sunny'
  | 'cloudy'
  | 'partlyCloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy'
  | 'more-vertical'
  | 'paper-plane'
  | 'paper-plane-filled'
  | 'trash'
  | 'pen'
  | 'pen-filled'
  | 'error'
  | 'error-filled'
  | 'share'
  | 'user-location'
  | 'plus'
  | 'minus'
  | 'sliders'
  | 'search'
  | 'wrench-filled'
  | 'shop'
  | 'droplet'
  | 'clock'
  | 'clock-filled'
  | 'calendar'
  | 'calendar-filled'
  | 'phone'
  | 'lock'
  | 'lock-filled'
  | 'lock-open'
  | 'lock-open-filled'
  | 'earth'
  | 'earth-filled'
  | 'filter'
  | 'filter-filled'
  | 'crown'
  | 'crown-filled'
  | 'gear'
  | 'gear-filled'
  | 'camera'
  | 'camera-filled';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({
  name,
  size = 24,
  color = colors.neutral.grey,
  style,
}: IconProps) {
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
    case 'user-filled':
      return <UserFilled {...commonProps} />;
    case 'close':
      return <Close {...commonProps} />;
    case 'chevron-up':
      return <ChevronUp {...commonProps} />;
    case 'chevron-down':
      return <ChevronDown {...commonProps} />;
    case 'check':
      return <Check {...commonProps} />;
    case 'check-filled':
      return <CheckFilled {...commonProps} />;
    case 'map-pin':
      return <MapPin {...commonProps} />;
    case 'route':
      return <Route {...commonProps} />;
    case 'route-filled':
      return <RouteFilled {...commonProps} />;
    case 'users':
      return <Users {...commonProps} />;
    case 'users-filled':
      return <UsersFilled {...commonProps} />;
    case 'users-slash-filled':
      return <UsersSlashFilled {...commonProps} />;
    case 'wrench':
      return <Wrench {...commonProps} />;
    case 'home':
      return <Home {...commonProps} />;
    case 'home-filled':
      return <HomeFilled {...commonProps} />;
    case 'map-location':
      return <MapLocation {...commonProps} />;
    case 'map-location-filled':
      return <MapLocationFilled {...commonProps} />;
    case 'user-gear':
      return <UserGear {...commonProps} />;
    case 'user-gear-filled':
      return <UserGearFilled {...commonProps} />;
    case 'user-plus-filled':
      return <UserPlusFilled {...commonProps} />;
    case 'user-slash-filled':
      return <UserSlashFilled {...commonProps} />;
    case 'bell':
      return <Bell {...commonProps} />;
    case 'bell-filled':
      return <BellFilled {...commonProps} />;
    case 'bell-exclamation':
      return <BellExclamation {...commonProps} />;
    case 'bell-exclamation-filled':
      return <BellExclamationFilled {...commonProps} />;
    case 'like':
      return <Like {...commonProps} />;
    case 'like-filled':
      return <LikeFilled {...commonProps} />;
    case 'comment':
      return <Comment {...commonProps} />;
    case 'comments':
      return <Comments {...commonProps} />;
    case 'comments-filled':
      return <CommentsFilled {...commonProps} />;
    case 'comment-filled':
      return <CommentFilled {...commonProps} />;
    case 'save':
      return <Save {...commonProps} />;
    case 'save-filled':
      return <SaveFilled {...commonProps} />;
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
    case 'more-vertical':
      return <MoreVertical {...commonProps} />;
    case 'paper-plane':
      return <PaperPlane {...commonProps} />;
    case 'paper-plane-filled':
      return <PaperPlaneFilled {...commonProps} />;
    case 'trash':
      return <Trash {...commonProps} />;
    case 'pen':
      return <Pen {...commonProps} />;
    case 'pen-filled':
      return <PenFilled {...commonProps} />;
    case 'error':
      return <Error {...commonProps} />;
    case 'error-filled':
      return <ErrorFilled {...commonProps} />;
    case 'share':
      return <Share {...commonProps} />;
    case 'user-location':
      return <UserLocation {...commonProps} />;
    case 'plus':
      return <Plus {...commonProps} />;
    case 'minus':
      return <Minus {...commonProps} />;
    case 'sliders':
      return <Sliders {...commonProps} />;
    case 'search':
      return <Search {...commonProps} />;
    case 'wrench-filled':
      return <WrenchFilled {...commonProps} />;
    case 'shop':
      return <Shop {...commonProps} />;
    case 'droplet':
      return <Droplet {...commonProps} />;
    case 'clock':
      return <Clock {...commonProps} />;
    case 'clock-filled':
      return <ClockFilled {...commonProps} />;
    case 'calendar':
      return <Calendar {...commonProps} />;
    case 'calendar-filled':
      return <CalendarFilled {...commonProps} />;
    case 'phone':
      return <Phone {...commonProps} />;
    case 'lock':
      return <Lock {...commonProps} />;
    case 'lock-filled':
      return <LockFilled {...commonProps} />;
    case 'lock-open':
      return <LockOpen {...commonProps} />;
    case 'lock-open-filled':
      return <LockOpenFilled {...commonProps} />;
    case 'earth':
      return <Earth {...commonProps} />;
    case 'earth-filled':
      return <EarthFilled {...commonProps} />;
    case 'filter':
      return <Filter {...commonProps} />;
    case 'filter-filled':
      return <FilterFilled {...commonProps} />;
    case 'crown':
      return <Crown {...commonProps} />;
    case 'crown-filled':
      return <CrownFilled {...commonProps} />;
    case 'gear':
      return <Gear {...commonProps} />;
    case 'gear-filled':
      return <GearFilled {...commonProps} />;
    case 'camera':
      return <Camera {...commonProps} />;
    case 'camera-filled':
      return <CameraFilled {...commonProps} />;
    default:
      return null;
  }
}
