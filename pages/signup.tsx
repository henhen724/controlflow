import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { getErrorMessage } from '../lib/form'
import { Button, TextField, Link as LinkStyle, Container } from '@material-ui/core'

const SignUpMutation = gql`
  mutation SignUpMutation($email: String!, $password: String!) {
    signUp(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
    }
  }
`

function SignUp() {
  const [signUp] = useMutation(SignUpMutation)
  const [errorMsg, setErrorMsg] = useState<string>()
  const router = useRouter()

  async function handleSubmit(event: any) {
    event.preventDefault()
    const emailElement = event.currentTarget.elements.email
    const passwordElement = event.currentTarget.elements.password

    try {
      await signUp({
        variables: {
          email: emailElement.value,
          password: passwordElement.value,
        },
      })

      router.push('/signin')
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  }

  return (<Container maxWidth="sm">
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
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
      <Button type="submit" variant="contained" color="primary">Sign up</Button> or{' '}
      <Link href="signin">
        <LinkStyle>Sign in</LinkStyle>
      </Link>
    </form>
  </Container>)
}

export default SignUp
