import React from 'react';
import TaskList from './task-list';
import PropTypes from 'prop-types';
import TasksCalendarView from './tasks-calendar-view';
import * as dateUtil from '../../utils/date-util';
import config from '../../common/config';
import * as validate from '../../common/validate-entitlements';

export default class Dashboard extends React.Component {
  state = {
    isTaskNew: true,
    isLoaded: true,
    tasks: this.props.tasks,
    project: this.props.project,
    categories: this.props.categories,
    users: this.props.users,
    taskPriorities: this.props.taskPriorities,
    view: this.props.view,
    appLevelAccess: this.props.appLevelAccess,
    updatedTime: new Date().getTime(),
    loadingState: false,
    item: 25,
    pageNo: 1,
  };

  static propTypes = {
    categories: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
  };

  componentWillMount() {
    this.setState({
      isLoaded: false,
      updatedTime: dateUtil.getTime(),
    });
  }  
  componentDidMount() {
    if (this.iScroll) {
      this.iScroll.addEventListener('scroll', () => {
        if (
          this.iScroll.scrollTop + this.iScroll.clientHeight >=
          this.iScroll.scrollHeight
        ) {
          this.loadMoreItems();
        }
      });
    }
  }

  loadMoreItems() {
    this.setState({
      loadingState: true,
      pageNo: this.state.pageNo + 1,
    });
    // setTimeout(() => {
    //     this.setState({ pageNo: this.state.pageNo + 1, loadingState: false });
    // }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      project: nextProps.project,
      tasks: nextProps.tasks,
      categories: nextProps.categories,
      users: nextProps.users,
      taskPriorities: nextProps.taskPriorities,
      showEditTask: nextProps.showEditTask,
      showNewTask: nextProps.showNewTask,
      view: nextProps.view,
      updatedTime: dateUtil.getTime(),
      category: nextProps.category,
      appLevelAccess: nextProps.appLevelAccess,
    });
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //     // console.log("Task Dashboard shouldComponentUpdate "+(!(this.props.updatedTime===nextProps.updatedTime && this.state.updatedTime===nextState.updatedTime)));
  //     return !(this.props.updatedTime === nextProps.updatedTime && this.state.updatedTime === nextState.updatedTime);
  // }
  componentDidCatch(error, info) {
    // ////console.log("Dashboard: ERROR: ", error, info);
    // Display fallback UI
    this.setState({
      hasError: true,
      updatedTime: dateUtil.getTime(),
    });
  }

  render() {
    var {
      // categories,
      //projectId,
      tasks,
      onReorderTask,
      // onDragover,
      onDrop,
      //match,
      //users,
      //taskPriorities,
      project,
    } = this.props;
    let loadingState = this.state.loadingState;
    let addTask = validate.validateAppLevelEntitlements(
      this.state.appLevelAccess,
      'Task',
      'Create'
    );

    let projectStatus = project.status;
    let allowCreateTask = true;
    for (let i = 0; i < config.projectStatusCheck.length; i++) {
      if (projectStatus !== config.projectStatusCheck[i]) {
        allowCreateTask = false;
      } else {
        allowCreateTask = true;
        break;
      }
    }

    //to do vishal
    var tCategories = [];
    tCategories = project.category && project.category.split(',');

    let tasksByCategory = {};
    if (tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        if (tasksByCategory[tasks[i].category]) {
          tasksByCategory[tasks[i].category].push(tasks[i]);
        } else {
          tasksByCategory[tasks[i].category] = [tasks[i]];
        }
      }
    }
    var taskLists =
      tCategories &&
      tCategories.map((cat, index) => {
        let filteredTasks = [];
        if (cat === 'completed') {
          if (tasksByCategory[cat] && tasksByCategory[cat].length > 0) {
            const totalRecords = tasksByCategory[cat].length - 1;
            let startRecord = 0;
            let endRecord = this.state.pageNo * this.state.item - 1;
            if (totalRecords < this.state.item) {
              endRecord = totalRecords;
              loadingState = false;
            }
            // startRecord = (this.state.pageNo - 1) * this.state.item;
            if (endRecord > totalRecords) {
              endRecord = totalRecords;
              loadingState = false;
            }
            //   }
            for (let i = startRecord; i <= endRecord; i++) {
              filteredTasks.push(tasksByCategory[cat][i]);
            }
          } else {
            filteredTasks = [];
          }
        } else {
          filteredTasks = tasksByCategory[cat] ? tasksByCategory[cat] : [];
        }

        let catDisplayName = this.props.category && this.props.category[cat];
        //  console.log("catDisplayName",catDisplayName);
        return (
          <React.Fragment key={cat + index}>
            {this.state.isLoaded ? (
              <img src='./images/loader.svg' alt='loading' />
            ) : (
              <div
                ref={cat === 'completed' ? 'iScroll' : ''}
                className={
                  this.props.showEditTask || this.props.showNewTask
                    ? filteredTasks.length === 0
                      ? 'empty-category '
                      : `category showHorizontal `
                    : 'category'
                }
                key={cat}
                onDragOver={this.props.onDragOver.bind(this)}
                onDrop={onDrop.bind(this, cat)}
              >
                <div className='category-header'>
                  <span>
                    {catDisplayName} &nbsp; (
                    {cat !== 'completed'
                      ? filteredTasks.length
                      : tasksByCategory[cat]
                      ? tasksByCategory[cat].length
                      : filteredTasks.length}
                    )
                  </span>

                  {/* {!allowCreateTask || !addTask ? (
                    ''
                  ) : cat === 'todo' ? (
                    <span
                      title='new task'
                      className='float-right'
                      onClick={this.props.addNewTaskWindow}
                      style={{ color: '#FF9800', fontSize: '14px' }}
                    >
                      <i className='fas fa-plus-square'></i>
                    </span>
                  ) : (
                    ''
                  )} */}

                  {/* <span title="new task" className="pull-right"
                                            style={{ color: '#FF9800', fontSize: '14px' }}><Link to={`/project/task/create/${this.props.projectId}`} className="links">
                                            <i className="fas fa-plus"></i></Link> </span>: ''} */}
                </div>
                <TaskList
                  {...this.props}
                  tasks={filteredTasks}
                  tasksData={this.props.tasks}
                  editTaskWindow={this.props.editTaskWindow}
                  onReorderTask={onReorderTask}
                  taskPriority={this.props.taskPriority}
                  appLevelAccess={this.state.appLevelAccess}
                />
                {cat !== 'completed' ? (
                  ''
                ) : loadingState ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      style={{ width: '30px', height: '30px' }}
                      src='/images/loading.svg'
                      alt='loading'
                    />
                  </div>
                ) : (
                  ''
                )}
              </div>
            )}
          </React.Fragment>
        );
      });
    return (
      <React.Fragment>
        {/*
          In order to know about what `allowCreateTask` or `addTask`, please 
          see above⬆. (I had to do the same)
        */}
        {!allowCreateTask || !addTask ? (
          ''
        ) : (
          <div
            // className='col-lg-3'
            onClick={this.props.addNewTaskWindow}
            style={{
              cursor: 'pointer',
              padding: '1rem',
              background:
                'linear-gradient(90deg, rgba(240, 191, 42, 1) 31%, rgba(244, 185, 6, 1) 100%)',
              width: /* window.innerWidth >= 320 ? 'auto' : */ 'auto',
              margin: 5,
              textAlign: 'center',
              fontWeight: 'bold',
              borderRadius: '0.3rem',
            }}
          >
            <i class='fa fa-plus' aria-hidden='true'></i> Create a New Task
          </div>
        )}

        {this.state.view === 'kanbanView' ? (
          taskLists
        ) : (
          <TasksCalendarView tasks={this.state.tasks} />
        )}
        {/* {taskLists} */}
      </React.Fragment>
    );
  }
}
