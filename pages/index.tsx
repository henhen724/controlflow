import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Navabar from '../components/navbar';
import Dashboard, { PanelProps } from '../components/dashboard';
import { Link as MatLink } from "@material-ui/core";

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
    topic: "LEDONOFF", displayProps: {}, elemType: "control", displayType: "switch", format: (on: boolean) => {
      if (on)
        return { payload: "T" };
      else
        return { payload: "F" };
    },
  } as PanelProps;

  if (viewer) {
    return (
      <div>
        <Navabar email={viewer.email} />
        <Dashboard dataElements={[dataElement, controlElement]} />
      </div>
    )
  }

  return <p>Loading...</p>
}

export default Index
