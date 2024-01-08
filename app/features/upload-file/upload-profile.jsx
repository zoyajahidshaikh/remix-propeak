import React from 'react';
import * as uploadprofileservice from "../../Services/upload/upload-profile-picture-service";
// import * as ObjectId from '../../utils/mongo-objectid';
import './user-profile.css';
export default class ProfilePicture extends React.Component {
    constructor(props) {
        super(props);

        this.onUpload = this.onUpload.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    state = {
        //uploadFileView: [],
        uploadFile: '',
        message: '',
        errMessage:'',
       // uploadFiles: this.props.uploadFiles
       imagePreviewUrl: ''
    }

    handleFileUpload(e) {
        let reader = new FileReader();
        let file = e.target.files[0];
    
        if (file) {
            reader.onloadend = () => {
                this.setState({
                    uploadFile: file,
                    message: '',
                    errMessage: '',
                    imagePreviewUrl: reader.result
                });
            };
    
            reader.readAsDataURL(file);
        } else {
            // Handle the case where no file is selected
            this.setState({
                uploadFile: null,
                message: '',
                errMessage: 'Please select a file',
                imagePreviewUrl: ''
            });
        }
    }
    

    async uploadFile(formData) {
        let { response, err } = await uploadprofileservice.postFile(formData);
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
            if (this.props._id) {
                this.setState({
                    message:response.data.msg,
                    uploadFile: '',
                    // uploadFileView: [...this.state.uploadFileView, response.data.result]
                })
                document.getElementById('uploadFile').value = '';
            }
            else {
                this.setState({
                    message:response.data.msg,
                    uploadFile: '',
                    // uploadFileView: [...this.state.uploadFileView, response.data.newFile]
                })
                document.getElementById('uploadFile').value = '';
            }
        }
    }

    onUpload(e) {
        e.preventDefault();
        var { uploadFile } = this.state;
        if (uploadFile === '') {
            this.setState({
                errMessage: "Please choose a file"
            })
        } else {
       
            var fileName = uploadFile.name.split('.');
            var extension = fileName[fileName.length - 1];
            var d = new Date();
            var dateTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
            var name = fileName[0] + '_' + dateTime + '.' + extension;
            let formData = new FormData();

            formData.append('uploadFile', uploadFile);
            formData.append('filename', name);

            this.uploadFile(formData);
        }
    }

    // componentWillReceiveProps(nextProps) {
    //     this.setState({
    //         uploadFileView: nextProps.uploadFiles
    //     });
    // }

    onDragOver(ev) {
        ev.preventDefault();
    }

    onDrop(ev) {
        ev.preventDefault();
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

        let {imagePreviewUrl} = this.state;
        //console.log("imagePreviewUrl",imagePreviewUrl)
        let $imagePreview = null;
        if (imagePreviewUrl) {
          $imagePreview = (<img src={imagePreviewUrl} className="img img-thumbnail" style={{height: 'inherit'}} />);
        } else {
          $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
        }
   
        return (
            <div className="container bg-white">
                <div className="card">
                    {/* <div className="card-heading">Profile Photo(<small>Profile photos upload</small>)</div> */}
                    <div className="card-body">
                        <h3 className="card-title">Profile Photo</h3>
                        <hr/>
                        {this.state.message ?
                            <span className="alert alert-success">{this.state.message}</span>
                            : ""}
                            {this.state.errMessage ?
                            <span className="alert alert-danger">{this.state.errMessage}</span>
                            : ""}
          <h5>Upload a photo for your profile</h5>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="input-group mb-3">
                                    <div className="custom-file">
                                        <input type="file" onChange={this.handleFileUpload} className="custom-file-input" id="uploadFile" name="uploadFile" />
                                        <label className="custom-file-label" for="inputGroupFile02" aria-describedby="inputGroupFileAddon02">Choose file</label>
                                    </div>
                                    <div className="input-group-append">
                                        {/* <span className="input-group-text" id="js-upload-submit" onClick={this.onUpload}>Upload</span> */}
                                        <button className="btn btn-outline-secondary" onClick={this.onUpload} type="button" id="js-upload-submit">Upload</button>
                                    </div>
                                </div>
                            </div>
</div>

                  
{/* 
                        
                        <div className="form-inline">
                            <div className="form-group">
                                <input type="file" className="custom-file-input" name="uploadFile" id="uploadFile" onChange={this.handleFileUpload} />
                            </div>
                            <button type="submit" className="btn btn-sm btn-primary" id="js-upload-submit" onClick={this.onUpload}>Upload files</button>
                        </div> */}

                        <div className="row">
                            <div className="col-sm-6 d-none d-lg-block">
          <h4>Or drag and drop files below</h4>
                                <div className="upload-drop-zone" id="drop-zone" onDragOver={
                                    this.onDragOver
                                }
                                    onDrop={
                                        this.onDrop
                                    }>

                                   
                                    {this.state.uploadFile !== null ? <span>{this.state.uploadFile.name} </span> : <span> Just drag and drop files here</span>}
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <h4>Preview</h4>
                                <div className="preview-zone" >
                                {$imagePreview}

                                </div>
                            </div>
                        </div>


     

   
                    </div>
                </div>
            </div>
        )
    }
}