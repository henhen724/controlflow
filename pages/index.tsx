import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Dashboard, { PanelProps } from '../components/dashboard';
import { elementType } from 'prop-types';

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

  const dataElement = { topic: "SENSOR", displayProps: { firstDataKey: "timestamp", secondDataKey: "data" }, elemType: "data", displayType: "line-graph" } as PanelProps;
  const controlElement = {
    topic: "LEDONOFF", displayProps: {}, elemType: "control", displayType: "switch", formatAndSend: (on: boolean, sendMqttPacket: (packet: any) => any) => {
      if (on)
        return sendMqttPacket({ payload: "T" });
      else
        return sendMqttPacket({ payload: "F" });
    },
  } as PanelProps;

  if (viewer) {
    return (
      <div>
        <Dashboard dataElements={[dataElement, controlElement]} />
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
