import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import ControlPanel from '../components/ControlPanel';

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      email
    }
  }
`

const Index = () => {
  const router = useRouter()
  const { data: viewerData, loading, error } = useQuery(ViewerQuery);
  const viewer = viewerData?.viewer;
  const shouldRedirect = !(loading || error || viewer);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/signin')
    } else {

    }
  }, [shouldRedirect])

  if (error) {
    return <p>{error.message}</p>
  }

  const dataElement = { topics: ["SENSOR"], graphProps: { data: [] } };

  if (viewer) {
    return (
      <div>
        <ControlPanel dataElements={[dataElement]} />
        <footer>
          You're signed in as {viewer.email}. {' '}
          <Link href="/signout">
            <a className="btn btn-info mt-2 mb-2">Sign Out</a>
          </Link>
        </footer>
      </div>
    )
  }

  return <p>Loading...</p>
}

export default Index
