import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { getErrorMessage } from '../lib/form';
import { TextField, Button, Container } from '@material-ui/core';

const SignInMutation = gql`
  mutation SignInMutation($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
    }
  }
`

function SignIn() {
  const client = useApolloClient()
  const [signIn] = useMutation(SignInMutation)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter()

  async function handleSubmit(event: any) { //FormEvent<HTMLFormElement>
    event.preventDefault()

    const emailElement = event.currentTarget.elements.email;
    const passwordElement = event.currentTarget.elements.password;

    try {
      await client.resetStore();
      const { data } = await signIn({
        variables: {
          email: emailElement.value,
          password: passwordElement.value,
        },
      });
      if (data.signIn.user) {
        await router.push('/')
      }
    } catch (error) {
      setErrorMsg(getErrorMessage(error))
    }
  }

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        {errorMsg && <p>{errorMsg}</p>}
        <TextField
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email"
        />
        <TextField
          name="password"
          type="password"
          autoComplete="password"
          required
          label="Password"
        />
        <Button type="submit">Sign in</Button> or{' '}
        <Link href="signup">
          <a className="btn btn-info mt-2 mb-2">Sign up</a>
        </Link>
      </form>
    </Container>
  )
}

export default SignIn
