import { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import MaterialTable, { Column, MTableToolbar } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import { Replay as ReplayIcon } from '@material-ui/icons';

import { IWatchdog } from '../models/Watchdog';

import { getErrorMessage } from '../lib/form';

const WatchdogsQuery = gql`
query WatchdogsQuery {
    Watchdogs {
        topics
        triggerFunction
        actionFunction
    }
}
`
const SetWatchdog = gql`
mutation SetWatchdog($input: WatchdogInput!) {
  setWatchdog(input: $input) {
    success
  }
}
`
const DeleteWatchdog = gql`
mutation DeleteWatchdog($name:String!) {
    deleteWatchdog(topic:$name) {
        success
    }
}
`

interface WatchdogQuery {
    Watchdogs: IWatchdog[]
}

interface TableState {
    columns: Array<Column<IWatchdog>>,
    data: IWatchdog[],
}

interface SuccessBoolean {
    success: Boolean
}

const Watchdogs = () => {
    // Queries
    const { loading: bufferLoading, error: bufferError, refetch: _refetch } = useQuery<WatchdogQuery>(WatchdogsQuery, {
        onCompleted: (queryData: WatchdogQuery) => {
            const buffers = queryData.Watchdogs ? queryData.Watchdogs : [];
            setState({ columns: state.columns, data: buffers });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: WatchdogQuery) => {
                const buffers = queryData.Watchdogs ? queryData.Watchdogs : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.

    // Mutations
    const [sendTopic] = useMutation<SuccessBoolean, { input: IWatchdog }>(SetWatchdog);
    const [deleteTopic] = useMutation<SuccessBoolean, { name: string }>(DeleteWatchdog);

    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Name', field: 'name', type: 'string', editable: 'onAdd' },
            { title: 'TopicName (Comma Seperated)', field: 'topics', type: 'string', editable: 'always' },
            { title: 'Trigger Function', field: 'triggerFunction', type: 'string', editable: 'always' },
            { title: 'Action Function', field: 'actionFunction', type: 'string', editable: 'always' },
        ],
        data: [],
    })
    const [isModalOpen, setModelOpen] = useState<boolean>(false);
    const [nameToDelete, setNameToDelete] = useState<string | null>(null);

    const onModalFinish = (accepted: boolean) => {
        setModelOpen(false);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${nameToDelete}`);
        if (accepted && nameToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((WatchdogObj: IWatchdog) => WatchdogObj.name !== nameToDelete);
                return { ...prevState, data };
            });
            deleteTopic({
                variables: {
                    name: nameToDelete
                }
            }).then(success => {
                setNameToDelete(null);
            }).catch(err => getErrorMessage(err))
        } else {
            setNameToDelete(null);
        }
    }

    // Render Table
    if (bufferLoading) {
        return (<Container maxWidth="sm"><h1>Buffer Info Loading</h1><CircularProgress /></ Container>)
    } else if (bufferError) {
        return (<h1>Buffer Query Error: {bufferError}</h1>)
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
                                    topics: newData.topics,
                                    messageString: newData.messageString ? newData.messageString : `${newData.name} has gone off!`,
                                } as IWatchdog;
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: {
                                        input
                                    }
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
                                    topics: newData.topics,
                                    messageString: newData.messageString,
                                } as IWatchdog;
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: {
                                        input
                                    }
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowDelete: (oldData) => new Promise((resolve) => {
                                setNameToDelete(oldData.name);
                                setModelOpen(true);
                                resolve();
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

export default Watchdogs;