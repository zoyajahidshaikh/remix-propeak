import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const addCloneTask = async(projectId,taskId) => {
 
    try {
        let data ={projectId,taskId}
      
        let response =await ServiceRequest('post','json',serviceHost + `/clonetasks/cloneTask`,data);
        return {response, err: null};
    }
    catch(err)  {
         if (err) {
            return { response: null, err};
        }
    };
}