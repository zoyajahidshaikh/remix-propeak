import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const getAllCompanies = async() =>{
    try {
      
        let response =await ServiceRequest('get','json',serviceHost + `/companies`);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
      };
}

export const addCompany = async(company) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost +  `/companies/addCompany`,company);
      
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const deleteCompany = async(company) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost + `/companies/deleteCompany`,company);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const getCompanyById = async(companyId) => {
    try {
      
        let response =await ServiceRequest('get','json',serviceHost + "/companies/" + companyId);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
    };
}

export const editCompany = async(company) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost + `/companies/editCompany`,company);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}
