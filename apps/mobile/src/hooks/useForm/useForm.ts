import {useState, useCallback} from 'react';

type Validator<T> = (values: T) => Partial<Record<keyof T, string>>;

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  handleChange: <K extends keyof T>(key: K, value: T[K]) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => Promise<void>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
  setErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof T, string>>>
  >;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validator?: Validator<T>,
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValues(prev => ({...prev, [key]: value}));
      if (errors[key]) {
        setErrors(prev => ({...prev, [key]: undefined}));
      }
    },
    [errors],
  );

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void>) => {
      if (validator) {
        const newErrors = validator(values);
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validator],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setIsSubmitting,
    reset,
    setErrors,
  };
}
