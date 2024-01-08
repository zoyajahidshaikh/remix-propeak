import React from 'react';
import * as uploadservice from '../services/global-level-repository-service';

import './global-repository.css'
import { Link } from 'react-router-dom';
import * as validate from '../../../common/validate-entitlements';
import DataTable from '../../../Components/datatable';
import config from '../../../common/config';
//import { CLIENT_RENEG_LIMIT } from 'tls';

export default class GlobalRepositoryMain extends React.Component {
    constructor(props) {
        super(props);
        this.createPath = this.createPath.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onCancel = this.onCancel.bind(this)
        this.onkeyEnter = this.onkeyEnter.bind(this);
        //this.previousRoute = this.previousRoute.bind(this);
        // this.links = [];
    }
    state = {
        data: [],
        appLevelAccess: this.props.context.state.appLevelAccess,
        headers: [
            {
                title: " ", index: 1,
                cell: row => {
                    let stringCheck = row._id === undefined;
                    if (stringCheck) {
                        return (

                            <div>
                                <span onClick={this.getAllRepositoryFile.bind(this, row.path)}>
                                    <i className="fas fa-folder-open cursor-point icon"></i>
                                </span>
                            </div>
                        )
                    }
                    // else {
                    //     return (

                    //         <div>
                    //             <Link to={'/globalrepository/edit/' + row._id}>
                    //                 <i className=""></i>
                    //             </Link>
                    //             &nbsp;
                    //             <span
                    //                 onClick={this.deleteFile.bind(this, row._id)}>
                    //                 <i className="fas fa-trash-alt text-danger"></i>
                    //             </span>
                    //             &nbsp;
                    //             <span onClick={this.downloadFile.bind(this, row.path, row.fileName)}>
                    //                 <i className="fas fa-download"></i>
                    //             </span>
                    //         </div>
                    //     )
                    // }
                }
            },
            {
                title: "Title", accessor: "title", index: 2,

            },
            { title: "Description", accessor: "description", index: 3 },
            { title: "File Name", accessor: "fileName", index: 4 },

            {
                title: "        ", index: 5, cell: row => {
                    let stringCheck = row._id !== undefined;
                    if (stringCheck) {
                        return (

                            <div >
                                <Link to={'/globalrepository/edit/' + row._id}>
                                    <i className=" icon" ></i>
                                </Link>
                                &nbsp;
                                <span
                                    onClick={this.deleteFile.bind(this, row._id)}>
                                    <i className="fas fa-trash-alt text-danger icon"></i>
                                </span>
                                &nbsp;
                                <span onClick={this.downloadFile.bind(this, row.path, row.fileName)}>
                                    <i className="fas fa-download icon"></i>
                                </span>
                            </div>
                        )
                    }
                    // else {
                    //     return (

                    //         <div>
                    //             <span onClick={this.getAllRepositoryFile.bind(this, row.path)}>
                    //                 <i className="fas fa-folder-open cursor-point"></i>
                    //             </span>
                    //         </div>
                    //     )
                    // }


                }
            }
        ],
        pathValue: '',
        pathData: 'root',
        linkProp: 'root',
        showPath: false,
        linkData: '',
        errMessage: ''
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            appLevelAccess: nextProps.context.state.appLevelAccess
        });
    }
    componentDidMount() {
        if (this.state.appLevelAccess.length === 0) {
            this.props.context.actions.getAppLevelAccessRights();
        }
        this.getAllRepositoryFile(this.state.pathData)

    }

    async downloadFile(path, filename) {
        let { response, err } = await uploadservice.downloadFile(path, filename);
        if (err) {
            this.setState({
                message: 'Server failed, file did not get downloaded'
            });
        }
        else {
            const url = await window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
        }
    }

    async getAllRepositoryFile(pathD, e) {
        let { response, err } = await uploadservice.getAllRepositoryFile(pathD);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response.data.error) {
            this.setState({
                message: response.data.error
            });
        } else {
            let linkD = ''
            let linkProp = ''
            if (pathD === '/') {
                linkD = 'root'
                linkProp = 'root'
            }
            else if (pathD === 'root') {
                linkD = 'root'
                linkProp = 'root'
            }
            else {
                let data = pathD.slice(1);
                let pathLink = data.split('/').join('|').toLowerCase()//data.replace('/', "|").toLowerCase()
                linkProp = pathLink;
                linkD = pathD

            }
            this.setState({
                data: response.data.result,
                pathData: linkD,
                linkProp: linkProp
            })
        }
    }
    
    async deleteFile(fileId) {
        if (window.confirm('Are you sure you want to delete this document?')) {
            let files = this.state.data.filter((u) => {
                return u._id === fileId;
            });
            let uploadFile = (files.length > 0) ? files[0] : []
            let updatedFile = {
                _id: uploadFile._id,
                isDeleted: true,
                fileName: uploadFile.fileName,
                path: uploadFile.path,
            }


            var obj = { updatedFile: updatedFile }
            let { response, err } = await uploadservice.deleteFile(obj);
            if (err) {
                this.setState({
                    message: 'File did not get deleted'
                });
            }
            else {
                let deleteFile = this.state.data.filter((u) => {
                    return u._id !== fileId;
                });
                this.setState({
                    message: response.data.msg,
                    data: deleteFile
                })
            }
        }
    }
    createPath() {
        this.setState({
            showPath: true
        })
    }
    async onSubmit(e) {
        if(e){
            e.preventDefault();
        }
      
        let value = this.state.pathValue;
        let folderPath,data1
        if (this.state.pathData === 'root') {
            folderPath =  value
        }
        else {
            data1 = this.state.pathData.slice(1);
            folderPath = data1 + '/' + value
        }
        let { response, err } = await uploadservice.createFolder(folderPath);
        if (err) {
            this.setState({
                errMessage: 'Folder did not Created'
            });
        }
        else {
            if (response.data &&  response.data.folder) {
                response.data.folder['title'] = value
                this.setState({
                    message: response.data.msg,
                    data: [...this.state.data, response.data.folder],

                })
            }
            else {
                this.setState({
                    errMessage: response.data.msg,
                })
            }
        }
        let pathLink
        //let path
        if (this.state.pathData === 'root') {
            pathLink = 'root' //+ value;
           // path = '/' + value;
        }
        else {
            let data = this.state.pathData.slice(1);
            let linkData = data  //+ '/' + value;
            //pathLink = linkData.replace('/', "|").toLowerCase()
            pathLink=linkData.split('/').join('|').toLowerCase()
            // this.setState({
            //     pathData: pathLink,
            // })
            //path = '/' + data + '/' + value
        }
        this.setState({
           pathValue: '',
           // pathData: path,
            linkProp: pathLink,
           // showPath: false,
           // message: ''
            //errMessage: ''
        })
    }
    onCancel() {
        let pathLink
        if (this.state.pathData === 'root') {
            pathLink = 'root' //+ value;
           // path = '/' + value;
        }
        else {
            let data = this.state.pathData.slice(1);
            let linkData = data  //+ '/' + value;
            //pathLink = linkData.replace('/', "|").toLowerCase()
            pathLink=linkData.split('/').join('|').toLowerCase()
            // this.setState({
            //     pathData: pathLink,
            // })
            //path = '/' + data + '/' + value
        }
        this.setState({
            showPath: false,
           // pathData: 'root',
            linkProp: pathLink,
            pathValue: '',
            errMessage: '',
            message:''
        })
    }
    handleInputChange(e) {
        let name = e.target.name
        if (e.target.value.match(/^[a-zA-Z1-9\s]*$/)) {
            this.setState({
                [name]: e.target.value,
                errMessage: '',
                message:''

            })
        } else {
            this.setState({
                [name]: e.target.value,
                message: '',
                errMessage: 'Please enter valid character'

            })
        }

    }

    previousRoute(pathD) {
        this.getAllRepositoryFile(pathD)

    }

    onkeyEnter(e) {
        if (e.which === 13) {
          this.onSubmit();
        }
      }
    render() {
        const dataTable = (
            <DataTable className="data-table"
                keyField="id"
                pagination={{
                    enabled: true,
                    pageLength: 50,
                    type: "long"  // long,short
                }}
                width="100%"
                headers={this.state.headers}
                data={this.state.data ? this.state.data : []}
                noData="No Documents!"
                show={config.Export} />
        );

        let data = this.state.pathData;
        let linkData = data.split('/');
        let links = [];
        let root=""
        for (let i = 0; i < linkData.length; i++) {
            if (linkData[i] === '') {
                links.push(<span key={i}><a onClick={this.previousRoute.bind(this, "/")}>/root</a></span>)
            }
            else {
                root+="/"+linkData[i];
                links.push(<span key={i}>/ <a onClick={this.previousRoute.bind(this, root)}>{linkData[i]}</a></span>);
            }
        }
        let createFile = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Global Document Repository', 'Create');

        return (
            <div className="container bg-white">
                <div className="row">
                    <div className='col-sm-12 pr-1'>
                    <h4 className="project-total mt-2">  Documents</h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <span title="Create Folder" className="btn btn-xs btn-info mr-1" onClick={this.createPath}>
                            New Folder &nbsp;
                                    <i className="fas fa-plus"></i>
                        </span>
                        {/* className="newProjectIcon h6 btn border ml-1"  */}
                        {createFile ?
                            <span title="New File " className="">

                                <Link to={'/globalrepository/create/' + this.state.linkProp} className="btn btn-xs btn-info" >
                                    New Document &nbsp;
                                    <i className="fas fa-plus"></i>
                                </Link>

                            </span>
                            : null}
                    </div>
                </div>
                <div className='row'>
                    <div className="col-md-12">
                        {
                            this.state.showPath === true ?
                                <form className="form-wrapper">
                                    {/* <div className="card mb-1">
                                        <div className="card-body pb-0 pt-1"> */}
                                           {this.state.message ? <span className="alert alert-success" >{this.state.message} </span>:''}
                                            {this.state.errMessage ?<span className="alert alert-danger">{this.state.errMessage} </span>:''}
                                            <div className='row'>
                                                <div className="col-sm-2">
                                                    <div className="form-group">
                                                        <label htmlFor="title" className='text-right'>Folder Name</label>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="form-group">

                                                        <input type="text" className='form-control' name="pathValue" value={this.state.pathValue} onChange={this.handleInputChange} onKeyPress={this.onkeyEnter} />
                                                    </div>
                                                </div>
                                                <div className="col-sm-2">
                                                    <div className="form-group">
                                                        <button className="btn btn-info btn-block mr-1" onClick={this.onSubmit} disabled={!this.state.pathValue}>Create</button>
                                                       
                                                    </div>
                                                </div>
                                                <div className="col-sm-2">
                                                    <div className="form-group">
                                                       
                                                        <button className="btn btn-default btn-block ml-1" onClick={this.onCancel}>Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        {/* </div>
                                    </div> */}
                                </form>
                                : ''
                        }

                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-sm-12'>
                        <div className="card mb-1">
                            <div className="card-body pt-1 pb-1 text-info cursor-point">
                                {links}
                            </div>
                        </div>
                    </div>

                </div>
                <div className="row">
                    <div className='col-sm-12'>
                        {dataTable}
                    </div>
                </div>
            </div>
        )
    }
}