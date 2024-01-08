import * as accessrightservice from '../Components/Entitlement/services/applevelaccessright-service';

export const validateEntitlements = (accessRights, projectId, group, entitlementId) => {
    let value = false;
    if(accessRights !== null && accessRights !== undefined && accessRights.length > 0){
        let projectAccessRights = accessRights.filter((a) => {
            return a.projectId === projectId;
        })
        if(projectAccessRights.length > 0){
            for(let i=0;i<projectAccessRights.length;i++){
                if(projectAccessRights[i].group === group && projectAccessRights[i].entitlementId === entitlementId){
                    value = true;
                    break;
                }
            }
        }
    } 
   
    return value;
}

export const validateAppLevelEntitlements = (accessRights, group, entitlementId) => {
    let value = false;
    // console.log("accessRights",accessRights);
    if(accessRights !== null && accessRights !== undefined && accessRights.length > 0){
       
        // let projectAccessRights = accessRights.filter((a) => {
        //     return a.projectId === projectId;
        // })
        // if(projectAccessRights.length > 0){
            for(let i=0;i<accessRights.length;i++){
                if(accessRights[i].group === group && accessRights[i].entitlementId === entitlementId){
                    value = true;
                    break;
                }
            }
        // }
    } 
//    console.log("value",value);
    return value;
}

export  const validateAppLevelAccessRight = async (userId) =>{
    
        let { response } = await accessrightservice.getUserAppLevelAccessRights(userId);
        let entitlements = (response.data.length>0)?response.data:[];
        // console.log("entitlements",entitlements);
        let appLevelAccessRights = [];
         
        // entitlements.map((element, index)=>{
            if(entitlements.length > 0) {
                for(let i=0;i<entitlements.length ;i++) {
                    if(entitlements[i].access === true){
                        if(appLevelAccessRights.indexOf(entitlements[i].group) === -1){
                                appLevelAccessRights.push(entitlements[i].group);
                        }
                    }
                }
            }
          
           
        // })
     
        return appLevelAccessRights;
};