import { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import MaterialTable, { Column, MTableToolbar } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import { Replay as ReplayIcon } from '@material-ui/icons';

import { IAlarm } from '../models/Alarm';

import { getErrorMessage } from '../lib/form';

const AlarmsQuery = gql`
query AlarmsQuery {
    alarms {
        topics
        triggerFunction
        actionFunction
    }
}
`
const SetAlarm = gql`
mutation SetAlarm($input: AlarmInput!) {
  setAlarm(input: $input) {
    success
  }
}
`
const DeleteAlarm = gql`
mutation DeleteAlarm($name:String!) {
    deleteAlarm(topic:$name) {
        success
    }
}
`

interface AlarmQuery {
    alarms: IAlarm[]
}

interface TableState {
    columns: Array<Column<IAlarm>>,
    data: IAlarm[],
}

interface SuccessBoolean {
    success: Boolean
}

const Alarms = () => {
    // Queries
    const { loading: bufferLoading, error: bufferError, refetch: _refetch } = useQuery<AlarmQuery>(AlarmsQuery, {
        onCompleted: (queryData: AlarmQuery) => {
            const buffers = queryData.alarms ? queryData.alarms : [];
            setState({ columns: state.columns, data: buffers });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: AlarmQuery) => {
                const buffers = queryData.alarms ? queryData.alarms : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.

    // Mutations
    const [sendTopic] = useMutation<SuccessBoolean, { input: IAlarm }>(SetAlarm);
    const [deleteTopic] = useMutation<SuccessBoolean, { name: string }>(DeleteAlarm);

    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Name', field: 'name', type: 'string', editable: 'onAdd' },
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
                const data = prevState.data.filter((alarmObj: IAlarm) => alarmObj.name !== nameToDelete);
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
                    <MaterialTable title="Data Buffers" columns={state.columns} data={state.data}
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
                                    name: newData.name
                                } as IAlarm;
                                input.triggerFunction = newData.triggerFunction ? newData.triggerFunction : "() => {};";
                                input.actionFunction = newData.actionFunction ? newData.actionFunction : "() => {};";
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: {
                                        input
                                    }
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const index = prevState.data.findIndex((alarmObj: IAlarm) => alarmObj.name === newData.name);
                                    const data = [...prevState.data]
                                    data[index] = newData;
                                    return { ...prevState, data };
                                });
                                var input = {
                                    name: newData.name,
                                } as IAlarm;
                                input.triggerFunction = newData.triggerFunction ? newData.triggerFunction : "() => {};";
                                input.actionFunction = newData.actionFunction ? newData.actionFunction : "() => {};";
                                sendTopic({
                                    variables: {
                                        input
                                    }
                                }).then(success => resolve(success));
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

export default Alarms;