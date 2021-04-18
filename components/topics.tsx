import { useState, useCallback } from 'react';
import MaterialTable, { Column } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, LinearProgress, TextField, Tooltip } from '@material-ui/core';
import { Replay as ReplayIcon, GetApp as GetAppIcon, FiberManualRecord as RecordCircle, FiberManualRecordOutlined as EmptyRecordCircle } from '@material-ui/icons';

import { getErrorMessage } from './errorFormating';

import { ArchiveCSVDownload, ArchiveDataPreview, AbrvTopicInfo, TopicsQuery, TopicsQueryRslt, RecordTopic, DeleteTopicRecord, ArchiveDataQueryInput, TopicsSubscription } from "./apollo/Topics";
import CsvDownloadModal from './csvDownloadModal';
import { formatByteSize } from './lib/formatByteSize';
import { DateTime } from 'luxon';
DateTime.local()

interface TableState {
    columns: Array<Column<AbrvTopicInfo>>,
    data: AbrvTopicInfo[],
}

interface TimeSelectionState {
    from?: number;
    to?: number;
    selecting: boolean;
}

const Topics = () => {
    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Topic Name', field: 'topic', type: 'string', editable: 'onAdd' },
            { title: 'Current Size', field: 'size', type: 'numeric', render: rowData => formatByteSize(rowData.size), editable: 'never' },
            {
                title: 'Recording', field: 'recording', type: 'boolean',
                render: rowData => {
                    if (rowData.recording) {
                        return <Tooltip title="recording">
                            <RecordCircle />
                        </Tooltip>;
                    } else {
                        return <Tooltip title="not recording">
                            <EmptyRecordCircle />
                        </Tooltip>;
                    }
                },
            },
            {
                title: 'Earliest packet recorded', field: 'earliest', render: rowData => {
                    if (rowData.earliest)
                        return DateTime.fromMillis(rowData.earliest).toFormat("h:mm:ss a DD");
                    else
                        return "";
                }
            },
            {
                title: 'Latest packet recorded', field: 'latest', render: rowData => {
                    if (rowData.latest)
                        return DateTime.fromMillis(rowData.latest).toFormat("h:mm:ss a DD");
                    else
                        return "";
                }
            }
        ],
        data: [],
    })

    const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

    const [topicToDownload, setTopicToDownload] = useState<string | null>(null);

    const [timeSelectState, setTimeSelectState] = useState<TimeSelectionState>({ selecting: false });

    const [getArchiveData, { data: downloadData, loading: downloadLoading, error: downloadError }] = ArchiveDataPreview({ variables: { topic: topicToDownload! } });
    const [getArchiveCSVLink, { data: archiveData, loading: csvLoading, error: csvError }] = ArchiveCSVDownload();

    const { loading, error, refetch: _refetch } = TopicsQuery({
        onCompleted: (queryData) => {
            console.log(queryData)
            const buffers = queryData.topicInfos ? queryData.topicInfos.map(buf => Object.assign({}, buf)) : [];
            console.log(buffers);
            setState({ columns: state.columns, data: buffers });
        }
    });

    TopicsSubscription({
        onSubscriptionData: ({ subscriptionData: { data, error } }) => {
            if (error) {
                console.log(error);
            } else if (data) {
                if (!state.data.find(topicInfo => topicInfo.topic === data.mqttTopics.topic)) {
                    state.data.push({ topic: data.mqttTopics.topic, recording: false, size: 0 });
                    setState(state);
                }
            }
        },
        onSubscriptionComplete: () => {
            console.log("Topics subscription closed.");
        }
    });

    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: TopicsQueryRslt) => {
                const buffers = queryData.topicInfos ? queryData.topicInfos.map(buf => Object.assign({}, buf)) : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.
    const [sendTopic] = RecordTopic();
    const [deleteTopic] = DeleteTopicRecord();


    const onDeleteModalFinish = (accepted: boolean) => {
        setTopicToDelete(null);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${topicToDelete}`);
        if (accepted && topicToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((topicObj: AbrvTopicInfo) => topicObj.topic !== topicToDelete);
                return { ...prevState, data };
            });
            deleteTopic({
                variables: {
                    topic: topicToDelete
                }
            }).then(success => {
                setTopicToDelete(null);
            }).catch(err => getErrorMessage(err))
        } else {
            setTopicToDelete(null);
        }
    }

    const onTimeSelectModalFinish = (accepted: boolean) => {
        if (accepted) {
            setTimeSelectState({ ...timeSelectState, selecting: false });
            var query = { topic: topicToDownload! } as ArchiveDataQueryInput;
            if (timeSelectState.from) {
                query = {
                    ...query,
                    from: new Date(timeSelectState.from)
                }
            }
            if (timeSelectState.to) {
                query = {
                    ...query,
                    to: new Date(timeSelectState.to)
                }
            }
            getArchiveData({ variables: query })
            getArchiveCSVLink({ variables: query });
        } else {
            setTopicToDownload(null);
            setTimeSelectState({ selecting: false });
        }
    }

    // Render Table
    if (loading) {
        return (<Container maxWidth="sm"><h1>Topic Info Loading</h1><CircularProgress /></ Container>)
    } else if (error) {
        return (<h1>Topic Query Error: {getErrorMessage(error)}</h1>)
    } else {
        return (
            <div>
                <Container>
                    <MaterialTable title="Topics Information" columns={state.columns} data={Array.from(state.data)}
                        actions={[
                            {
                                icon: () => <GetAppIcon />,
                                tooltip: 'Download Data',
                                onClick: (event, rowData) => {
                                    if (!Array.isArray(rowData)) {
                                        if (rowData.size === 0 || !rowData.earliest || !rowData.latest) {
                                            alert("Sorry, but that topic does not have archive data.  If the topic is already recording, refresh the topic info table to see if any arrives.  ");
                                            return;
                                        }
                                        setTimeSelectState({ selecting: true, from: rowData.earliest, to: rowData.latest });
                                        setTopicToDownload(rowData.topic);
                                    }
                                }
                            },
                            {
                                icon: () => <ReplayIcon />,
                                tooltip: 'Refresh Table',
                                onClick: refetch,
                                isFreeAction: true
                            },
                            {
                                icon: () => <ReplayIcon />,
                                tooltip: '',
                                onClick: () => {

                                }
                            }
                        ]}
                        editable={{
                            onRowAdd: (newData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const data = [...prevState.data];
                                    data.push(newData);
                                    return { ...prevState, data };
                                });
                                const input = {
                                    topic: newData.topic
                                };
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const index = prevState.data.findIndex((topicObj) => topicObj.topic === newData.topic);
                                    const data = [...prevState.data]
                                    data[index] = newData;
                                    return { ...prevState, data };
                                });
                                var input = {
                                    topic: newData.topic
                                }
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success));
                            }),
                            onRowDelete: (oldData) => new Promise((resolve) => {
                                setTopicToDelete(oldData.topic);
                                resolve(true);
                            })
                        }} />
                    <Dialog
                        open={!!topicToDelete}
                        keepMounted
                        onClose={() => onDeleteModalFinish(false)}
                        aria-labelledby="delete-modal-title"
                        aria-describedby="delete-modal-description"
                    >
                        <DialogTitle id="delete-modal-title">{`WARNING: Deleting ${topicToDelete} Data Archive`}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="delete-modal-description">
                                All data currently in this Archive will be lost and unrecoverable. Are sure you want to do this?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => onDeleteModalFinish(false)} color="primary">
                                Disagree
                            </Button>
                            <Button onClick={() => onDeleteModalFinish(true)} color="primary">
                                Agree
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={timeSelectState.selecting}
                        keepMounted
                        onClose={() => onTimeSelectModalFinish(false)}
                        aria-labelledby="time-select-modal-title"
                        aria-describedby="time-select-modal-description"
                    >
                        <DialogContent>
                            <TextField
                                id="datetime-local"
                                label="Beginning"
                                type="datetime-local"
                                value={timeSelectState.from ? DateTime.fromMillis(timeSelectState.from).toFormat("yyyy'-'LL'-'dd'T'HH':'mm") : ""}
                                onChange={(e) => {
                                    console.log(e.target.value)
                                    setTimeSelectState({
                                        ...timeSelectState,
                                        from: DateTime.fromISO(e.target.value).toMillis()
                                    })
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                id="datetime-local"
                                label="Ending"
                                type="datetime-local"
                                value={timeSelectState.to ? DateTime.fromMillis(timeSelectState.to).toFormat("yyyy'-'LL'-'dd'T'HH':'mm") : ""}
                                onChange={(e) => {
                                    console.log(e.target.value)
                                    setTimeSelectState({
                                        ...timeSelectState,
                                        to: DateTime.fromISO(e.target.value).toMillis()
                                    })
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => onTimeSelectModalFinish(false)} color="primary">
                                Disagree
                            </Button>
                            <Button onClick={() => onTimeSelectModalFinish(true)} color="primary">
                                Agree
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={!!topicToDownload && !timeSelectState.selecting}
                        keepMounted
                        onClose={() => setTopicToDownload(null)}
                        aria-labelledby="download-modal-title"
                        aria-describedby="download-modal-description"
                    >
                        <CsvDownloadModal data={downloadData ? downloadData.archiveData.edges.map(edge => edge.node.data) : undefined} error={downloadError} loading={downloadLoading} topic={topicToDownload} setTopic={setTopicToDownload} csvLinkLoading={csvLoading} csvLinkError={csvError} csvLink={archiveData ? archiveData.archiveDataCSVFile : undefined} useCsvLink={true} />
                    </Dialog>
                </Container>
            </div>
        )
    }
}

export default Topics;