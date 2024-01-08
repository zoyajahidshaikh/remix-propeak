import React from 'react';
import './company.css';
import * as validate from '../../common/validate-entitlements';

const CompanyList = React.memo((props) => {
	// const CompanyList = (props) => {
	// console.log("companyList rendered", props);
	let editCompany = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Company', 'Edit');
	let deleteCompany = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Company', 'Delete');

	var companyView = props.companies.map((company, index) => {
		return (
			<React.Fragment>
				
				<li className="list-group-item d-flex justify-content-between align-items-center" key={company._id}>
			
					{company.companyName}
			
					<span >

						{editCompany ? <span className="btn btn-xs btn-outline-info" title="Edit Company" onClick={props.editCompanyWindow.bind(this, company._id, company)}>
						<i className="fas fa-pencil-alt"></i>

					</span> : ""}

					&nbsp;
			
			
					{deleteCompany ? <span className="btn btn-xs btn-outline-danger"  title="Delete Company"
						onClick={

							props.onDelete.bind(this, company._id)
						}>
						<i className="far fa-trash-alt"></i>
					</span> : ""}

				</span>

			</li>
			</React.Fragment>
		)
	});

	return (
		<React.Fragment>
		
			<ul className="list-group list-group-flush">
				{companyView}
			</ul>

			</React.Fragment>
	);

});

export default CompanyList;


