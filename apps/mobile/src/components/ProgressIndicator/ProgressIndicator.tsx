import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, spacing} from '@theme';
import {Body} from '../Typography';

export type ProgressIndicatorStep = {
  id: string;
  title?: string;
  icon?: React.ReactNode;
};

export type ProgressIndicatorType = 'step' | 'line' | 'dot';

type ProgressIndicatorProps = {
  steps: ProgressIndicatorStep[];
  currentStepIndex: number;
  onStepPress?: (index: number) => void;
  containerStyle?: object;
  type?: ProgressIndicatorType;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStepIndex,
  onStepPress,
  containerStyle,
  type = 'step',
}) => {
  const renderStep = (step: ProgressIndicatorStep, index: number) => {
    switch (type) {
      case 'line':
        return (
          <View
            style={[
              styles.lineStep,
              index <= currentStepIndex && styles.activeLineStep,
              index < currentStepIndex && styles.completedLineStep,
            ]}
          />
        );
      case 'dot':
        return (
          <View
            style={[
              styles.dotStep,
              index <= currentStepIndex && styles.activeDotStep,
              index < currentStepIndex && styles.completedDotStep,
            ]}
          />
        );
      case 'step':
      default:
        return (
          <TouchableOpacity
            disabled={!onStepPress || index > currentStepIndex}
            onPress={() => onStepPress?.(index)}
            style={[
              styles.stepCircle,
              index <= currentStepIndex && styles.activeStepCircle,
              index < currentStepIndex && styles.completedStepCircle,
            ]}>
            {step.icon ? (
              <View style={styles.iconContainer}>{step.icon}</View>
            ) : (
              <Body
                color={colors.neutral.grey}
                style={index <= currentStepIndex && styles.activeStepNumber}>
                {index + 1}
              </Body>
            )}
          </TouchableOpacity>
        );
    }
  };

  const renderConnector = (index: number) => {
    switch (type) {
      case 'line':
        return null; // No connectors for line type
      case 'dot':
      case 'step':
      default:
        return (
          <View
            style={[
              styles.connector,
              type === 'dot' && styles.dotConnector,
              index < currentStepIndex && styles.activeConnector,
            ]}
          />
        );
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {renderStep(step, index)}
          {index < steps.length - 1 && renderConnector(index)}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.lightGrey,
  },
  activeStepCircle: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  completedStepCircle: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  activeStepNumber: {
    color: colors.neutral.white,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  connector: {
    height: 2,
    backgroundColor: colors.neutral.lightGrey,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  activeConnector: {
    backgroundColor: colors.primary.main,
  },
  // Line type styles
  lineStep: {
    height: 4,
    flex: 1,
    backgroundColor: colors.neutral.lightGrey,
    borderRadius: 10,
    marginHorizontal: spacing.xs,
  },
  activeLineStep: {
    backgroundColor: colors.primary.main,
  },
  completedLineStep: {
    backgroundColor: colors.primary.main,
  },
  // Dot type styles
  dotStep: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: colors.neutral.lightGrey,
  },
  activeDotStep: {
    backgroundColor: colors.primary.main,
  },
  completedDotStep: {
    backgroundColor: colors.primary.main,
  },
  dotConnector: {
    height: 1,
  },
});
