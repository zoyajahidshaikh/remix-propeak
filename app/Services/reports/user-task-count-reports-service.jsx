import { serviceHost } from '../../common/const';
import ServiceRequest from '../../utils/service-request';

export const getUserTaskCountReport = async (reportParams) => {
    try {
        let data = { reportParams}

        let response = await ServiceRequest('post', 'json', serviceHost + '/reports/getUserTaskCountReport', data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }
}