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

const AlarmsPage = () => {
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

    if (viewer) {
        return (
            <div>
                <Navabar email={viewer.email} />
            </div>
        )
    }

    return <p>Loading...</p>
}

export default AlarmsPage;