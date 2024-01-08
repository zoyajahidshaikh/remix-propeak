import React from 'react';
import * as uploadservice from "../../Services/upload/upload-service";
import * as ObjectId from '../../utils/mongo-objectid';
import './user-profile.css';

export default class UploadFile extends React.Component {
    constructor(props) {
        super(props);

        this.onUpload = this.onUpload.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    state = {
        uploadFileView: [],
        uploadFile: '',
        message: '',
        uploadFiles: this.props.uploadFiles
    }

    handleFileUpload(e) {
        this.setState({
            uploadFile: e.target.files[0],
            message: ''
        })
    }

    async uploadFile(formData) {
        let { response, err } = await uploadservice.postFile(formData);
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
            if (this.props.taskId) {
                this.setState({
                    uploadFile: '',
                    uploadFileView: [...this.state.uploadFileView, response.data.result]
                })
                document.getElementById('uploadFile').value = '';
                this.props.addUploadTaskFile && this.props.addUploadTaskFile(response.data.result);
            }
            else {
                this.setState({
                    uploadFile: '',
                    uploadFileView: [...this.state.uploadFileView, response.data.newFile]
                })
                document.getElementById('uploadFile').value = '';
                this.props.addUploadFile(response.data.newFile);
            }
        }
    }

    onUpload(e) {
        e.preventDefault();
        var { uploadFile } = this.state;
        if (uploadFile === '') {
            this.setState({
                message: "Please choose a file"
            })
        } else {
       
            var fileName = uploadFile.name.split('.');
            var extension = fileName[fileName.length - 1];
            var d = new Date();
            var dateTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
            var name = fileName[0] + '_' + dateTime + '.' + extension;
            var taskId = this.props.taskId ? this.props.taskId : this.props.newTaskId;
            let formData = new FormData();

            formData.append('uploadFile', uploadFile);
            formData.append('filename', name);
            formData.append('projectId', this.props.projectId);
            formData.append('taskId', taskId);
            formData.append('_id', ObjectId.mongoObjectId());
            // formData.append('isDeleted', isDeleted);

            this.uploadFile(formData);
        }
    }

    async deleteFile(filename, projectId, taskId) {
        if (window.confirm('Are you sure you want to delete this File?')) { 
            let uploadFile = this.state.uploadFileView.filter((u) => {
                return u.filename === filename;
            })[0];
            let updatedFile = {
                _id: uploadFile._id,
                taskId: uploadFile.taskId,
                filename: uploadFile.filename,
                isDeleted: true,
                createdBy: uploadFile.createdBy,
                createdOn: uploadFile.createdOn
            }
            if (filename !== "") {
                var obj = { filename: filename, projectId: projectId, taskId: taskId, updatedFile: updatedFile }
                let { err } = await uploadservice.deleteFile(obj);
                if (err) {
                    this.setState({
                        message: 'File did not get deleted'
                    });
                }
                else {
                    if (this.props.taskId) {
                        this.props.deleteTaskFileById(this.props.taskId, uploadFile._id);
                    } else {
                        this.props.deleteFileById(updatedFile._id);
                    }
                }
            }
        }
    }

    async downloadFile(projectId, taskId, filename){
        let { response, err } = await uploadservice.downloadFile(projectId, taskId, filename);
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

    componentDidMount() {
        if (this.props.taskId) {
            this.setState({
                uploadFileView: this.state.uploadFiles
            })
        }
        else {
            this.setState({
                uploadFileView: this.state.uploadFiles
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            uploadFileView: nextProps.uploadFiles
        });
    }

    onDragOver(ev) {
        ev.preventDefault();
    }

    onDrop(ev) {
        ev.preventDefault();
        // file = ev.dataTransfer.files[0];
        this.setState({
            uploadFile: ev.dataTransfer.files[0],
            message: ''
        })
    }

    render() {
        window.addEventListener("dragover", function(e){
            e.preventDefault();
        }, false);
        window.addEventListener("drop", function(e) {
            e.preventDefault();
        }, false);

        var uploadedFiles = [];

        uploadedFiles = this.state.uploadFileView && this.state.uploadFileView.map((n) => {
            return (
                <tr key={n._id}>
                    <td>{n.filename}{"    "}</td>
                    <td className="text-center">
                        <span onClick={this.downloadFile.bind(this, this.props.projectId, this.props.taskId, n.filename) }>
                            <i className="fas fa-download"></i>
                        </span>
                    </td>
                    <td className="text-center">
                        <span
                            onClick={this.deleteFile.bind(this, n.filename, this.props.projectId, this.props.taskId) }>
                            <i className="fas fa-trash-alt text-danger"></i>
                        </span>
                    </td>
                </tr>
            )
        });
   
        return (
            <div className="container-fluid">
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="row">
                                <div className="col-sm-9 col-lg-9">
                                    <h4 className="mt-3">Related files : &nbsp; </h4>
                                    {this.state.message ? <span className="alert alert-danger" >{this.state.message} </span>:''}
                                    <div className="input-group mt-3 mb-3">
                                        <div className="custom-file">
                                            <input type="file" className="custom-file-input" name="uploadFile" id="uploadFile" onChange={this.handleFileUpload} />
                                            <label className="custom-file-label" htmlFor="uploadFile">Choose file</label>
                                        </div>
                                        <div className="input-group-append">
                                            {/* <span className="input-group-text" id="" onClick={this.onUpload}>Upload</span> */}

                                            <span className="btn btn-outline-secondary" id="" onClick={this.onUpload}>Upload</span> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-9 d-none d-lg-block">
                                    <h4>Or drag and drop files below</h4>
                                    <div className="upload-drop-zone" style={{height: '100px', lineHeight: '100px'}} id="drop-zone" onDragOver={this.onDragOver} onDrop={this.onDrop} >
                                        {this.state.uploadFile !== null ? <span>{this.state.uploadFile.name}</span> : null}
                                    </div>
                                </div>
                             </div>     
                        </div>
                    </div>
                </div>
                <div className="row">
                    {uploadedFiles && uploadedFiles.length > 0 ?
                        <div className="col-sm-12">
                            <h5>Files uploaded: ({uploadedFiles.length})</h5>
                            <div className="table-responsive" style={{ height: '190px' }}>
                                <table id="attachmentsTb" className="table  table-condensed table-bordered table-hover table-striped">
                                    <thead>
                                        <tr>
                                            <th>File Name</th>
                                            <th className="text-center">Download</th>
                                            <th className="text-center">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uploadedFiles}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        :
                        <h6 className="pl-4">No files uploaded yet</h6>
                    }
                </div>
            </div>
        )
    }
}