import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';


export const postFile = async(formData) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + `/uploadProfile`,formData);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}
