import {serviceHost} from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const getActiveUsersReport = async(reportParams, projectId) => {
    try {
     let data = {reportParams, projectId}
       
        let response =await ServiceRequest('post','json',serviceHost + '/reports/getActiveUsersReport',data);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}