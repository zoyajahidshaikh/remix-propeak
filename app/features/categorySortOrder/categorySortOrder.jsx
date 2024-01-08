import React, { Component } from 'react';
import TaskMenu from '../tasks/task-menu';
import * as projectservice from "../../Services/project/project-service";


export default class CategorySortOrder extends Component {

    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.cat = [];
    }

    state = {
        labelvalue: '',
        labelsuccessvalue: '',
        projectName: this.props.context.state.projectName,
        project: this.props.context.state.project,
        users: this.props.context.state.users,
        categorySequency: []
    }

    onSubmit(e) {
        e.preventDefault();
        const changedOrderedString = this.state.categorySequency.toString();
        const proj = this.state.project;
        proj.category = changedOrderedString;
        this.updateRecord(proj);

    }

    async updateRecord(project) {

        let { response, err } = await projectservice.updateProjectCategory(project);
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
        else {
            this.setState({
                labelsuccessvalue: response.data.msg,
                labelvalue: response.data.msgErr
            });
        }
    }

    async componentDidMount() {

        await this.props.context.actions.getProjectData(this.props.projectId);
        if (this.state.users.length === 0) this.props.context.actions.setUsers();


        if (this.state.project && this.state.project.category) {
            this.setState({
                categorySequency: this.state.project.category.split(',')
            })
        }

    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({
            project: nextProps.context.state.project,
            users: nextProps.context.state.users,

        })

        // function(){
        //     this.cat=[];
        //     if( this.state.project && this.state.project.category){
        //        let category=  this.state.project.category.split(',');           
        //         category && category.map((c, index) =>{
        //             this.cat.push({name:c,index:index});
        //         })
        //     }

        // }
    }


    handleInputChange(e, index) {

        const value = e.target.value;
        const name = e.target.name;

        const new_index = value;
        const old_index = this.state.categorySequency.indexOf(name);

        let orderlist = array_move(this.state.categorySequency, old_index, new_index);

        this.setState({
            labelvalue: "",
            labelsuccessvalue: "",
            categorySequency: orderlist
        })

        function array_move(arr, old_index, new_index) {
            if (new_index >= arr.length) {
               new_index=old_index;
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr; // for testing
        };

    }

    render() {

        let category;
       
        if (this.state.categorySequency) {
            category = this.state.categorySequency;
        }

        return (

            <React.Fragment>
                <div className="container content-wrapper">
                    <h3 className="project-title d.inline-block mt-3 mb-3">{this.state.projectName}-Change Frequency</h3>
                    <hr />
                    <TaskMenu {...this.props} />
                    <form onSubmit={this.onSubmit}>
                        <div className="row">
                            <div className="col-sm-12">
                                {this.state.labelvalue ?
                                    <span htmlFor="project" className="alert alert-danger" value={this.state.labelvalue}>
                                        {this.state.labelvalue}
                                    </span>
                                    :
                                    this.state.labelsuccessvalue ?
                                        <span htmlFor="project" className="alert alert-success" value={this.state.labelsuccessvalue}>
                                            {this.state.labelsuccessvalue}
                                        </span>
                                        : ""}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12"> </div>
                        </div>
                        {category && category.map((c, index) => (
                            <div className="row">                                
                                <div className="col-sm-3">
                                    <label id={index} >{c}</label>
                                </div>
                                <div className="col-sm-3">
                                    <input type="text" onChange={(e) => this.handleInputChange(e, index)} value={index} name={c} />
                                </div>
                            </div>
                        ))}
                        {/* <div>
                           {values}
                       </div> */}

                        <div className="row">
                            <div className="col-sm-3"></div>
                            <div className="col-sm-2">
                                <input type="submit" value="Submit" className="btn btn-info btn-block" />
                            </div>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        )
    }

}