import React from 'react';
import FormErrors from '../tasks/form-errors';

const labelStyle = {
    fontSize: "small",
};


export default class CompanyForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    state = {
        company:this.props.company,
        formValid: (this.props.companyId) ? true : false,
        titleCheck: false,
        checkMsg: false,
        message: '',
        companyId:this.props.companyId,
        formErrors: {},
        companyNameValid: '',
        contactValid:'',
        labelsuccessvalue:this.props.labelsuccessvalue
    
    }
  
    componentWillReceiveProps(nextProps) {
        this.setState({ company: nextProps.company,
            companyId:nextProps.companyId,
            labelsuccessvalue:nextProps.labelsuccessvalue
          
         });
    }

    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;

        this.setState({
            company: {
                ...this.state.company,
                [name]: value,
            },
            checkMsg: false,
            labelsuccessvalue: ''
        },
            this.validateField.bind(this, name, value));
       
    }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let companyNameValid = this.state.companyNameValid;
        let contactValid = this.state.contactValid;

        switch (fieldName) {
            case 'companyName':
                companyNameValid = value.length !== 0;
                fieldValidationErrors['Company Name'] = companyNameValid ? '' : ' Please fill the';
                break;
            case 'contact':
                contactValid = value.match(/^[0-9]{10}$/); //value.length !== 0 &&
                fieldValidationErrors['Contact'] = contactValid ? '' : ' Please fill the 10 digits number only in';
                break;
            default:
                break;
        }

        this.setState({
            formErrors: fieldValidationErrors,
            companyNameValid: companyNameValid,
        }, this.validateForm(this.state.companyId));
    }

    validateForm(companyId) {
        if (companyId) {
            this.setState({ formValid: true });
        }
    }

    onSubmit(e) {
        e.preventDefault();
        let data = Object.assign({}, this.state.company)
     
        if (this.props.company._id) {
            this.props.editCompany(data);
            this.setState({
                labelsuccessvalue:'',
                message: ''
    
            })
        }
        else{
            this.props.onCompanySubmit(data);
            this.setState({
                company: {
                    ...this.state.company,
                    companyName: '',
                    companyCode: '',
                    country: '',
                    address: '',
                    contact: ''
                },
                labelsuccessvalue:'',
                message: ''
    
            })
        }
    
    }


    render() {
        var {
            companyName,
            companyCode,
            country,
            address,
            contact } = this.state.company;
        var { checkMsg } = this.state;
      
        return (
            <div style={{ marginTop: "10px" }}>
            
                <span onClick={this.props.closeCompany} className="float-right mr-3">
                    <i className="fas fa-times close"></i>
                </span>
                {this.state.company._id  ?
                    <h4 className="sub-title ml-3"> Edit Company</h4> :
                    <h4 className="sub-title ml-3"> Add  Company</h4>
                }
                <hr/>
                <div className="container">
                    {this.state.errUserMessage || this.state.errMessage || this.state.formErrors ?

                            <div className="row">
                                <div className="col-sm-12 ">

                                    {/* 
                                    <div className="alert alert-danger">
                                        {this.state.errUserMessage ? this.state.errUserMessage : this.state.errMessage}
                                    </div> */}


                                    {checkMsg ?
                                        <span className="alert alert-success">
                                            {this.state.message}
                                        </span>
                                        : ""}

                                    {this.state.formErrors ?

                                        <FormErrors formErrors={this.state.formErrors} />

                                        : ""}

                                    {this.state.labelsuccessvalue ?
                                        <span className="alert alert-success">
                                            {this.state.labelsuccessvalue}
                                        </span>
                                        : ""}

                                </div>
                            </div>
                        
                        : ""}
                    
                    <div className="form-group" >

                  
                    <form onSubmit={this.onSubmit}>
                            <div className="row">
                                <div className="col-sm-12">
                                   
                                        <div className="form-group" >
                                            <label htmlFor="Company Name" style={labelStyle}>Company Name</label>
                                            <span style={{ color: 'red' }}>*</span>
                                            <input type="text" name="companyName" className="form-control"
                                                placeholder="Company Name"
                                                value={companyName}
                                                onChange={this.handleInputChange} 
                                                autoComplete="off"/>
                                        </div>
                                </div>
                  </div>
                      
                        <div className="row">
                           
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor="Status" style={labelStyle}>Company Code</label>
                                    <input type="text" name="companyCode" className="form-control"
                                        placeholder="Company Code"
                                       value={companyCode}
                                        onChange={this.handleInputChange} autoComplete="off" />
                                </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label htmlFor="Status" style={labelStyle}>Country</label>
                                        <select
                                            value={country}
                                            onChange={this.handleInputChange} name="country" className="form-control">
                                            <option value="" disabled>Select Country</option>
                                            <option value="India" >India</option>
                                            <option value="America" >America</option>
                                            <option value="China" >China</option>
                                        </select>
                                    </div>
                                </div>
                          
                        </div>
                        <div className="row">
                    
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor="Company Name" style={labelStyle}>Company Address</label>
                                    <input type="text" name="address" className="form-control"
                                        placeholder="Company Address"
                                       value={address}
                                        onChange={this.handleInputChange}/>
                                </div>
                            </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label htmlFor="Status" style={labelStyle}>Contact</label>
                                        <input type="text" name="contact" className="form-control"
                                            placeholder="Contact"
                                            value={contact}
                                            onChange={this.handleInputChange} autoComplete="off"  />
                                    </div>
                                </div>
                         
                           
                        </div>
                       
                        <div className="row">
                            <div className="col-sm-12">
                                <input type="submit" className="btn btn-info btn-block"
                                    value="Submit" disabled={!(this.state.company.companyName)} />
                            </div>
                        </div>

                    </form>
                    </div>
                </div>
            </div>
        )
    }
}