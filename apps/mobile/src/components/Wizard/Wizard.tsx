import React, {
  ReactNode,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet} from 'react-native';
import {spacing} from '@theme';
import {ProgressIndicator, ProgressIndicatorType} from '../ProgressIndicator';
import {Subtitle} from '../Typography';
import {loggingService} from '@services/logging.service';

export type WizardStep = {
  id: string;
  title: string;
  content: ReactNode;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
};

export type WizardHandle = {
  nextStep: (stepData?: any) => void;
  previousStep: () => void;
  jumpToStep: (index: number) => void;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepsData: Record<string, any>;
  validateCurrentStep: () => Promise<boolean>;
};

type WizardProps = {
  steps: WizardStep[];
  initialStep?: number;
  onComplete?: (allData: Record<string, any>) => void;
  onStepChange?: (stepIndex: number) => void;
  onValidationError?: () => void;
  progressIndicatorType?: ProgressIndicatorType;
};

export const Wizard = forwardRef<WizardHandle, WizardProps>(
  (
    {
      steps,
      initialStep = 0,
      onComplete,
      onStepChange,
      onValidationError,
      progressIndicatorType = 'step',
    },
    ref,
  ) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
    const [stepsData, setStepsData] = useState<Record<string, any>>({});

    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const validateCurrentStep = async (): Promise<boolean> => {
      const currentStep = steps[currentStepIndex];

      if (currentStep.optional || !currentStep.validate) {
        return true;
      }

      try {
        const isValid = await Promise.resolve(currentStep.validate());
        return isValid;
      } catch (error) {
        loggingService.error('Validation error:', error as Error);
        return false;
      }
    };

    const handleNext = async (stepData?: any) => {
      const isValid = await validateCurrentStep();

      if (!isValid) {
        onValidationError?.();
        return;
      }

      if (stepData) {
        setStepsData(prev => ({
          ...prev,
          [steps[currentStepIndex].id]: stepData,
        }));
      }

      if (isLastStep) {
        onComplete?.(stepsData);
      } else {
        const nextStep = currentStepIndex + 1;
        setCurrentStepIndex(nextStep);
        onStepChange?.(nextStep);
      }
    };

    const handleBack = () => {
      if (!isFirstStep) {
        const prevStep = currentStepIndex - 1;
        setCurrentStepIndex(prevStep);
        onStepChange?.(prevStep);
      }
    };

    const jumpToStep = async (index: number) => {
      if (
        index < currentStepIndex ||
        (index === currentStepIndex + 1 && (await validateCurrentStep()))
      ) {
        setCurrentStepIndex(index);
        onStepChange?.(index);
      } else if (index === currentStepIndex + 1) {
        onValidationError?.();
      }
    };

    const currentStep = steps[currentStepIndex];

    useImperativeHandle(
      ref,
      () => ({
        nextStep: handleNext,
        previousStep: handleBack,
        jumpToStep,
        currentStepIndex,
        isFirstStep,
        isLastStep,
        stepsData,
        validateCurrentStep,
      }),
      [currentStepIndex, isFirstStep, isLastStep, stepsData],
    );

    return (
      <View style={styles.container}>
        <ProgressIndicator
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepPress={jumpToStep}
          type={progressIndicatorType}
        />

        <Subtitle align="center" weight="semiBold" style={styles.stepTitle}>
          {currentStep.title}
          {currentStep.optional ? ' (Optional)' : ''}
        </Subtitle>

        <View style={styles.content}>{currentStep.content}</View>
      </View>
    );
  },
);

Wizard.displayName = 'Wizard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  stepTitle: {
    marginBottom: spacing.xl,
  },
  content: {
    flex: 1,
  },
});
