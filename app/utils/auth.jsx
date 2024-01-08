import {ACCESS_TOKEN} from '../common/const';
const USER_INFO = 'userInfo';


const parse = JSON.parse;
const stringify = JSON.stringify;

const Auth = {
  /**
   * Remove an item from the used storage
   * @param  {String} key [description]
   */
  clear(key) {
    if (localStorage && localStorage.getItem(key)) {
      return localStorage.removeItem(key);
    }
   
    // if (sessionStorage && sessionStorage.getItem(key)) {
    //   return sessionStorage.removeItem(key);
    // }

    return null;
  },

  /**
   * Clear all app storage
   */
  clearAppStorage() {
    if (localStorage) {
      localStorage.clear();
    }

    // if (sessionStorage) {
    //   sessionStorage.clear();
    // }
  },

  clearToken(tokenKey = ACCESS_TOKEN) {
    return Auth.clear(tokenKey);
  },

  clearUserInfo(userInfo = USER_INFO) {
    return Auth.clear(userInfo);
  },

  /**
   * Returns data from storage
   * @param  {String} key Item to get from the storage
   * @return {String|Object}     Data from the storage
   */
  get(key) {
    if (localStorage && localStorage.getItem(key)) {
      return parse(localStorage.getItem(key)) || null;
    }

    // if (sessionStorage && sessionStorage.getItem(key)) {
    //   return parse(sessionStorage.getItem(key)) || null;
    // }

    return null;
  },

  getToken(tokenKey = ACCESS_TOKEN) {
    return Auth.get(tokenKey);
  },

  getUserInfo(userInfo = USER_INFO) {
    // console.log("userinfo in auth",userInfo);
    return Auth.get(userInfo);
    
  },

  /**
   * Set data in storage
   * @param {String|Object}  value    The data to store
   * @param {String}  key
   * @param {Boolean} isLocalStorage  Defines if we need to store in localStorage or sessionStorage
   */
  set(key,value,isLocalStorage) {
    if (isEmpty(value)) {
      return null;
    }

    if (isLocalStorage && localStorage) {
      // console.log(stringify(value))
      return localStorage.setItem(key, stringify(value));
    }
    if (localStorage) {
      // console.log(stringify(value))
      return localStorage.setItem(key, stringify(value));
    }

    // if (sessionStorage) {
    //   console.log(sessionStorage.setItem(key, stringify(value)));
    //   console.log(stringify(value))
    //   return sessionStorage.setItem(key, stringify(value));
    // }

    return null;
  },

  setToken(value = '', tokenKey = ACCESS_TOKEN, isLocalStorage = false) {
    // console.log("setToken value,tokenkey,islocalstorage",value, tokenKey, isLocalStorage);
    return Auth.set(tokenKey,value,  isLocalStorage);
  },

  setUserInfo(value = '', userInfo = USER_INFO, isLocalStorage = false) {
    // console.log(value, userInfo, isLocalStorage);
    return Auth.set(userInfo,value, isLocalStorage);
  },
};

export default Auth;
