import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { getErrorMessage } from '../lib/errorFormating';
import { TextField, Button, Container, Paper, Grid } from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(0),
      padding: theme.spacing(0),
      position: "relative",
      textAlign: "center",
    },
    paperRoot: {
      margin: theme.spacing(2),
      padding: theme.spacing(3),
      position: "relative",
      textAlign: "center",
      backgroundColor: theme.palette.primary.main,
    },
    spacerDiv: {
      paddingBottom: theme.spacing(2),
    },
  }))

function SignIn() {
  const client = useApolloClient();
  const classes = useStyles();
  const [signIn] = useMutation(SignInMutation);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: any) { //FormEvent<HTMLFormElement>
    event.preventDefault();

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
        await router.push('/dashboard')
      }
    } catch (error) {
      setErrorMsg(getErrorMessage(error))
    }
  }

  return (<Container maxWidth="sm">
    <Paper className={classes.paperRoot} elevation={3}>
      <form className={classes.root} onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {errorMsg && <p>{errorMsg}</p>}
        <TextField
          name="email"
          type="email"
          autoComplete="email"
          fullWidth
          required
          label="Email"
          color="secondary"
        />
        <TextField
          name="password"
          type="password"
          autoComplete="password"
          fullWidth
          required
          label="Password"
          color="secondary"
        />
        <div className={classes.spacerDiv} />
        <Button type="submit">Sign in</Button> or{' '}
        <Link href="signup">
          <Button>Sign up</Button>
        </Link>
      </form>
    </Paper>
  </Container>);
}

export default SignIn
