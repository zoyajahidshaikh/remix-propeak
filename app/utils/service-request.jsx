import axios from 'axios';
import Auth from './auth';
import {ACCESS_TOKEN,REFRESH_TOKEN} from '../common/const';

function parseJSON(response) {
    return response.json ? response.json() : response;
  }
  
  /**
   * Checks if a network request came back fine, and throws an error if not
   *
   * @param  {object} response   A response from a network request
   *
   * @return {object|undefined} Returns either the response, or throws an error
   */
  function checkStatus(response) {
    // console.log(response);
    if (response.status >= 200 && response.status < 300) {
      let token=response.headers[ACCESS_TOKEN]?response.headers[ACCESS_TOKEN]:response.headers[ACCESS_TOKEN.toLowerCase()];
      // console.log("token",token);
      let refreshToken=response.headers[REFRESH_TOKEN]?response.headers[REFRESH_TOKEN]:response.headers[REFRESH_TOKEN.toLowerCase()];
      // console.log("refreshToken",refreshToken);
      if(token){
        Auth.setToken(token);
        Auth.set(REFRESH_TOKEN,refreshToken);
      }
      return response;
    }
    // else if(response.status===403)
    // {
    //     window.location.href="/";
    // }
  
    return parseJSON(response).then(responseFormatted => {
      const error = new Error(response.statusText);
      error.response = response;
      error.response.payload = responseFormatted;
      throw error;
    });
  }

const ServiceRequest = async ( method,responseType,url,data)=> {
  try{
        axios.defaults.headers.common[ACCESS_TOKEN] = Auth.getToken(ACCESS_TOKEN);
        axios.defaults.headers.common[REFRESH_TOKEN] = Auth.getToken(REFRESH_TOKEN);
        // console.log(url);
        return await axios({
        method: method,//'post',
        responseType: responseType,//'json',
        url: url, ///users/login',
        data: data //userLogin
    }).then(checkStatus)
    .then(parseJSON)
    .catch(error=> {
     
      // console.dir(error);
      if (error.response) {
        // console.log(error.response);
        let res=error.response;
        if(res.status===403)
    {
      Auth.clearAppStorage();
      window.location.reload();
    }
    else if(res.status===500)
    {
      alert("Error occured. Please try after sometime");
    }
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        // console.log('Error', error.message);
    }
    // console.log(error.config);
    
      throw error;    
   
  });
  }
  catch(err)  {     
    // console.log(err);
        //      return {response:null};
    throw err;      
  }
}
export default ServiceRequest;