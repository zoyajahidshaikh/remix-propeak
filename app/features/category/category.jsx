import React, { Component } from 'react';
import CategoryForm from './category-form';
import CategoryList from './category-list';
// import Modal from '../../Components/Modal';
import * as categoryservice from '../../Services/category/category-service';
import * as validate from '../../common/validate-entitlements';

export default class Category extends Component {
    constructor(props) {
        super(props);
        this.addNewCategoryWindow = this.addNewCategoryWindow.bind(this);
        this.closeCategory = this.closeCategory.bind(this);
        this.editCategoryWindow = this.editCategoryWindow.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onDeleteCategoryById = this.onDeleteCategoryById.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onDragOver=this.onDragOver.bind(this)
    }
    state = {
        categories: this.props.context.state.categories,
        category: {
            title: '',
            displayName: '',
            custom: '',
            show: true,
            sequence:''
        },
        labelsuccessvalue: '',
        labelvalue: '',
        isLoaded: true,
        showNewCategory: false,
        showEditCategory: false,
        editCategoryId: "",
        appLevelAccess: this.props.context.state.appLevelAccess
    }

    addNewCategoryWindow() {
        this.setState({
            showNewCategory: true,
            category: {
                title: '',
                displayName: '',
                custom: '',
                show: true,
                sequence:''
            },
            labelsuccessvalue: '',
            labelvalue: ''
        })
    }

    closeCategory() {
        this.setState({
            showNewCategory: false,
            showEditCategory: false,
            editCategoryId: "",
            labelsuccessvalue: '',
            labelvalue: ''
        })
    }

    editCategoryWindow(category) {
      
        this.setState({
            showEditCategory: true,
            category: category,
            labelsuccessvalue: '',
            labelvalue: '',
            

        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            categories: nextProps.context.state.categories,
            appLevelAccess: nextProps.context.state.appLevelAccess
        });
    }

    async onSubmit(category) {
        let isEdit = category._id === undefined ? false : true;
        if (!isEdit) {
            //let maxLength = Math.max.apply(Math,
                this.state.categories.map((category) => {
                    if (category.sequence === undefined || category.sequence === null) {
                        category.sequence = 0;
                    }

                    return category.sequence;
                }
               // )
                );
            //category.sequence = maxLength + 1;
        }

        let { response, err } = await categoryservice.saveCategory(category);
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
            let categories = [];
            if (isEdit) {
                categories = this.props.context.state.categories.map((cat) => {
                    if (cat._id === category._id) {
                        cat = response.data.result;
                    }
                    return cat;
                });
            }
            else {
                categories = Object.assign([], this.props.context.state.categories);
                categories.push(response.data.result);
            }

            this.props.context.actions.updateState("categories", categories);
            if (!isEdit) {
                this.setState({
                    category: {
                        ...this.state.category,
                        displayName: '',
                        show: true,
                        title: ''
                    },
                    labelsuccessvalue: response.data.msg,
                    labelvalue: '',
                }
                   
                )
               
            }
            else{
                this.setState({
                    labelsuccessvalue: response.data.msg,
                    labelvalue: '',
                    category:category
                  
                });
            }
          
        }
    }

    async onDeleteCategoryById(categoryId) {
        if (window.confirm('Are you sure you want to delete this Category?')){
            let { response, err } = await categoryservice.deleteCategory(categoryId);
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
                let categories = this.props.context.state.categories.filter((cat) => {
                    return cat._id !== response.data.result._id;
                });
                this.props.context.actions.updateState("categories", categories);
            }
        }
       
    }

    componentDidMount() {
        this.props.context.actions.setCategories();
        if(this.state.appLevelAccess.length === 0){
            this.props.context.actions.getAppLevelAccessRights();
        }
        this.setState({
            isLoaded: false
        })
    }

    onDragStart(sourceIndex, ev) {
        ev.dataTransfer.setData("text", sourceIndex + '');
    }

    async onDrop(destinIndex,ev) {
        let sourceIndex = ev.dataTransfer.getData("text");
        var categoryLists = Object.assign([], this.props.context.state.categories);
        let categoryMove = categoryLists[sourceIndex];
        categoryLists.splice(sourceIndex, 1);
        categoryLists.splice(destinIndex, 0, categoryMove);

        let maxId = 0;
        var categorySequence = categoryLists.map((category) => {
            ++maxId
            category.sequence = maxId;
            return category;
        })
        this.props.context.actions.updateState("categories", categorySequence);
        categorySequence.map((category) => {
            return this.toggleEditCategory(category, category._id);
        })
    }

    async toggleEditCategory(category, catId) {
        let { response, err } = await categoryservice.editCategory(category, catId);
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
    }

    onDragOver(ev) {
        ev.preventDefault();
    }

    render() {
        let categoryClass = 'col-sm-12 col-md-6  col-lg-7 contentWrapper';
        let noCategoryClass = 'col-sm-12 col-md-9  col-lg-7 contentWrapper';
        
        let addCategory = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Category', 'Create');

        var categoryList = <CategoryList
            categories={this.props.context.state.categories}
            onDeleteCategoryById={this.onDeleteCategoryById}
            onDragStart={this.onDragStart}
            onDrop={this.onDrop}
            onDragOver={this.onDragOver}
            editCategoryWindow={this.editCategoryWindow}
            appLevelAccess={this.state.appLevelAccess}
        />;

        return (
            <div className="container bg-white">
                {this.state.isLoaded ?
                    <div className="logo">
                        <img src="/images/loading.svg" alt="loading" />
                    </div> :
                    <React.Fragment>
                        <div className="row" >
                        <div className="col-sm-7" >

                                <div className="row">
                                    <div className="col-sm-6">
                                    <h4 className="sub-title ml-3 mt-3">  Category ({this.props.context.state.categories.length})
                                    </h4>
                                    </div>
                                    <div className="col-sm-6">
                                        <h4 className="mt-3">
                                            {addCategory ?
                                                <span className="btn btn-xs btn-info float-right" title="New Category" onClick={this.addNewCategoryWindow}>
                                                    {/* <i className="fas fa-plus-square"></i> */}
                                                    Add Category &nbsp;<i className="fas fa-plus"></i>
                                                </span> : ""}
                                        </h4>

                                    </div>
                                </div>

                            </div>

                        </div>
                        <hr />

                        <div className="row">
                            {this.state.showEditCategory || this.state.showNewCategory ?
                                <div className="col-sm-12 col-md-5 col-lg-5 order-lg-1 order-md-1 form-wrapper" >
                                    <CategoryForm category={this.state.category} categories={this.props.context.state.categories} message={this.state.message}
                                        categoryId={this.state.editCategoryId} closeCategory={this.closeCategory} labelsuccessvalue={this.state.labelsuccessvalue} labelvalue={this.state.labelvalue} onSubmit={this.onSubmit}>
                                    </CategoryForm>
                                </div> : ""}
                            <div className={this.state.showEditCategory || this.state.showNewCategory ? categoryClass : noCategoryClass} >
                            <div className="scroll">
                                {categoryList}
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
            </div> // container-fluid
        )
    }
}