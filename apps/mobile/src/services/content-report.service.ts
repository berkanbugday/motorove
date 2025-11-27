import {useMutation} from '@apollo/client';
import {REPORT_CONTENT} from './graphql/content-report.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useCallback} from 'react';
import useTranslation from '@hooks/useTranslation';
import {ICreateContentReport} from '@motorove/shared';

// Hook for reporting content
export const useReportContent = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [reportContentMutation, {loading, error}] = useMutation(
    REPORT_CONTENT,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('components.content-report.report_submitted'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error reporting content:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('components.content-report.report_failed'),
        });
      },
    },
  );

  const reportContent = useCallback(
    async (input: ICreateContentReport) => {
      try {
        const result = await reportContentMutation({
          variables: {input},
        });
        return result.data?.reportContent;
      } catch (err) {
        loggingService.error('Error in reportContent:', err);
        return null;
      }
    },
    [reportContentMutation],
  );

  return {
    reportContent,
    loading,
    error,
  };
};
