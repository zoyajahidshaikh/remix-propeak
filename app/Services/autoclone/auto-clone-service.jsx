import { serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const addAutoClone = async(period) => {
    try {
      
        let response =await ServiceRequest('post','json',serviceHost +  `/autoClones`, period);
      
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}


export const getAutoClonByProjectId = async(projectId) => {
    try {
        
        let data={projectId:projectId}
        let response =await ServiceRequest('post','json',serviceHost + "/autoClones/getautoCloneData",data);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
    };
}

export const updateAutoClone = async(period) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost +  `/autoClones/update`,period);
      
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}