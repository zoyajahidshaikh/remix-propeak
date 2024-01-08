import React from 'react';
import * as uploadservice from '../services/global-level-repository-service';
import './global-repository.css'
import Auth from '../../../utils/auth';
import * as ObjectId from '../../../utils/mongo-objectid';
// import { CLIENT_RENEG_LIMIT } from 'tls';
import { Link } from 'react-router-dom';

export default class GlobalRepositoryForm extends React.Component {
    constructor(props) {
        super(props);

        this.onUpload = this.onUpload.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this)
    }
    state = {
        uploadFileView: [],
        title: '',
        fileName: '',
        description: '',
        createdBy: Auth.get('userId'),
        createdOn: new Date(),
        path: this.props.pathValue,
        isDeleted: false,
        fileId: this.props.fileId,
        message: '',
        errMessage: ''
    }
    onDragOver(ev) {
        ev.preventDefault();
    }

    onDrop(ev) {
        ev.preventDefault();

        this.setState({
            fileName: ev.dataTransfer.files[0],
            message: '',
            errMessage: ''
        })
    }
    handleFileUpload(e) {
        this.setState({
            fileName: e.target.files[0],
            message: '',
            errMessage: ''
        }
        )
    }
    handleInputChange(e) {
        let name = e.target.name
        this.setState({
            [name]: e.target.value,
            message: '',
            errMessage: ''
        })
    }
    onUpload(e) {
        e.preventDefault();
        var { title,
            fileName,
            description,
            createdBy,
            createdOn,
            isDeleted } = this.state;
        if (fileName === '') {
            this.setState({
                errMessage: "Please choose a file"
            })
        } else if (title === '') {
            this.setState({
                errMessage: "Please add title"
            })
        } else {
            var name
            var fileUploadName = fileName.name ? fileName.name.split('.') : fileName.split('.');
            if (this.props.fileId) {
                name = fileName
            }
            else {

                var extension = fileUploadName[fileUploadName.length - 1];
                var d = new Date();
                var dateTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
                name = fileUploadName[0] + '_' + dateTime + '.' + extension;
            }
            let formData = new FormData();
            let uploadfileName = fileName.name ? fileName : ''
            formData.append('uploadFile', uploadfileName);
            formData.append('title', title);
            formData.append('fileName', name);
            formData.append('description', description);
            formData.append('createdBy', createdBy);
            formData.append('createdOn', createdOn);
            let pathD = this.props.fileId ? this.state.path : this.state.path.split('|').join('/').toLowerCase()//this.state.path.replace('|', "/")
            formData.append('path', pathD);
            let id = this.state._id ? this.state._id : ObjectId.mongoObjectId()
            formData.append('_id', id);
            formData.append('isDeleted', isDeleted);
            if (this.props.fileId) {
                this.editFile(formData);
            } else {
                this.uploadFile(formData);
            }

        }
    }
    async editFile(formData) {

        let { response, err } = await uploadservice.editRepositoryFile(formData);
        if (err) {
            this.setState({
                errMessage: err
            });
        }
        else if (response.data.error) {
            this.setState({
                errMessage: response.data.error
            });
        } else {
            this.setState({
                message: response.data.msg,
                title: '',
                fileName: '',
                description: '',
                createdBy: Auth.get('userId'),
                createdOn: new Date(),
                path: '',
                isDeleted: false,
                uploadFileView: [...this.state.uploadFileView, response.data.result]
            })
        }
    }
    async uploadFile(formData) {
        let { response, err } = await uploadservice.postFile(formData);
        if (err) {
            this.setState({
                errMessage: err
            });
        }
        else if (response.data.error) {
            this.setState({
                errMessage: response.data.error
            });
        } else {
            this.setState({
                message: response.data.msg,
                title: '',
                fileName: '',
                description: '',
                createdBy: Auth.get('userId'),
                createdOn: new Date(),
                path: '',
                isDeleted: false,
                uploadFileView: [...this.state.uploadFileView, response.data.result]
            })
        }
    }

    componentDidMount() {
        if (this.props.fileId) {
            this.getFile(this.props.fileId)
        }
    }
    async getFile(fileId) {

        let { response, err } = await uploadservice.getRepositoryFile(fileId);
        if (err) {
            this.setState({
                errMessage: err
            });
        }
        else if (response.data.error) {
            this.setState({
                errMessage: response.data.error
            });
        } else {
            if (response.data.result.length > 0) {
                this.setState({
                    _id: response.data.result[0]._id,
                    title: response.data.result[0].title,
                    fileName: response.data.result[0].fileName,
                    description: response.data.result[0].description,
                    createdBy: response.data.result[0].createdBy,
                    createdOn: response.data.result[0].createdOn,
                    path: response.data.result[0].path,
                    isDeleted: response.data.result[0].isDeleted,
                })
            }

        }
    }



    render() {
        window.addEventListener("dragover", function (e) {
            e.preventDefault();
        }, false);
        window.addEventListener("drop", function (e) {
            e.preventDefault();
        }, false);
        var { title, description } = this.state;
        return (
            <div className="container bg-white">
                <div className="row " >
                    <div className="col-sm-12">
                            <h4 className="project-title">{this.props.fileId ? 'Edit' : 'Add'} Document</h4>
                            {this.state.message || this.state.errMessage ?
                                    <div>
                                       {this.state.message ?  <span  className="alert alert-danger" >{this.state.message} </span>:''}
                                        { this.state.errMessage ? <span  className="alert alert-danger " >{this.state.errMessage} </span>: ''}
                                    </div>
                                    :''
                                   }
                                <div className="form-wrapper">
                                  
                                    <div className="row">

                                        <div className="col-sm-6">

                                            <div className="form-group" >
                                                <label htmlFor="title">Title</label>
                                                <span style={{ color: 'red' }}>*</span>&nbsp;

                                <input type="text" className='form-control rounded-0' name="title" value={title} id="title" onChange={this.handleInputChange} 
                                autoComplete="off"/>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label htmlFor="title">Description</label>&nbsp;
                                <textarea className='form-control rounded-0 ' name="description" value={description} id="description" onChange={this.handleInputChange} />
                                            </div>
                                        </div>

                                    </div>
                                    {this.props.fileId ? '' :
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="input-group mt-3 mb-3">
                                                    <div className="custom-file">
                                                        <input type="file" className="custom-file-input" name="fileName" id="fileName" onChange={this.handleFileUpload} />
                                                        <label className="custom-file-label" htmlFor="fileName">Choose file</label>
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="col-sm-6">

                                        
                                            <span>Or drag and drop files below</span>
                                    <div className="document-upload-drop-zone" style={{height: '100px'}} id="drop-zone" onDragOver={this.onDragOver} onDrop={this.onDrop} >
                                    {/* {this.state.fileName ? '' : <p >or drop file here</p>} */}
                                                        {this.state.fileName !== null && this.state.fileName !== undefined ? <span >{this.state.fileName.name}</span> : null}
                                    </div>
                              
                                                
                                                       
                                                    </div>
                                               
                                        </div>}
                                    <div className="row">
                                        <div className="col-sm-12">
                                        <div className="row">
                                        <div className="col-sm-8"></div>
                                        <div className="col-sm-2">
                                        <button className="btn btn-info btn-block mt-2" id="" onClick={this.onUpload}>Submit</button>
                                             
                                                </div>
                                                <div className="col-sm-2">
                                                <Link to="/globalrepository" className="btn btn-default btn-block mt-2">Cancel</Link>
                                                </div>
                                            </div>
                                       </div>
                                    </div>
                                </div>
                           
                    </div>
                </div>
            </div>
        )
    }
}