import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {LoadingIndicator} from '@components';
import {spacing} from '@theme/spacing';

interface WebViewContentProps {
  url: string;
}

export const WebViewContent: React.FC<WebViewContentProps> = ({url}) => {
  return (
    <View style={styles.container}>
      <WebView
        source={{uri: url}}
        style={styles.webview}
        startInLoadingState
        showsVerticalScrollIndicator={false}
        containerStyle={{paddingBottom: spacing.xxl}}
        renderLoading={() => <LoadingIndicator visible />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  webview: {
    flex: 1,
  },
});
