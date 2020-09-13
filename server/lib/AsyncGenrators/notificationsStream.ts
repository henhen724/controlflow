import { on } from 'events';
import Notification from '../../models/Notification';

const getNotificationStream = () => {
    const notificationEmitter = Notification.watch();

    return on(notificationEmitter, "change");
}

export default getNotificationStream;