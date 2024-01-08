import React, { Component } from 'react';
import * as uploadservice from '../../Services/upload/upload-service';
import TaskMenu from './task-menu';
import * as dateUtil from '../../utils/date-util';


export default class TasksUpload extends Component {
    constructor(props) {
        super(props);

        this.onTasksFileUpload = this.onTasksFileUpload.bind(this);
        this.handleTasksFileUpload = this.handleTasksFileUpload.bind(this);
    }

    state = {
        message: "",
        messagesuccess: "",
        tasksFile: '',
        projectName: this.props.context.state.projectName,
        isLoaded: true,
        updatedTime: (new Date()).getTime()
    }

    handleTasksFileUpload(e) {
        this.setState({
            tasksFile: e.target.files[0],
            updatedTime: dateUtil.getTime()
        })
    }

    async onTasksFileUpload(e) {
        e.preventDefault();
        var { tasksFile } = this.state;
        if (tasksFile.length === 0) {
            this.setState({
                message: "Please choose a file",
                updatedTime: dateUtil.getTime()
            })
        } else {
            var fileName = tasksFile.name.split('.');
            var extension = fileName[fileName.length - 1];
            var d = new Date();
            var dateTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
            var name = fileName[0] + '_' + dateTime + '.' + extension;
            var isDeleted = false;

            let formData = new FormData();
            formData.append('tasksFile', tasksFile);
            formData.append('filename', name);
            formData.append('isDeleted', isDeleted);
            formData.append('projectId', this.props.projectId);

            let { response, err } = await uploadservice.uploadTasksFile(formData);
            if (err) {
                this.setState({
                    message: err,
                    updatedTime: dateUtil.getTime()
                });
            }
            else if (response.data.error) {
                this.setState({
                    message: response.data.error,
                    updatedTime: dateUtil.getTime()
                });
            } else {
                this.setState({
                    messagesuccess: response.data.msg,
                    updatedTime: dateUtil.getTime()
                });
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            projectName: nextProps.context.state.projectName,
            updatedTime: dateUtil.getTime()
        })
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        //console.log("TaskUpload shouldComponentUpdate "+(!(isEqual(this.props, nextProps) && isEqual(this.state, nextState))));
        return true;//!(isEqual(this.props, nextProps) && isEqual(this.state, nextState));
    }

    componentDidMount() {
        this.setState({
            isLoaded: false,
            updatedTime: dateUtil.getTime()
        })
    }

    render() {
        return (
            <div className="container bg-white">
                {this.state.isLoaded ? <div className="logo">
                    <img src="/images/loading.svg" alt="loading" />
                </div> : 
                <div className="row">
                    <div className="col-sm-12">
                        <h3 className="project-title d.inline-block mb-3" >
                            {this.state.projectName}-Upload File
                         </h3>
                         <hr/>
                        <TaskMenu {...this.props} />
                        <div className='form-wrapper'>
                        <div className="row" >
                            <div className="col-sm-4">
                                {this.state.messagesuccess ?
                                    <span className="alert alert-success">{this.state.messagesuccess}</span>
                                    :''}
                                    {this.state.message ?<span className="alert alert-danger">{this.state.message}</span>:''}
                            </div>
                        </div>

                        <div className="row " >
                            <div className="col-sm-12">
                              
                                        <h5 className="card-title">
                                        Please <a href="/templates/taskTemplate.xlsx">&nbsp;<span style={{color:"blue"}}>Click </span>&nbsp; </a>
                                        here to download template file to upload tasks.

                                        </h5>
                                        <div className="row">
                                            <div className="col-sm-8">
                                                <div className="input-group">
                                                        <div className="custom-file">
                                                            <input type="file"  className="custom-file-input" accept=".xls,.xlsx" name="tasksFile" onChange={this.handleTasksFileUpload} />
                                                            <label className="custom-file-label" htmlFor="uploadFile">Choose file</label>
                                                        </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-2">
                                            <div className="input-group-append">
                                                <input className="btn btn-info btn-block "
                                                     type="button" value="Upload" onClick={this.onTasksFileUpload} />
                                                     </div>
                                            </div>
                                        </div>
                                    
                                   
                                </div>
                                   
                            </div>
                        </div>
                    </div>
                    </div>
                }
            </div>
        );
    }
}