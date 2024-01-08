import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const getAllCategories = async() =>{
    try {
        let response =await ServiceRequest('get','json',serviceHost + '/categories');
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
      };
}


export const deleteCategory = async(id) => {
    try {
        let data = {id}
        let response = await ServiceRequest('post','json',serviceHost + '/categories/deleteCategory',data);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const editCategory = async(category,id) => {
    try {
      
        let response =await ServiceRequest('put','json',serviceHost + '/categories/'+id,category);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const saveCategory = async(category) => {
    try {
        
        let response =await ServiceRequest('post','json',serviceHost + '/categories/addCategory',category);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}