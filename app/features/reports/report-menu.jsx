import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../utils/auth';
import '../../app.css';

export default class ReportMenu extends Component {
   
    state = {
        reportMenu: [
            {
              title: "Task Report",
              displayName:"Task Report",
              url: "/taskReports",
              active: false,
              role: "admin,owner,support",
              display: true
            },
            {
              title: "User Report",
              displayName:"Member Report",
              url: "/userReports",
              active: false,
              role: "admin,owner,support",
              display: true
            },
            {
              title: "Active User Report",
              displayName:"Active Member Report",         
              url: "/activeUsers",
              active: false,
              role: "admin,owner,support",
              display: true
            },
            {
              title: "StoryPoint Statistics",
              displayName:"StoryPoint Statistics",            
              url: "/userTaskReports",
              active: false,
              role: "admin,owner,support",
              display: true
            },
            {
              title: "Incompelete task Reports",
              displayName:"Incomplete Task Report",
              url: "/incompeleteTaskReports",
              active: false,
              role: "admin,owner,support",
              display: true
            },
            {
              title: "Project Progress Reports",
               displayName:"Project progress Report",
              url: "/projectProgressReports",
              active: false,
              role: "admin,owner,support",
              display: true
            },
            {
              title: "User Performance Reports",
              displayName:"Member Performance Report",
              url: "/userPerformanceReports",
              active: false,
              role: "admin,owner,support",
              display: true
            }
          ],
	};


    render() {
        var links = this.state.reportMenu.map((m) => {
		
            let loc=window.location.pathname;
            
			let isActive=false;
		
            if(m.url!=="/" && loc.indexOf(m.url)>-1){
				isActive=true;
			}
		
			m.active=isActive;
			var activeClass = m.active ? "active" : "";
			
			return (
				<li key={m.title}>
					<Link to={m.url} className={`nav-item nav-link ${activeClass} `}>{m.displayName} </Link>
				</li>
			);
		})

      return <React.Fragment>
        <div className="row">
        <div className="col-sm-12">
          
				<div className="nav nav-tabs nav-fill ">
					{links}
          </div>
          
        </div>
      </div>
      
      </React.Fragment>;
    }
}
