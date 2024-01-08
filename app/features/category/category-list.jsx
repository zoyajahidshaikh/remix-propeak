import React from 'react';
import * as validate from '../../common/validate-entitlements';


// const MyComponent = React.memo(function MyComponent(props) {
// 	/* only rerenders if props change */
// });
const CategoryList = React.memo((props) => {

// const CategoryList = (props) => {
	// console.log("categorylist rendered", props);
	let editCategory = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Category', 'Edit');
	let deleteCategory = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Category', 'Delete');

	// props.categories.sort((a, b) => parseInt(a.sequence, 10) > parseInt(b.sequence, 10));
	var categoryView = props.categories.map((category, index) => {

		return (
			<li className="list-group-item d-flex justify-content-between align-items-center" id={index} key={category._id} draggable="true"
				onDragStart={props.onDragStart.bind(this, index)} onDrop={props.onDrop.bind(this, index)} onDragOver={props.onDragOver.bind(this)}>
			
					{category.displayName}
					
				<span>
				{category.sequence}&nbsp;&nbsp;&nbsp;
					{editCategory ? <span className="btn btn-xs btn-outline-info " onClick={props.editCategoryWindow.bind(this, category)}>
						<i className="fas fa-pencil-alt"></i>
					</span> : ""}
					&nbsp;

					{category.title !== 'todo' && category.title !== 'inprogress' && category.title !== 'completed' && deleteCategory ?
					<span title="Delete Category"
					className="btn btn-xs btn-outline-danger"
						onClick={
							props.onDeleteCategoryById.bind(this, category._id)
						}>
						<i className="far fa-trash-alt"></i>
					</span>
					:
					<span className="blank-space" >&nbsp;</span> 
						
					}


				</span>

			</li>
		)
	});

	return (
			<ul className="list-group list-group-flush">
				{categoryView}
			</ul>
	);

});

export default CategoryList;


