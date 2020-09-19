import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import Navbar from '../components/Navbar';
import LiveData from '../components/livedata';
import { UnionPanelSettings } from '../components/Panel';
import Buffers from '../components/buffers';
import Alarms from '../components/alarms';
import DeviceNetwork from '../components/DeviceNetwork';
import { CircularProgress, BottomNavigation, BottomNavigationAction, Paper } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Timeline as TimelineIcon, Storage as StorageIcon, Alarm as AlarmIcon, WifiTethering as NetworkIcon } from '@material-ui/icons';

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      email
    }
  }
`

const useStyles = makeStyles((theme: Theme) => createStyles({
    paperFooter: {
        width: "100%",
        position: 'fixed',
        left: 0,
        bottom: 0,
        textAlign: 'center',
    },
    navFooter: {
        textAlign: 'center',
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.secondary.light,
    }
}));

const Index = () => {
    const router = useRouter();
    var { element = "live-data" } = router.query;
    element = Array.isArray(element) ? element[0] : element;
    const classes = useStyles();
    const [tab, _changeTab] = useState<string>(element);
    const changeTab = (val: string) => {
        _changeTab(val);
        router.push({
            pathname: '/dashboard',
            query: {
                element: val
            }
        }, undefined, { shallow: true });
    }
    const { data: viewerData, loading, error } = useQuery(ViewerQuery);
    const viewer = viewerData?.viewer;
    const shouldRedirect = !(loading || error || viewer);

    useEffect(() => {
        if (shouldRedirect) {
            console.log("Redirecting from dashboard to sign in");
            router.push('/signin')
        } else {

        }
    }, [shouldRedirect])

    if (error) {
        return <p>{error.message}</p>
    }

    const dataElement = { topic: "SENSOR", displayProps: { firstDataKey: "timestamp", secondDataKey: "data" }, elemType: "data", displayType: "line-graph" } as UnionPanelSettings;
    const controlElement = {
        topic: "LEDONOFF",
        displayProps: {
            format: (on: boolean) => {
                if (on)
                    return { payload: "T" };
                else
                    return { payload: "F" };
            }
        },
        elemType: "control",
        displayType: "switch"
    } as UnionPanelSettings;

    if (viewer) {
        var component = <div />;
        switch (tab) {
            case "live-data":
                component = <LiveData dataElements={[dataElement, controlElement]} />;
                break;
            case "data-buffers":
                component = <Buffers />;
                break;
            case "alarms":
                component = <Alarms />;
                break;
            case "device-network":
                component = <DeviceNetwork />
                break;
            default:
                changeTab("live-data");
        }
        return (
            <div>
                <Navbar />
                {component}
                <Paper className={classes.paperFooter}>
                    <BottomNavigation value={tab} onChange={(e, val) => changeTab(val)} className={classes.navFooter}>
                        <BottomNavigationAction label="Live Data and Control" value="live-data" icon={<TimelineIcon />} />
                        <BottomNavigationAction label="Data Buffers" value="data-buffers" icon={<StorageIcon />} />
                        <BottomNavigationAction label="Alarms" value="alarms" icon={<AlarmIcon />} />
                        <BottomNavigationAction label="Network Viewer" value="device-network" icon={<NetworkIcon />} />
                    </BottomNavigation>
                </Paper>
            </div >
        )
    }

    return (<><Navbar /><h1>Loading Home Page</h1><CircularProgress /></>);
}



export default Index
