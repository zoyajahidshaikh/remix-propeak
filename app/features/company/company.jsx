import React, { Component } from 'react';
import './company.css';
import CompanyList from './company-list';
import CompanyForm from './company-form';
import * as companyservice from '../../Services/company/company-service';
import * as validate from '../../common/validate-entitlements';

export default class Company extends Component {
    constructor(props) {
        super(props);
        this.addNewCompanyWindow = this.addNewCompanyWindow.bind(this);
        this.closeCompany = this.closeCompany.bind(this);
        this.editCompanyWindow = this.editCompanyWindow.bind(this);
        this.onCompanySubmit = this.onCompanySubmit.bind(this);
        this.editCompany = this.editCompany.bind(this);
        this.onDelete = this.onDelete.bind(this);

    }
    state = {
        company: {
            companyName: '',
            companyCode: '',
            country: '',
            address: '',
            contact: '',
            isDeleted: false
        },
        companies: this.props.context.state.companies,
        isLoaded: true,
        showNewCompany: false,
        showEditCompany: false,
        editCompanyId: "",
        appLevelAccess: this.props.context.state.appLevelAccess
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            companies: nextProps.context.state.companies,
            appLevelAccess: nextProps.context.state.appLevelAccess
        });
    }

    addNewCompanyWindow() {
        this.setState({
            showNewCompany: true,
            company: {
                companyName: '',
                companyCode: '',
                country: '',
                address: '',
                contact: '',
                isDeleted: false
            },
            labelsuccessvalue: '',

        })
    }

    closeCompany() {
        this.setState({
            showNewCompany: false,
            showEditCompany: false,
            editCompanyId: "",
            labelsuccessvalue: '',

        })
    }

    editCompanyWindow(CompanyId, company) {
        this.setState({
            showEditCompany: true,
            editCompanyId: CompanyId,
            company: company,
            labelsuccessvalue: ''
        })
    }
    async onCompanySubmit(company) {
        let { response, err } = await companyservice.addCompany(company);
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
            let companies = Object.assign([], this.props.context.state.companies);
            companies.push(response.data.result);
            this.props.context.actions.updateState("companies", companies);
            this.setState({
                labelsuccessvalue: response.data.msg
            })
        }
    }
    async editCompany(company) {
        let { response, err } = await companyservice.editCompany(company);
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
            let companies = this.props.context.state.companies.map((c) => {
                if (c._id === company._id) {
                    c = company;
                }
                return c;
            });
            this.props.context.actions.updateState("companies", companies);
            this.setState({
                labelsuccessvalue: response.data.msg,
                company: company
            })
        }
    }


    onDelete(companyId) {
        if (window.confirm('Are you sure you want to delete this Company?')) {
            let filteredCompany = this.state.companies && this.state.companies.filter((company) => {
                return company._id === companyId
            })
            filteredCompany[0].isDeleted = true;

            this.deleteCompany(filteredCompany);
        }

    }

    async deleteCompany(company) {
        let { response, err } = await companyservice.deleteCompany(company);
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
            let companies = this.props.context.state.companies.filter((company) => {
                return company._id !== response.data.result._id;
            });
            this.props.context.actions.updateState("companies", companies);
        }
    }

    componentDidMount() {
        this.props.context.actions.setCompanies();
        if (this.state.appLevelAccess.length === 0) {
            this.props.context.actions.getAppLevelAccessRights();
        }
        this.setState({
            isLoaded: false
        })
    }

    render() {
        let companyClass = 'col-sm-12 col-md-6  col-lg-7 contentWrapper';
        let noCompanyClass = 'col-sm-12 col-md-9  col-lg-7 contentWrapper';

        let addCompany = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Company', 'Create');

        var companyList = <CompanyList
            companies={this.state.companies} onDelete={this.onDelete}

            editCompanyWindow={this.editCompanyWindow}
            appLevelAccess={this.state.appLevelAccess} />

        return (
            <div className="container bg-white">
                {this.state.isLoaded ? <div className="logo">
                    <img src="/images/loading.svg" alt="loading" />
                </div> :
                    <React.Fragment>

                        <div className="row">
                        <div className="col-sm-7">
                                <div className="row">

                            
                            <div className="col-sm-6">
                                
                                <h4 className="sub-title ml-3 mt-3"> Company ({this.state.companies.length}) </h4>
                            </div>
                            <div className="col-sm-6">
                                
                                <h4 className="mt-3"> 
                                    {addCompany ? <button className="btn btn-xs btn-info float-right" title="Add Company" onClick={this.addNewCompanyWindow} >
                                      Add Company &nbsp;  <i className="fas fa-plus"></i>
                                    </button> : ""}       
                                </h4>
                                </div>
                            </div>
                                


                            </div>
                        </div>
                     
                        <hr />
                        <div className="row">
                            {this.state.showEditCompany || this.state.showNewCompany ?
                                <div className="col-sm-12 col-md-5 col-lg-5 order-lg-1 order-md-1 form-wrapper" >
                                    <CompanyForm companies={this.state.companies} onCompanySubmit={this.onCompanySubmit}
                                        company={this.state.company}
                                        editCompany={this.editCompany} companyId={this.state.editCompanyId} closeCompany={this.closeCompany}
                                        labelsuccessvalue={this.state.labelsuccessvalue} labelvalue={this.state.labelvalue} >
                                    </CompanyForm>
                                </div> : ""}
                            <div className={this.state.showEditCompany || this.state.showNewCompany ? companyClass : noCompanyClass} >
                               
                                <div className="scroll">

                                {companyList}
                                </div>

                            </div>
                        </div>
                    </React.Fragment>
                
                }
            </div>
        )
    }
}
