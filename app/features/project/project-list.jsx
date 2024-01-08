import React from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../utils/auth';
import ProjectsCalendarView from './projects-calendar-view';
// import '../../app.css';
import './project.css';
// import * as dateUtil from '../../utils/DateUtil';
import * as validate from '../../common/validate-entitlements';

const ProjectList = React.memo((props) => {
	console.log('Props:', props);

	// const ProjectList = (props) => {
	// console.log("projectList rendered");
	var onMenuIconClick = (id) => {
		console.log('Clicked Project ID:', id);
		props.toggleProjectMenuOptions(id);
	}

	let showProjectMenuIcons = props.showProjectMenuIcons;

	const ON_HOLD = "onHold";
	console.log('ON_HOLD Constant:', ON_HOLD);

	var { projectsSummary } = props;
	console.log('Projects Summary:', projectsSummary);

	// projectsSummary.sort((a,b) => (b.activeTasks - a.activeTasks));
	let userRole = Auth.get('userRole');
	let groupBy = props.group;
	var projectView = [];
	var groups = {
		status: [
			{ title: 'new', displayName: 'New' },
			{ title: 'onHold', displayName: 'On Hold' },
			{ title: 'inprogress', displayName: 'In Progress' },
			{ title: 'completed', displayName: 'Completed' }
		],
		group: props.categories
	}

	let groupByDate = (projectDate, x) => {
		let today = new Date().toISOString().substr(0, 10);
		let todayDate = new Date();
		let thisYear = todayDate.getFullYear();

		let monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		let first = todayDate.getDate() - todayDate.getDay(); // First day is the day of the month - the day of the week
		let last = first + 6;
		let nextWeekFirst = last + 1;
		let nextWeekLast = nextWeekFirst + 6;
		let firstday = new Date(todayDate.setDate(first));
		let dayFirst = firstday.toISOString().substr(0, 10);
		let lastday = new Date(todayDate.setDate(last));
		let dayLast = lastday.toISOString().substr(0, 10);
		let nextWeekFirstDay = new Date(todayDate.setDate(nextWeekFirst));
		let firstDayNextWeek = nextWeekFirstDay.toISOString().substr(0, 10);
		let nextWeekLastDay = new Date(todayDate.setDate(nextWeekLast));
		let lastDayNextWeek = nextWeekLastDay.toISOString().substr(0, 10);
		let current = "";
		let nextMonthStart = "";
		let nextToNextMonthStart = "";
		if (todayDate.getMonth() === 11) {
			current = new Date(todayDate.getFullYear() + 1, 0, 1);
		} else {
			current = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
		}
		let startThisMonth = current.toISOString().substr(0, 10);
		if (todayDate.getMonth() === 11) {
			nextMonthStart = new Date(todayDate.getFullYear() + 1, 0, 1);
		} else {
			nextMonthStart = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 1);
		}
		let startNextMonth = nextMonthStart.toISOString().substr(0, 10);
		if (nextMonthStart.getMonth() === 11) {
			nextToNextMonthStart = new Date(nextMonthStart.getFullYear() + 1, 0, 1);
		} else {
			nextToNextMonthStart = new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth() + 1, 1);
		}
		let startNextToNextMonth = nextToNextMonthStart.toISOString().substr(0, 10);
		let projectGroup = {};
		let inprogress = [];
		let todaytask = [];
		let thisweek = [];
		let nextweek = [];
		let thisMonth = [];
		let nextMonth = [];
		let filteredProjects = Object.assign([], projectsSummary);
		filteredProjects.sort((a, b) => (b.activeTasks - a.activeTasks));

		for (let i = 0; i <= filteredProjects.length; i++) {
			if (filteredProjects[i] && filteredProjects[i][projectDate] !== undefined) {
				if (filteredProjects[i][projectDate] < today) {
					inprogress.push(filteredProjects[i]);
					projectGroup["_00_inprogress"] = { data: inprogress, title: "In Progress" };
				} else if (filteredProjects[i][projectDate] === today) {
					todaytask.push(filteredProjects[i]);
					projectGroup["_01_today"] = { data: todaytask, title: x + " Today" };
				} else if (filteredProjects[i][projectDate] > dayFirst && filteredProjects[i][projectDate] < dayLast) {
					thisweek.push(filteredProjects[i]);
					projectGroup["_02_thisweek"] = { data: thisweek, title: x + " This Week" };
				} else if (filteredProjects[i][projectDate] > firstDayNextWeek && filteredProjects[i][projectDate] < lastDayNextWeek) {
					nextweek.push(filteredProjects[i]);
					projectGroup["_03_nextweek"] = { data: nextweek, title: x + " Next Week" };
				} else if (filteredProjects[i][projectDate] > startThisMonth && filteredProjects[i][projectDate] < startNextMonth) {
					thisMonth.push(filteredProjects[i]);
					projectGroup["_04_nextMonth"] = { data: thisMonth, title: x + " This Month" };
				} else if (filteredProjects[i][projectDate] > startNextMonth && filteredProjects[i][projectDate] < startNextToNextMonth) {
					nextMonth.push(filteredProjects[i]);
					projectGroup["_05_nextMonth"] = { data: nextMonth, title: x + " Next Month" };
				} else {
					let date = new Date(filteredProjects[i][projectDate]);
					let month = date.getMonth();
					let year = date.getFullYear();
					let monthName = monthList[month];
					let key = "_" + year + "_" + (month + 1) + "_" + monthName;
					let title = "";
					if (year > thisYear) {
						title = monthName + " " + year;
					} else {
						title = monthName;
					}
					if (!projectGroup[key]) {
						projectGroup[key] = { data: [], title: x + " " + title };
					}
					projectGroup[key].data.push(filteredProjects[i]);
				}
			}
		}
		let projectGroupKeys = Object.keys(projectGroup);
		projectGroupKeys.sort();
		let projectView = projectGroupKeys.map((k, i) => {
			let projects = projectGroup[k].data;
			let title = projectGroup[k].title;
			let count = projects.length;
			let projectsView = [];
			if (count > 0) {
				projectsView = projects.map((project) => {
					return createProjectView(project);
				});
			}

			let projectGroupView =
				(
					<div className="col-sm-6 col-md-4 col-lg-3" key={title + count} >
						<div className="category-header">
							<span>{title}</span> <span className="text-warning">
								({count})</span>
						</div>

						<ul className="project-List-scroll" >
							{projectsView}
						</ul>
					</div>
				);
			return projectGroupView;
		});
		return projectView;
	}

	let groupByStatusAndGroup = (groupBy) => {
		let filteredProjects = Object.assign([], projectsSummary);

		filteredProjects.sort((a, b) => (b.activeTasks - a.activeTasks));
		let projectsByGroup = groups[groupBy].map((g, i) => {
			let projects = filteredProjects.filter((p) => {
				return p[groupBy] === g.title;
			});
			let count = projects.length;
			let projectsView = [];

			if (count > 0) {
				projectsView = projects.map((project) => {
					return createProjectView(project)
				});

			}

			let projectGroupView =
				(
					<div className="col-sm-6 col-md-4 col-lg-3 " key={g.title + count} >

						<div className={count > 0 ? "group-wrapper " : "group-wrapper empty-projectlist "}>
							<div className="category-header">
								<span>{g.displayName} </span> <span style={{ color: "rgb(255, 152, 0)" }}>({count})</span>

							</div>

							<ul className="project-List-scroll">
								{projectsView}
							</ul>
						</div>

					</div>
				);
			return projectGroupView;
		});
		return projectsByGroup;
	}

	let createProjectView = (project) => {
		console.log('Project Details:', project);

		var users = project.projectUsers;
		let totalTasks = project.totalTasks;
		var taskCompleted = project.completedTasks;
		var taskInProgress = project.inProgressTasks;
		var activeTasks = project.activeTasks;
		// var cat = Object.assign([], props.categories);
		var proStatus = project.status ? project.status : '';


		let favoriteCheck = props.favoriteProject.filter((f) => {
			return project._id === f._id
		});
		let accessRights = Auth.get('access');

		let userId = Auth.get('userId');

		if (userRole === 'admin') {
			userRole = 'admin';
		} else if (project.userid === userId) {
			userRole = 'owner';
		} else {
			userRole = 'user';
		}

		let editProject = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Projects', 'Edit');
		let deleteProject = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Projects', 'Delete');
		let showClone = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Projects', 'Clone');
		let auditReportShow = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Audit Report', 'View');
		let favouritesShow = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Favorite Projects', 'View');
		let showArchieve = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Projects', 'Archive');
		// deleteProject = true;// showClone = true;// auditReportShow = true// } else {
		if (accessRights !== null && accessRights !== undefined && accessRights.length > 0 && userRole === 'user') {
			deleteProject = validate.validateEntitlements(accessRights, project._id, 'Projects', 'delete');
			auditReportShow = validate.validateEntitlements(accessRights, project._id, 'Audit Report', 'view');
			showClone = validate.validateEntitlements(accessRights, project._id, 'Projects', 'clone');
			showArchieve = validate.validateEntitlements(accessRights, project._id, 'Projects', 'archive');
		}
		let favorite = (favoriteCheck.length > 0) ? true : false
		var dateToday = new Date();
		var projectEnddate = new Date(project.enddate);
		var utc1 = Date.UTC(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate());
		var utc2 = Date.UTC(projectEnddate.getFullYear(), projectEnddate.getMonth(), projectEnddate.getDate())
		var diffDays = parseInt((utc2 - utc1) / (1000 * 60 * 60 * 24), 10);
		var percentageProject = project.totalTasks !== 0 ? ((taskCompleted / project.totalTasks) * 100).toString().match(/^-?\d+(?:\.\d{0,2})?/) : 0;
		let status = project.status;
		let attachments = project.attachments;
		let formattedProjectTitle = (project.title && project.title.length > 70) ?
			project.title.substring(0, 70) + '..'
			:
			project.title;

		return (
			<li className={groupBy === "nogroup" || groupBy === "startDate" ? "project-nogroup" : "project"} key={project._id}  >
				<div className='project-border' draggable={groupBy === "status" && userRole !== "user" ? "true" : ""}
					onDragOver={(e) => { e.preventDefault() }}
					onDragStart={props.onDragStart.bind(this, project._id)}
					onDrop={props.onDrop.bind(this, project._id, status)}>

					<div className="project-body" style={{ position: "relative" }}>
						<div className="project-menu-box" onClick={() => { onMenuIconClick(project._id) }}  >
							<i className="fas fa-bars mt-2"></i>

							{/* {showProjectMenuIcons ?   */}
							<div id={project._id} className="project-icon-container  proj-icons-wrapper  justify-content-between hide-project-menu ">


								{showArchieve ? project.archive === false ? <a className="d-flex" title="Archive Project"
									onClick={props.onArchiveProjectById.bind(this, project._id, "archive")
									}>
									<img src="/images/archive.PNG" alt="Archive" className="task-icons" />
								</a> : <a className="d-flex" title="Unarchive Project"
									onClick={props.onArchiveProjectById.bind(this, project._id, "unarchive")
									}>
										<img src="/images/unarchive.PNG" alt="Archive" className="task-icons" />
									</a> : ""}


								{showClone ? <a className="d-flex" title="Clone project"
									onClick={props.onCloneProject.bind(this, project._id)
									}>
									<img src="/images/copy.PNG" alt="Clone" className="task-icons" />
								</a> : ""}

								{auditReportShow ? <Link to={'/auditReport/' + project._id} title="Audit Report"
									className="d-flex">
									<img src="/images/report.PNG" alt="Audit Report" className="task-icons" />
								</Link> : ""}

								{favouritesShow ?

									favorite === true ?
										<a className="d-flex" title="Favorite project" onClick={
											props.onClickRemoveFavoriteProject.bind(this, project._id)
										} >
											<i className="fas fa-star text-warning"></i>
										</a>
										:
										<a className="d-flex" title="Favorite project" onClick={
											props.onClickAddFavoriteProject.bind(this, project._id)
										}>
											<i className="far fa-star" style={{ fontSize: '19x' }}></i>
										</a> : ""
								}

								{deleteProject ? <a className="d-flex" title="Delete project" onClick={() => {
									if (window.confirm('Are you sure you wish to delete this project?'))
										props.onDeleteProjectById(project._id)
								}}>
									<img src="/images/trash.PNG" alt="Delete Project" className="task-icons" />
								</a> : ""}

								{attachments > 0 ?



									<a className="d-flex" title="Attachments" >
										{/* <i className="fas fa-paperclip"></i> */}
										<img src="/images/paperclip.PNG" alt="Audit Report" className="task-icons" />

									</a>
									: ""}

								{editProject ? <Link to={'/project/edit/' + project._id} className="d-flex" title="Edit project" >
									{/* <i className="fas fa-pencil-alt"></i> */}
									<img src="/images/pencil.PNG" alt="Edit" className="task-icons" />
								</Link> : ""}

							</div>
						</div>
						<div className="image-wrapper d-flex ">
							<div className="d-flex flex-column left mt-3">
								<div className="d-flex flex-column align-content-start pr-2">
									{activeTasks > 0 ? <span className="project-active" title="active"></span> : ""}

									{
										props.userId ?
											<Link to={'/project/user/tasks/' + props.userId + '/' + project._id} className="project-title">{formattedProjectTitle} </Link>
											:
											<Link to={'/project/tasks/' + project._id} className="project-title">{formattedProjectTitle}</Link>
									}

									<div className="proj-desc show__overflow_dots">{project.description}</div>
								</div>


								<div className="mt-auto">

									<Link to={'/projectUsers/' + project._id} className="userlinks ">
										<span className="assignees" title="users">
											<span className="user-no">{users.length}  </span>
											{users.length > 0 &&
												users.length > 1 ?

												<i className="fas fa-users " style={{ color: "#CDDC39" }}></i>
												:

												<i className="fas fa-user " style={{ color: "#CDDC39" }}></i>
											}
										</span>
									</Link>
								</div>

							</div>

						</div>

						<div className="progress mt-3 mb-2">
							<div className="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="50"
								aria-valuemin="0" aria-valuemax="100" style={{ width: `${percentageProject}%` }}>
								{percentageProject}% Complete
							</div>
						</div>
						<div className=" d-flex justify-content-around bottom-box">
							<div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes" title="Total Tasks">
								<span className="valueno">{totalTasks} </span>
								<span className="fas fa-tasks"></span>
							</div>

							<div className="d-flex flex-column  align-self-left align-items-center bottom-box-boxes" title="Task Completed">
								<span className="valueno">{taskCompleted} </span>
								<span className="far fa-check-circle text-success"></span>
							</div>

							<div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes" title="In Progress">
								<span className="valueno">{taskInProgress} </span>
								<span className="fas fa-spinner text-warning"></span>
							</div>

							{status === ON_HOLD ? (<div className="d-flex align-self-left align-items-center" title="Days left">
								{/* <span>On</span><span>Hold</span> */}
							</div>)
								: (proStatus !== "completed" && project.enddate !== '') ? <div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes" title="Days left">
									<span className="valueno">{diffDays} </span>
									<span className="far fa-clock text-danger"></span>
								</div> : ""}
							{project.archive === true ?
								<div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes" title="Total Tasks">
									<span className="valueno">Archived </span>
								</div> : ''}
						</div>

					</div>
				</div>
			</li>
		);
	}

	switch (groupBy) {
		case "nogroup":
			let projects = Object.assign([], projectsSummary);
			// let projectData = projects && projects.filter((p) => {
			// 	return p.status !== 'completed' && p.status !== 'onHold';
			// })
			projects.sort((a, b) => (b.activeTasks - a.activeTasks));
			projectView = projects.map((project) => {
				return createProjectView(project)
			});
			break;

		case "status": projectView = groupByStatusAndGroup("status");
			break;

		case "group": projectView = groupByStatusAndGroup("group");
			break;

		case "startdate": projectView = groupByDate("startdate", "Starts");
			break;

		case "enddate": projectView = groupByDate("enddate", "Ends");
			break;

		case "calendarView": projectView = <ProjectsCalendarView projects={props.projectsSummary} />
			break;
		default: break;
	}

	return (
		<React.Fragment>
			{(groupBy === "nogroup" || groupBy === "startDate") ? (
				<ul className="project-List-scroll d-flex flex-wrap justify-content-start" >
					{projectView}
				</ul>)
				:
				<div className="row">
					{projectView}
				</div>
			}
		</React.Fragment>
	);
});

export default ProjectList;