declare module 'react-native-config' {
  interface Env {
    MAPBOX_ACCESS_TOKEN: string;
  }
  const Config: Env;
  export default Config;
}
