import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress } from '@material-ui/core';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Navabar from '../../components/navbar';
import Dashboard, { PanelProps } from '../../components/dashboard';
import Buffers from '../../components/buffers';

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
    const [tab, changeTab] = useState<number>(0);
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

    const dataElement = { topic: "Teensy1/TC0", displayProps: { firstDataKey: "timestamp", secondDataKey: "data" }, elemType: "data", displayType: "line-graph" } as PanelProps;
    const controlElement = {
        topic: "LEDONOFF", displayProps: {}, elemType: "control", displayType: "switch", format: (on: boolean) => {
            if (on)
                return { payload: "T" };
            else
                return { payload: "F" };
        },
    } as PanelProps;

    if (viewer) {
        var component = <Dashboard dataElements={[dataElement, controlElement]} />;
        switch (tab) {
            case 0:
                break;
            case 1:
                component = <Buffers />;
                break;
        }
        return (
            <div>
                <Navabar email={viewer.email} currTab={tab} changeTab={changeTab} />
                {component}
            </div >
        )
    }

    return (<><h1>Loading Home Page</h1><CircularProgress /></>);
}



export default Index
