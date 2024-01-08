import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const addMessage = async(msg)=>{
    try {
       
        let messages =await ServiceRequest('post','json',serviceHost + `/messages`,msg);
        return {messages, messagesErr: null};
    }
    catch(messagesErr)  {
         if (messagesErr) {
            return { messages: null, messagesErr};
        }
    };
}

export const deleteMessage = async(id,projectId, taskId, message)=>{
   
    let data = {message, projectId,taskId}
    
    try {
       
        let messages =await ServiceRequest('put','json',serviceHost + `/messages/`+ id,data);
        return {messages, messagesErr: null};
    }
    catch(messagesErr)  {
         if (messagesErr) {
            return { messages: null, messagesErr};
        }
    };
}