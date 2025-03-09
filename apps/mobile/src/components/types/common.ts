export type ImageSize = 'small' | 'medium' | 'large';
export type ImageStyle = 'square' | 'circle';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonStyle = 'square' | 'circle' | 'round';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  size?: ButtonSize;
  style?: ButtonStyle;
}
