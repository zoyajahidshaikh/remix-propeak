import React, {Component} from 'react';
import * as accessrightservice from '../services/applevelaccessright-service';
// import * as userservice from '../../../Services/user/user-service';
import './applevelaccessrights.scss';
import './applevelaccessrights.css';

export default class AppLevelAccessRight extends Component{
    constructor(props){
       super(props);
      
      this.handleCheck = this.handleCheck.bind(this); 
      this.handleInputChange = this.handleInputChange.bind(this);
      this.onSaveAccessRights = this.onSaveAccessRights.bind(this);
      this.reset=this.reset.bind(this)
      this.state = { 
        users: this.props.context.state.users,
        entitlements:"",
        userName: "",
        label: "",
        message:""
      };
    }

   async componentDidMount(){
       var response = await accessrightservice.getAppLevelAccessState();
    //    console.log("response",response);
    // if(this.state.users.length === 0 ) this.props.context.actions.setUsers();
        this.props.context.actions.setUsers();
        this.setState({
            entitlements : response.accessRightData
        });
    }

    componentWillReceiveProps (nextProps) {
        this.setState ({
            users: nextProps.context.state.users
        })
    }

    handleInputChange (e)  {
        let userName = e.target.value;

        if(userName === ""){
            let entitlementsCopy = Object.assign([],this.state.entitlements);
            let entitlements = entitlementsCopy.map((e) => {
                e.Value = false;
                return e;
            })
            this.setState({
                entitlements: entitlements,
                userName: userName,
                label:""
            })
        } else {
 
            let userId = this.props.context.state.userNameToId && this.props.context.state.userNameToId[userName.toLowerCase().replace(/ +/g, "")];
            
            this.getUserAppLevelAccessRights(userId);
    
            this.setState({
                userName: userName,
                label:""
            })
        }     
    }

  
    handleCheck(id, e) {
        const target = e.target;
        const value = target.checked;

        let rights = Object.assign([], this.state.entitlements);
        let userEntitlements = rights.map((r) => {
            if (r.id === id) {
                r.Value = value;
            }
            return r;
        })

        this.setState({
            entitlements: userEntitlements
        })
    }

    async getUserAppLevelAccessRights(userId)  {
      
        let { response, err } = await accessrightservice.getUserAppLevelAccessRights(userId);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {
           
            if(response.data.length > 0) {
                let getEntitlements = [];
                for(let i = 0; i < response.data.length; i++){
                    getEntitlements =this.state.entitlements && this.state.entitlements.map((e) => {
                        if(response.data[i].entitlementId === e.EntitlementId && response.data[i].group === e.Group){
                            e.Value = true;
                        }
                        return e;
                    })
                }
                
                this.setState({
                    entitlements: getEntitlements
                })
            } else {
                let entitlementsCopy = Object.assign([],this.state.entitlements);
                let entitlements = entitlementsCopy.map((e) => {
                    e.Value = false;
                    return e;
                })
                this.setState({
                    entitlements: entitlements
                })
            }  
        }     
    }

    async onSaveAccessRights(e){
        e.preventDefault();
        let userId = this.props.context.state.userNameToId && this.props.context.state.userNameToId[this.state.userName.toLowerCase().replace(/ +/g, "")];
        let userEntitlements = this.state.entitlements.filter((e) => {
            return e.Value === true;
        });

        let userAccessRights = {
            userId : userId,
            entitlements: userEntitlements
        }
       
        let { response, err } = await accessrightservice.saveUserAppLevelAccessRight(userAccessRights);

        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {
            let entitlementsCopy = Object.assign([],this.state.entitlements);
            let entitlements = entitlementsCopy.map((e) => {
                e.Value = false;
                return e;
            })
            this.setState({
                label: response.data.msg,
                userName: "",
                entitlements: entitlements
            })
        }
    }

    reset(){
        let entitlementsCopy = Object.assign([],this.state.entitlements);
        let entitlements = entitlementsCopy.map((e) => {
            e.Value = false;
            return e;
        })
        this.setState({
            entitlements: entitlements,
            userName: ''
        })
    }

