import {gql} from '@apollo/client';

// Sign up mutation
export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input)
  }
`;
