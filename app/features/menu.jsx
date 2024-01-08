/* global location */
/* eslint no-restricted-globals: ["off", "location"]*/

import React from "react";
import { Link } from "react-router-dom";
import Auth from "../utils/auth";
import "../app.css";
import "../../features/tasks/task.css";
import * as validateAppLevelAccessRights from "../common/validate-entitlements";
export default class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.toggleHide = this.toggleHide.bind(this);
    this.toggle_report_menu = this.toggle_report_menu.bind(this);

    this.toggle_admin_menu = this.toggle_admin_menu.bind(this);
    this.toggle_more_menu = this.toggle_more_menu.bind(this);

    // this.toggleHideAdminMenu = this.toggleHideAdminMenu.bind(this);
  }

  state = {
    menu: [
      { 
      title: "Dashboard", 
      code: "Dashboard",
      url: "/", active: 
      true, role: "", 
      display: true 
      },
      {
        title: "Projects",
        code: "Projects",
        url: "/projects",
        location: "dashboard",
        active: false,
        role: "",
        display: true
      },
      {
        title: "Reports",
        code: "Task Report",
        url: "/reports",
        active: false,
        role: "admin,owner,support",
        display: true,
        submenu: [
          {
            title: "Task Report",
            code: "Task Report",
            url: "/taskReports",
            active: false,
            role: "admin,owner,support",
            display: true
          },
          {
            title: "User Report",
            url: "/userReports",
            active: false,
            role: "admin,owner,support",
            display: true
          },
          {
            title: "Active User Report",
            url: "/activeUsers",
            active: false,
            role: "admin,owner,support",
            display: true
          },
          {
            title: "StoryPoint Statistics",
            url: "/userTaskReports",
            active: false,
            role: "admin,owner,support",
            display: true
          },
          {
            title: "Incompelete task Reports",
            url: "/incompeleteTaskReports",
            active: false,
            role: "admin,owner,support",
            display: true
          },
          {
            title: "Project Progress Reports",
            url: "/projectProgressReports",
            active: false,
            role: "admin,owner,support",
            display: true
          },
          {
            title: "User Performance Reports",
            url: "/userPerformanceReports",
            active: false,
            role: "admin,owner,support",
            display: true
          }
        ]
      },
      {
        title: "Leave Application",
        code: "Leave Application",
        url: "/leave",
        active: false,
        role: "",
        display: true
      },
      {
        title: "Access Rights",
        code: "Access Rights",
        url: "/applevelaccessright",
        active: false,
        role: "admin,owner",
        display: true
      },
      {
        title: "Document Repository",
        code: "Global Document Repository",
        url: "/globalrepository",
        active: false,
        role: "",
        display: true
      },
      { 
        title: "Chat", 
        code: "Chat",
        url: "/chat", 
        active: false, 
        role: "", 
        display: true
      },
      {
        title: "Company Setup",
        code: "Company",
        url: "/company",
        active: false,
        role: "admin,owner,support",
        display: true
      },
      {
        title: "Member Setup",
        code: "Users",
        url: "/users",
        active: false,
        role: "admin,owner,support",
        display: true
      },
      {
        title: "Member Groups",
        code: "User Groups",
        url: "/groups",
        active: false,
        role: "admin,owner,support",
        display: true
      },
      {
        title: "Categories",
        code: "Category",
        url: "/category",
        active: false,
        role: "admin,support",
        display: true
      },
      {
        title: "Broadcast",
        code: "Notification",
        url: "/notification/000",
        active: false,
        role: "admin,support",
        display: true
      },
      {
        title: "Admin",
        code: "",
        url: "/admin",
        active: false,
        role: "admin,owner,support",
        display: true,
        submenu: [ 
        ]
      },
      {
        title: "More",
        code: "",
        url: "/more",
        active: false,
        role: "admin,owner,support,user",
        display: true,
        submenu: [
          
        ]
      },  
    ],
    rFlag: false,
    aFlag: false,
    mFlag: false,
    appLevelAccess: [],
    menuList: []
  }; // { title: "Favorite Projects", url: "/favoriteProjects", active: false, role: "", display: true }, // { title:"Discussion Board", url: "/discussionBoard", active: false, role:"",display:true }, //Leave Application

  toggleHide() {
    this.setState({
      rFlag: false,
      aFlag: false,
      mFlag: false
    });
  }

  toggle_report_menu(e) {
    e.preventDefault();
    if (this.state.aFlag === true) {
      this.setState({
        rFlag: !this.state.rFlag,
        aFlag: false
      });
    } else if (this.state.mFlag === true) {
      this.setState({
        rFlag: !this.state.rFlag,
        mFlag: false
      });
    } else {
      this.setState({ rFlag: !this.state.rFlag });
    }
  }

  toggle_admin_menu(e) {
    e.preventDefault();
    if (this.state.rFlag === true) {
      this.setState({
        aFlag: !this.state.aFlag,
        rFlag: false
      });
    } else if (this.state.mFlag === true) {
      this.setState({
        aFlag: !this.state.aFlag,
        mFlag: false
      });
    } else {
      this.setState({ aFlag: !this.state.aFlag });
    }
  }

  toggle_more_menu(e) {
    e.preventDefault();
    if (this.state.rFlag === true) {
      this.setState({
        mFlag: !this.state.mFlag,
        rFlag: false
      });
    } else if (this.state.aFlag === true) {
      this.setState({
		  aFlag: false,
        mFlag: !this.state.mFlag
      });
    } else {
      this.setState({ mFlag: !this.state.mFlag });
    }
  }

  async componentDidMount() {    
    let userId = Auth.get("userId");
    let appLevelAccess = await validateAppLevelAccessRights.validateAppLevelAccessRight(
      userId
    );
    this.setState({
      appLevelAccess: appLevelAccess
    });
  }

  render() {

    const elements = this.state.menu;
    const accessmenu=this.state.appLevelAccess;
    if (this.state.appLevelAccess.length<=0)
    {
      return(null);
    }
     const items = []
     const adminitems = []

     for (var i=0; i < elements.length; i++) {
            
            for (var j=0; j < accessmenu.length; j++)
             {
               let code=elements[i]["code"];
               let groupp=accessmenu[j];
               if(code==groupp)
               {
                  switch(groupp)
                  {
                    case "Dashboard":
                        items.push(<li key={i+j}>
                        <Link to={'/'}>
                          <i className="fa fa-tachometer-alt" style={{fontSize:"10px"}}></i>Dashboard
                        </Link>
                        </li>)  
                        break;
                    case "Projects":
                        items.push(<li  key={i+j}>
                          <Link to={'/projects'}>
                            <i className="fas fa-project-diagram" style={{fontSize:"10px"}}></i>Projects
                          </Link>
                          </li>)
                        break;
                    case "Task Report":
                        items.push(<li  key={i+j}>
                            <Link to={'/taskReports'}>
                              <i className="far fa-file-alt" style={{fontSize:"14px"}}></i>Reports
                            </Link>
                          </li>)
                        break;
                    case "Leave Application":
                        items.push(<li  key={i+j}>
                            <Link to={'/leave'}>
                            <i className="fab fa-wpforms"></i>Leave Application
                            </Link>
                          </li>)
                        break;
                    case "Access Rights":
                          items.push(<li  key={i+j}>
                              <Link to={'/applevelaccessright'}>
                                <i className="fas fa-key"></i>Access Rights
                              </Link>
                            </li>)
                        break;
                    case "Global Document Repository":
                        items.push(<li  key={i+j}>
                            <Link to={'/globalrepository'}>
                              <i className="fas fa-globe"></i>Document Repository
                            </Link>
                          </li>)
                        break;    
                    case "Chat":
                        items.push(<li  key={i+j}>
                          <Link to={'/chat'}>
                            <i className="fa fa-comment"></i>Chat
                          </Link>
                          </li>)
                        break;  
                        
                    //Admin items     
                    case "Company":
                        adminitems.push(<li  key={i+j}>
                            <Link to={'/company'}>
                            <i className="far fa-building" style={{fontSize:"15px"}}></i>Company Setup
                            </Link>
                          </li>) 
                        break;
                    case "Users":
                        adminitems.push(<li  key={i+j}>
                            <Link to={'/users'}>
                              <i className="fas fa-users"></i>Member Setup
                            </Link>
                          </li>)
                        break;
                    case "User Groups":
                        adminitems.push(<li  key={i+j}>
                          <Link to={'/groups'}>
                            <i className="fas fa-users"></i>Member Groups
                            </Link>
                        </li>) 
                        break;
                    case "Category":
                        adminitems.push(<li  key={i+j}>
                          <Link to={'/category'}>
                            <i className="fa fa-tags"></i>Categories
                            </Link>
                        </li>)
                        break;
                    case "Notification":
                        adminitems.push(<li key={i+j}>
                          <Link to={'/notification/000'}>
                            <i className="fa fa-star"></i>Broadcast
                            </Link>
                        </li>)
                        break;
                  } 
              }
             }
            
         }

        

    return (
      
      <nav id="side-navbar" className="side-navbar  _mCS_1"><div id="mCSB_1" className="mCustomScrollBox mCS-light mCSB_vertical mCSB_inside">
      <div id="mCSB_1_container" className="mCSB_container" >
        <div className="side-navbar-wrapper">
            <div className="sidenav-header d-flex align-items-center justify-content-center">
                <div className="sidenav-header-inner text-center">
                    <img src="/images/proPeakNewLogo.svg" alt="logo" className="main-logo" /> 
                </div>
               <div className="sidenav-header-logo"><a href="dashboard.html" className="brand-small text-center"> <strong className="text-info">P</strong><strong className="text-warning">P</strong></a></div>
            </div>
            <div className="main-menu">   
              <h5 className="sidenav-heading">Main Menu</h5>
                <ul id="side-main-menu" className="side-menu list-unstyled">
                  {items}
                </ul>
            </div>

              {Auth.get("userRole")!=="user"?
                <div className="main-menu mt-2">
                  <h5 className="sidenav-heading">Admin Menu</h5>
                  <ul id="side-main-menu" className="side-menu list-unstyled">
                  {adminitems}  
                  </ul>
                </div>
              :""}

       </div>
      </div>
        <div id="mCSB_1_scrollbar_vertical" className="mCSB_scrollTools mCSB_1_scrollbar mCS-light mCSB_scrollTools_vertical" ><div className="mCSB_draggerContainer"><div id="mCSB_1_dragger_vertical" className="mCSB_dragger" ><div className="mCSB_dragger_bar" ></div></div><div className="mCSB_draggerRail"></div></div></div></div></nav>

    );
  }
}


