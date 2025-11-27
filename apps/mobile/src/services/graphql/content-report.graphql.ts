import {gql} from '@apollo/client';

export const REPORT_CONTENT = gql`
  mutation ReportContent($input: CreateContentReportInput!) {
    reportContent(input: $input)
  }
`;
