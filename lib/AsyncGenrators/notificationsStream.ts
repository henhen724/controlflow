import Notification, { INotification } from '../../models/Notification';
import stream from './index';
const notificationStream = () => {
    const notificationEmitter = Notification.watch();

    return stream(notificationEmitter, "change", (change) => change.operationType === 'insert' || change.operationType === 'delete');
}

export default notificationStream;