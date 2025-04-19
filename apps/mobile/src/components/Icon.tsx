import React from 'react';

// SVG imports
import Eye from '../assets/icons/eye.svg';
import EyeSlash from '../assets/icons/eye-slash.svg';
import Envelope from '../assets/icons/envelope.svg';

// Type for icons
export type IconName = 'eye' | 'eye-slash' | 'envelope';

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
    default:
      return null;
  }
}
