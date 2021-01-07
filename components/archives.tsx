import { useState, useCallback } from 'react';
import MaterialTable, { Column } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, LinearProgress, TextField } from '@material-ui/core';
import { Replay as ReplayIcon, GetApp as GetAppIcon } from '@material-ui/icons';

import { getErrorMessage } from './errorFormating';

import { ArchiveInfoRslt, ArchiveQuery, ArchiveTopic, DeleteTopicArchive, ArchiveInfo, ArchiveDataQueryInput } from "./apollo/Archives";
import { useArchiveDownload } from './apollo/Archives';
import CsvDownloadModal from './csvDownloadModal';
import { formatByteSize } from './lib/formatByteSize';
import { DateTime } from 'luxon';
DateTime.local()

interface TableState {
    columns: Array<Column<ArchiveInfo>>,
    data: ArchiveInfo[],
}

interface TimeSelectionState {
    from?: number;
    to?: number;
    selecting: boolean;
}

const Archives = () => {
    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Topic Name', field: 'topic', type: 'string', editable: 'onAdd' },
            { title: 'Current Size', field: 'size', type: 'numeric', render: rowData => formatByteSize(rowData.size) },
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

    const [{ data: downloadData, loading: downloadLoading, error: downloadError, progress }, getArchiveData] = useArchiveDownload()

    const { loading, error, refetch: _refetch } = ArchiveQuery({
        onCompleted: (queryData) => {
            const buffers = queryData.runningArchives ? queryData.runningArchives.map(buf => Object.assign({}, buf)) : [];
            setState({ columns: state.columns, data: buffers });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: ArchiveInfoRslt) => {
                const buffers = queryData.runningArchives ? queryData.runningArchives.map(buf => Object.assign({}, buf)) : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.
    const [sendTopic] = ArchiveTopic();
    const [deleteTopic] = DeleteTopicArchive();


    const onDeleteModalFinish = (accepted: boolean) => {
        setTopicToDelete(null);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${topicToDelete}`);
        if (accepted && topicToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((topicObj: ArchiveInfo) => topicObj.topic !== topicToDelete);
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
            getArchiveData(query)
        } else {
            setTopicToDownload(null);
            setTimeSelectState({ selecting: false });
        }
    }

    // Render Table
    if (loading) {
        return (<Container maxWidth="sm"><h1>Archive Info Loading</h1><CircularProgress /></ Container>)
    } else if (error) {
        return (<h1>Archive Query Error: {getErrorMessage(error)}</h1>)
    } else {
        return (
            <div>
                <Container>
                    <MaterialTable title="Topic Archives" columns={state.columns} data={state.data}
                        actions={[
                            {
                                icon: () => <GetAppIcon />,
                                tooltip: 'Download Data',
                                onClick: (event, rowData) => {
                                    if (!Array.isArray(rowData)) {
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
                        <CsvDownloadModal data={downloadData} error={downloadError} progress={progress} loading={downloadLoading} topic={topicToDownload} setTopic={setTopicToDownload} clearDownloadData={() => { getArchiveData({ topic: "", stopDownloading: true }) }} />
                    </Dialog>
                </Container>
            </div>
        )
    }
}

export default Archives;