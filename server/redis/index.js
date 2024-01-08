var redis = require('redis');
const {redisClientPort, redisClientHost, accessRightsExpiry,companyCode} = require('../config/config');
var client = redis.createClient(redisClientPort, redisClientHost);
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);


client.on('connect', function() {
    console.log('Redis client connected');
});

const setCachedData = (key, data) => {
    let k = companyCode + key;
    let Data = JSON.stringify(data)
     client.set(k, Data, redis.print);

    if(key = "appLevelAccessRightEntitlementData"){
      client.expire(k, accessRightsExpiry); //cache for 1 month, only for app level entitlements data
    }
}

const getCachedData = async (key) =>{
    
    return getAsync(companyCode+key);
}

const clearCachedData = async (key) =>{
    let k = companyCode + key;
    client.del(k, function(err, response) {
        if (response == 1) {
           console.log("Deleted Successfully!")
        } else{
         console.log("Cannot delete")
        }
     })
}



module.exports = {
    setCachedData,
    getCachedData,
    clearCachedData
}