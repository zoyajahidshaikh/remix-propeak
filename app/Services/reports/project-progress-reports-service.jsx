import { serviceHost } from '../../common/const';
import ServiceRequest from '../../utils/service-request';

export const getProjectProgressReport = async (projectId) => {
    let data = { projectId: projectId}
    try {
        let response = await ServiceRequest('post', 'json', serviceHost + '/reports/getProjectProgressReport', data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }
}