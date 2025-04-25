declare module '@maplibre/maplibre-react-native' {
  import {ComponentType} from 'react';
  import {ViewProps} from 'react-native';

  interface MapViewProps extends ViewProps {
    styleURL: string;
    zoomLevel?: number;
    centerCoordinate?: [number, number];
    logoEnabled?: boolean;
    onDidFailLoadingMap?: (error: Error) => void;
  }

  interface CameraProps {
    zoomLevel?: number;
    centerCoordinate?: [number, number];
    animationMode?: 'flyTo' | 'easeTo' | 'moveTo';
    animationDuration?: number;
  }

  interface PointAnnotationProps {
    id: string;
    coordinate: [number, number];
    title?: string;
  }

  interface UserLocationProps {
    visible?: boolean;
    showsUserHeadingIndicator?: boolean;
    animated?: boolean;
  }

  const MapView: ComponentType<MapViewProps>;
  const Camera: ComponentType<CameraProps>;
  const PointAnnotation: ComponentType<PointAnnotationProps>;
  const UserLocation: ComponentType<UserLocationProps>;

  function setAccessToken(token: string | null): void;
  function requestAndroidLocationPermissions(): Promise<boolean>;

  export default {
    MapView,
    Camera,
    PointAnnotation,
    UserLocation,
    setAccessToken,
    requestAndroidLocationPermissions,
  };
}
