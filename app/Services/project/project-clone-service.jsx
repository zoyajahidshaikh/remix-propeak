import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const addCloneProject = async(projectId) => {
    try {
        let data = {projectId}

        let response =await ServiceRequest('post','json',serviceHost + `/cloneprojects/cloneProject`,data);
        return {response, err: null};
    }
    catch(err)  {
         if (err) {
            return { response: null, err};
        }
    };
}