    render(){

   // if(!!this.state.entitlements){

        let { entitlements } = this.state;
     
        let entitlementObject = {};
        let tableHeaderObject = {};
        if (entitlements.length > 0) {
            for (let i = 0; i < entitlements.length; i++) {
                if (entitlementObject[entitlements[i].Group]) {
                    entitlementObject[entitlements[i].Group].push(entitlements[i])
                } else {
                    entitlementObject[entitlements[i].Group] = [entitlements[i]]
                }

                if(tableHeaderObject[entitlements[i].EntitlementId]){
                    tableHeaderObject[entitlements[i].EntitlementId].push(entitlements[i])
                }
                else{
                    tableHeaderObject[entitlements[i].EntitlementId] = [entitlements[i]]
                }
            }
        }

        var keys = Object.keys(entitlementObject);
        var tableHeaders = Object.keys(tableHeaderObject);
        var a = {};
        let tableHeader = [];
            for(let i=0;i<tableHeaders.length;i++){
                if(Object.keys(a).indexOf(tableHeaders[i]) === -1){
                    a[tableHeaders[i]] = [];
     
                    tableHeader.push(
                       <th key={tableHeaders[i]}>{tableHeaders[i]}</th>
                    )
                 }
            }
            
        

      
        let checkBoxes = keys.map((k, index) => {
             var arrOfIndx = [];
            for(var n = 0; n < entitlementObject[k].length; n++ ){
                arrOfIndx.push(Object.keys(a).indexOf(entitlementObject[k][n].EntitlementId))
            }

            for(var l = 0; l < Object.keys(a).length; l++){

                if(arrOfIndx.indexOf(l) === -1){
                    let obj = {
                        "id": +new Date() + l, 
                        "Group": k,
                        "EntitlementId":"", 
                        "Value": false
                    };

                    entitlementObject[k].splice(l, 0, obj);
 
                }
                     
           }

            let values = entitlementObject[k].map((b, indx) => {

                
                if(Object.keys(a)[indx] === b.EntitlementId){
                    return (
                    <td key={b.id}>
                        <input type='checkbox'  className='access-check' placeholder=" " onChange={ this.handleCheck.bind(this, b.id) } checked={b.Value} />
                    </td>
                    )
                }
                else{
                    return(
                        <td key={b.id}></td>
                    )
                }
         
            })


            return(
                <tr key={k}>
                    <td>{k}</td>
                    {values}
                </tr>
            )
        });


   // }

   //let isUser = this.state.users !== null && this.state.users.length > 0 ;
    
        if(this.state.users !== null && this.state.users.length > 0){
         
            var Users = this.state.users.map((u) => {
                return (<div ><option  key={u._id}
                    data-value={u.userId}>{u.name}</option></div>)
            })
        }


        return (
            <div className="container bg-white">
                <form onSubmit={this.onSaveAccessRights}>
                    <span style={{ color: 'green' }}>{this.state.label}</span>
                    <div className="row" style={{ marginTop: "10px" }}>
                        <div className="col-sm-5">


                            <label htmlFor="Assigned Users" style={{ fontSize: "small" }}>Users : </label>
                            <span style={{position: 'relative', display: 'flex'}}>
                                <input type="text" value={this.state.userName} list="assignedUsers" onChange={this.handleInputChange}
                                name="userName" className="form-control rounded-0" autoComplete="off" placeholder="Select User" />
{ this.state.userName && 
<span onClick={this.reset} className="fa fa-times-circle rounded-0 close-circle" style={{position: 'absolute', top: '11px', right: '50px', cursor: 'pointer'}}></span>
                            }  
                              </span>
                               
                            <datalist id="assignedUsers"   >

                                {
                                    Users
                                }
                            </datalist>
                          
                            {/* <span id="clear" className="fa fa-times-circle rounded-0" style={{cursor: 'pointer'}} onClick={this.reset}></span> */}
                        </div>
                    </div>
                    <br />
                    <div className="table" id="app-access" >
                    <table className="scroll">
                        <thead>
                            <tr>
                             <th>Group</th>
                             {tableHeader}
                            </tr>
                           
                        </thead>
                        <tbody>
                          {checkBoxes}
                        </tbody>
                    </table>
                 </div>
                    <div className="row" style={{ marginTop: "10px" }}>
                        <div className="col-sm-2 float-right">
                            <input type="submit" className="btn btn-primary btn-block" value="Save" disabled = {!this.state.userName}
                            />
                        </div>
                    </div>
                </form> 
            </div>
        )
  }
}
