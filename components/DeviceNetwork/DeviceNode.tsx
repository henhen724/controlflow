import { useState } from "react";
import { Button, Card, CardActions, CardContent, Typography, Menu, MenuItem, Paper, makeStyles, createStyles } from '@material-ui/core';
import { Close as CloseIcon, Input as InputIcon, MoreVert as MoreIcon } from "@material-ui/icons";
import { useRouter } from 'next/router';

interface deviceSchema {
    in: {
        [key: string]: Object
    }
    out: {
        [key: string]: Object
    }
}

export interface device {
    ip: string;
    uri: string;
    deviceSchema: deviceSchema;
    name: string;
    osName: string;
    platform: string;
}

interface nodeProps {
    device: device;
    key: string;
}

const useStyles = makeStyles(theme => createStyles({
    dot: {
        height: theme.spacing(8),
        width: theme.spacing(8),
        borderRadius: "50%",
        display: "inline-block",
        backgroundColor: theme.palette.background.default
    },
    icon: {
        height: theme.spacing(8),
        width: theme.spacing(8)
    },
    noPadding: {
        padding: theme.spacing(0)
    },
    padLeft: {
        paddingLeft: theme.spacing(1)
    },
    card: {
        width: "100%",
        height: "100%"
    }
}));



const devicenode = (props: nodeProps) => {
    const classes = useStyles();
    const { device, key } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useRouter();

    const openMenu = (e: any) => setAnchorEl(e.currentTarget);
    const closeMenu = (e: any) => setAnchorEl(null);

    return (<div key={key}>
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={openMenu}>
            <Paper key={key} className={classes.dot}>
                <img className={classes.icon} src="/raspberry-pi.svg" />
            </Paper>
        </Button>
        <Menu className={classes.noPadding} anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)}>
            <Card className={classes.card}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {device.name}
                    </Typography>
                    <Typography color="textSecondary">
                        {device.osName}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={() => router.push(`/devices/${device.ip}`)}>Details <MoreIcon /></Button>
                    <Button onClick={() => window.open(`${device.uri}/widaq/ssh`, "_blank")}>Shell <InputIcon className={classes.padLeft} /></Button>
                    <Button onClick={closeMenu}>Close <CloseIcon /></Button>
                </CardActions>
            </Card>
        </Menu>
    </div>);
}

export default devicenode;