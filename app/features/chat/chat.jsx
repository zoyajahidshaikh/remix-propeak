import React,{Component} from 'react';
// import { Link } from 'react-router-dom';
import SubjectList from './subject-list';
import * as chatservice from '../../Services/chat/chat-service';
import TaskMenu from '../tasks/task-menu';
// 
const labelStyle = {
    fontSize: "small",
};

export default class Chat extends Component {
    // constructor(props){
    //     super(props);
    // }

    state = {
        isLoaded: true,
        subject: "",
        subjects: [],
        projectSubjects: [],
        projectName: this.props.context.state.projectName
    }

    handleInputChange = (e) => {
        const target = e.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]:value
        })
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.addSubject(this.state.subject);
        this.setState({
            subject: "" 
        })  
    }

    addSubject = async (subject) => {
        // console.log("subject",subject);
        let { response, err } = await chatservice.addSubject(subject,this.props.projectId);
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
            // console.log("response.data",response.data);
            if(!this.props.projectId){
                this.setState({
                    subjects: [...this.state.subjects,response.data]
                })
            } else {
                this.setState({
                    projectSubjects: [...this.state.projectSubjects,response.data]
                })
            }
            
        }
    }

    onDeleteSubject = async(subjectId) => {
        let { response, err } = await chatservice.deleteSubject(subjectId);
        if (err) {
            this.setState({
                message: 'Error : ' + err,
                labelvalue: 'Error : ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error : ' + response.data.err,
                labelvalue: 'Error : ' + response.data.err,
            });
        } else {
            let subjects = [];
            if(this.props.projectId) {
                subjects = Object.assign([],this.props.context.state.projectSubjects);
            } else {
                subjects = Object.assign([],this.props.context.state.subjects);
            }
            let modifiedSubjects = subjects.filter((s) => {
                return s._id !== subjectId;
            });
            if(!this.props.projectId) {
                this.props.context.actions.updateState("subjects", modifiedSubjects);
            } else {
                this.props.context.actions.updateState("projectSubjects", modifiedSubjects);
               
            }
        }
    }

    onToggleEditSubject = (subjectId) => {
        // console.log("subjectId",subjectId);
        let subjects = [];
        if(this.props.projectId) {
            subjects = Object.assign([],this.props.context.state.projectSubjects);
        } else {
            subjects = Object.assign([],this.props.context.state.subjects);
        }
        
        let editSubjects = subjects.map((s) => {
            if(s._id === subjectId){
                s.edit = true;
            } 
            return s;
        })
        if(this.props.projectId) {
            this.setState({
                projectSubjects: editSubjects
            }) 
        } else {
            this.setState({
                subjects: editSubjects
            })    
        }
      
    }

    ToggleSubjectEdit = (subjectId, edit) => {
        let subjects = [];
        if(this.props.projectId) {
            subjects = Object.assign([],this.props.context.state.projectSubjects);
        } else {
            subjects = Object.assign([],this.props.context.state.subjects);
        }
        let editSubjects = subjects.map((s) => {
            if(s._id === subjectId) {
                s.edit = false;
                if(edit === true){
                    this.editSubject(s);
                }
            } 
            return s;
        })
        if(this.props.projectId) {
            this.setState({
                projectSubjects: editSubjects
            })
            if(edit === true) this.props.context.actions.updateState("projectSubjects", editSubjects);
        } else {
            this.setState({
                subjects: editSubjects
            })
            if(edit === true) this.props.context.actions.updateState("subjects", editSubjects);
        }
        
    }

    onEditSubject = (e, subjectId) => {
        let target = e.target;
        let subjects = [];
        if(this.props.projectId) {
            subjects = Object.assign([],this.props.context.state.projectSubjects);
        } else {
            subjects = Object.assign([],this.props.context.state.subjects);
        }
        let subjectS = subjects.map((s) => {
            if(s._id === subjectId){
                s.title = target.value;
            } 
            return s;
        })
        if(this.props.projectId) {
            this.setState({
                projectSubjects: subjectS
            })
        } else {
            this.setState({
                subjects: subjectS
            })
        }
    }

    editSubject = async(subject) => {
        // console.log("subjectId onToggleNewSubject",subject);
        let { response, err } = await chatservice.editSubject(subject._id,subject.title);
        if (err) {
            this.setState({
                message: 'Error : ' + err,
                labelvalue: 'Error : ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error : ' + response.data.err,
                labelvalue: 'Error : ' + response.data.err,
            });
        }
        // } else {
        //     // console.log("response.data",response.data);
        // }
    }

    componentDidMount () {
        if(!this.props.projectId){
            this.props.context.actions.setSubjects();
        } else {
            this.props.context.actions.getProjectSubjects(this.props.projectId);
        }
        
        this.setState({
            isLoaded: false
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            subjects: nextProps.context.state.subjects,
            projectSubjects: nextProps.context.state.projectSubjects
        });
    }

    render() {
        let subjects = [];
        if(this.props.projectId){
            subjects = this.state.projectSubjects;
        } else {
            subjects = this.state.subjects;
        }
        var subjectList = <SubjectList subjects={subjects} onDelete={this.onDeleteSubject} onToggleEdit={this.onToggleEditSubject}
            onEditSubject={this.onEditSubject} onToggleSubjectEdit={this.ToggleSubjectEdit} projectId={this.props.projectId ? this.props.projectId : ""}/>
        return (
            <div className="container content-wrapper">
               {this.state.isLoaded ? <div className="logo">
                     <img src="/images/loading.svg" alt="loading" />
                 </div> :
                    <div>
                    <div className="row">
                        <div className="col-sm-6">
                            {this.props.projectId ?  <h3 style={{ textAlign: 'left', textTransform: 'capitalize' }}>{this.state.projectName}</h3>: "" }
                        </div>
                    </div>
                    {this.props.projectId ? <TaskMenu {...this.props}/> : ""}
                    <form onSubmit={this.onSubmit}>
                         <div className="row" >
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor="Add Subject" style={labelStyle}>Add Subject : </label>
                                    <input type="text" name="subject" className="form-control"
                                        placeholder="Add Subject" autoComplete="off"
                                        value={this.state.subject}
                                        onChange={this.handleInputChange} />
                                </div>
                            </div>
                            <div className="col-sm-offset-11" style={{marginTop:"20px"}}>
                                <input type="submit" className="btn btn-primary btn-block" 
                                    value="Add" />
                            </div>
                             {/* <div className="col-sm-12 form-group">
                                 <span title="new task" className="pull-right" style={{ color: '#FF9800', fontSize: '14px' }}>
                                     <Link to={`/chats/createSubject`} className="links">
                                         <i className="glyphicon glyphicon-plus"></i>
                                     </Link>
                                 </span>
                             </div> */}
                         </div>
                         </form>
                         <div>
                             {subjectList}
                         </div>
                     </div>}
            </div>
        )
    }
}