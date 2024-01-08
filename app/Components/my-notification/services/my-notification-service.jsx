import { serviceHost } from '../../../common/const';
import ServiceRequest from '../../../utils/service-request';

export const getMyNotifications = async () => {
    try {

        let response = await ServiceRequest('get', 'json', serviceHost + '/mynotifications');
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }
}

export const markNotificationRead = async (myNotificationId) => {
    try {
        let data = { myNotificationId };
        let response = await ServiceRequest('post', 'json', serviceHost + '/mynotifications/notificationsRead', data);

        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }
}