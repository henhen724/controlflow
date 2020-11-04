import { useState, useCallback } from 'react';
import MaterialTable, { Column, MTableToolbar } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import { Replay as ReplayIcon } from '@material-ui/icons';

import { Watchdog } from "../server/models/Watchdog";
import { WatchdogsQuery, SetWatchdog, DeleteWatchdog } from "./apollo/Watchdogs";

import { getErrorMessage } from './errorFormating';

interface WatchdogDisplay {
    name: string,
    topics: string[],
    topicsString?: string,
    messageString: string,
}

interface TableState {
    columns: Array<Column<WatchdogDisplay>>,
    data: WatchdogDisplay[],
}

const AlarmsPage = () => {
    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Name', field: 'name', type: 'string', editable: 'onAdd' },
            { title: 'Topics (Comma Seperated)', field: 'topicsString', type: 'string', editable: 'always' },
            { title: 'Alarm Message', field: 'messageString', type: 'string', editable: 'always' },
        ],
        data: [],
    })
    const [isModalOpen, setModelOpen] = useState<boolean>(false);
    const [nameToDelete, setNameToDelete] = useState<string | null>(null);

    // Queries
    const { loading: bufferLoading, error: bufferError, refetch: _refetch } = WatchdogsQuery({
        onCompleted: (queryData) => {
            const buffers = queryData.watchdogs ? queryData.watchdogs : [];
            const buffToDisplay = buffers.map(buf => {
                var newBuf = Object.assign({}, buf) as WatchdogDisplay;
                newBuf.topicsString = buf.topics.join(",");
                return newBuf;
            })
            setState({ columns: state.columns, data: buffToDisplay });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch(), 0);
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.

    // Mutations
    const [sendTopic] = SetWatchdog();
    const [deleteTopic] = DeleteWatchdog();

    const onModalFinish = (accepted: boolean) => {
        setModelOpen(false);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${nameToDelete}`);
        if (accepted && nameToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((WatchdogObj) => WatchdogObj.name !== nameToDelete);
                return { ...prevState, data };
            });
            deleteTopic({
                variables: {
                    name: nameToDelete
                }
            }).then(() => {
                setNameToDelete(null);
            }).catch((err: any) => getErrorMessage(err))
        } else {
            setNameToDelete(null);
        }
    }

    // Render Table
    if (bufferLoading) {
        return (<Container maxWidth="sm"><h1>Buffer Info Loading</h1><CircularProgress /></ Container>)
    } else if (bufferError) {
        return (<h1>Buffer Query Error: {getErrorMessage(bufferError)}</h1>)
    } else {
        return (
            <div>
                <Container>
                    <MaterialTable title="Watchdog Alarms" columns={state.columns} data={state.data}
                        components={{
                            Toolbar: props => (<div>
                                <MTableToolbar {...props} />
                                <IconButton onClick={refetch}><ReplayIcon /></IconButton>
                            </div>),
                        }}
                        editable={{
                            onRowAdd: (newData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const data = [...prevState.data];
                                    data.push(newData);
                                    return { ...prevState, data };
                                });
                                var input = {
                                    name: newData.name,
                                    topics: newData.topicsString && newData.topicsString !== '' ? newData.topicsString.split(",") : [],
                                    messageString: newData.messageString ? newData.messageString : `${newData.name} has gone off!`,
                                } as Watchdog;
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const data = [...prevState.data];
                                    data.push(newData);
                                    return { ...prevState, data };
                                });
                                var input = {
                                    name: newData.name,
                                    topics: newData.topicsString && newData.topicsString !== '' ? newData.topicsString.split(",") : [],
                                    messageString: newData.messageString ? newData.messageString : `${newData.name} has gone off!`,
                                } as Watchdog;
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowDelete: (oldData) => new Promise((resolve) => {
                                setNameToDelete(oldData.name);
                                setModelOpen(true);
                                resolve(true);
                            })
                        }} />
                    <Dialog
                        open={isModalOpen}
                        keepMounted
                        onClose={() => onModalFinish(false)}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle id="alert-dialog-slide-title">{`WARNING: Deleting ${nameToDelete} Data Buffer`}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                All data currently in this buffer will be lost and unrecoverable. Are sure you want to do this?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => onModalFinish(false)} color="primary">
                                Disagree
                            </Button>
                            <Button onClick={() => onModalFinish(true)} color="primary">
                                Agree
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </div>
        )
    }
}

export default AlarmsPage;