import React, { Component } from 'react';
import './category.css';

const labelStyle = {
    fontSize: "small",
};

const submitStyle = {
    float: "right",
};

export default class CategoryForm extends Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    state = {
        categories: this.props.categories,
        category: this.props.category,
        msg: '',
        sequence:'',
        title:''
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ category: nextProps.category });
    }

    handleCheckbox(e) {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
            category: {
                ...this.state.category,
                [name]: value,

            }
        });
    }
   
    // handleInputChange(event) {
    //     const value = event.target.value;
    //     const name = event.target.name;

    //     if (name === 'sequence') {
    //         this.sequence= event.target.value;
    //     }
        
    //     if (name === 'displayName') {
    //         if (this.state.category.title === 'todo' || this.state.category.title === 'inprogress' || this.state.category.title === 'completed') {
    //             this.title = this.state.category.title
    //         }
    //         else {
    //             this.title = value.toLowerCase().split(' ').join('')
    //         }
    //     } 
    //     this.setState({
    //         category: {
    //             ...this.state.category,
    //             [name]: value,
    //             title: this.title,
    //             sequence: this.sequence
    //         },
    //         msg: '',
    //     });
    // }
    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;
    
        let title = this.state.category.title;
        let sequence = this.state.category.sequence;
    
        if (name === 'sequence') {
            sequence = event.target.value;
        }
    
        if (name === 'displayName') {
            if (title === 'todo' || title === 'inprogress' || title === 'completed') {
                title = title;
            } else {
                title = value.toLowerCase().split(' ').join('');
            }
        }
    
        this.setState({
            category: {
                ...this.state.category,
                [name]: value,
                title: title,
                sequence: sequence
            },
            msg: '',
        });
    }
    

    onSubmit(e) {
        e.preventDefault();
        var { onSubmit } = this.props;
        let displayNames = this.props.categories.filter((t) => {
            // if(t.displayName == this.state.category.displayName && t.sequence == this.state.category.sequence)
            if (t.displayName === this.state.category.displayName && t.sequence === this.state.category.sequence)

            {
                return t.displayName;
            }
            else{
                return null;
            }            
        });
        if (displayNames && displayNames.length !== 0) {
            this.setState({
                msg: 'Category already exists',
                category: {
                    ...this.state.category,
                    displayName: "",
                    title: '',
                    show: true,
                    sequence:''
                }
            })
        }
        else {
            
            if (this.state.category.title === undefined) {
                if (this.state.category.displayName === 'todo' || this.state.category.displayName === 'inprogress' || this.state.category.displayName === 'completed') {
                    this.state.category.title = this.state.category.displayName
                }
                else {
                    this.state.category.title = this.state.category.displayName.toLowerCase().split(' ').join('')
                }
            } 
            let titles = this.props.categories.filter((t) => {
                return t.title === this.state.category.title;
            });
            // console.log("titles", titles);
           
            let Data = Object.assign({}, this.state.category)
            // if (Data._id === undefined) {
            if (this.state.category.title !== 'todo' &&
                this.state.category.title !== 'inprogress' && this.state.category.title !== 'completed') {
                if (titles && titles.length !== 0) {
                    Data.title = Data.title + 1
                }
                // console.log(" Data.title", Data.title)
            }           
        
            onSubmit(Data);
      
        }
    };

    render() {
       
        console.log("category",this.state.category)
        var { displayName,sequence, show } = this.state.category;
        return (
            <div style={{ marginTop: "10px" }}>
                <span onClick={this.props.closeCategory} className="float-right mr-3">
                    <i className="fas fa-times close"></i>
                </span>
                {this.state.category._id ?
                    <h4 className="sub-title ml-3"> Edit Category</h4> :
                    <h4 className="sub-title ml-3"> Add Category</h4>}
                 <hr/>
                
                <div className="container">
                {this.props.message ||this.props.labelvalue|| this.props.labelsuccessvalue ?
                <div className="row">
                   <div className="col-sm-12">
                        {this.props.message ? 
                            <span htmlFor="category" className="alert alert-danger">
                                    {this.props.message}
                            </span> : ""}
                         
                                  
                        {this.props.labelsuccessvalue ?
                            <span htmlFor="category" className="alert alert-success" value={this.props.labelsuccessvalue}>
                                    {this.props.labelsuccessvalue}
                            </span>:""}
                    </div>
                        </div>:""}
                        <div className="form-group" >
                    <form onSubmit={this.onSubmit}>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label style={labelStyle}>Category</label>
                                    <span style={{ color: 'red' }}>*</span>
                                   
                                    <input className="form-control" type='text' placeholder=" " id='txtDisplayName' name='displayName' onChange={this.handleInputChange}
                                        value={displayName} autoComplete="off"
                                    />
                                    {this.state.msg ? <span>{this.state.msg}</span> : ''}
                                   
                                </div>
                            </div>
                        </div>

                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label style={labelStyle}>Sequence</label>
                                        <span style={{ color: 'red' }}>*</span>

                                        <input className="form-control" type='text' placeholder=" " id='txtSequence' name='sequence' onChange={this.handleInputChange}
                                            value={sequence} autoComplete="off"
                                        />
                                        {this.state.msg ? <span>{this.state.msg}</span> : ''}

                                    </div>
                                </div>
                            </div> 

                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label style={labelStyle}>Show</label><span style={{ color: 'red' }}>*</span> &nbsp;
                                    <input type='checkbox' placeholder=" " id='txtShow' onChange={this.handleCheckbox} name='show' value={show} checked={show} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <input type="submit" value="Submit" className="btn btn-info btn-block" />
                                </div>
                            </div>

                        
                    </form>
                    </div>
                </div>
            </div>
        )
    }
}
