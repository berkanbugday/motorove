import {IconName} from '@components/Icon';
import {ChipColor} from '@components';

export interface Tag {
  id: string;
  label: string;
  color?: ChipColor;
  onPress?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  leadingIcon?: IconName;
}

export interface MapMarker {
  id: string;
  coordinates: [number, number];
  onPress?: () => void;
  icon?: IconName;
  color?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  address?: string;
  coordinates: [number, number];
}
