/**
 *
 * PrivateRoute
 * Higher Order Component that blocks navigation when the user is not logged in
 * and redirect the user to login page
 *
 * Wrap your protected routes to secure your container
 */

import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import Auth from '../../utils/auth';

// const PrivateRoute = ({ component: Component, ...rest }) => {
//   let isLogin=Auth.getToken() !== null?true:false;
//   console.log("PrivateRoute");
//   let route=(rest.render && isLogin)? (<Route {...rest} /> )
//     :(<Route
//     {...rest}
//     render={props =>
//       Auth.getToken() !== null ? (
//         <Component {...props} />
//       ) : (
//         <Redirect
//           to={{
//             pathname: '/login',
//             state: { from: props.location },
//           }}
//         />
//       )
//     }
//   />)
//   return route;
//   }
const PrivateRoute = ({ component: Component, ...rest }) => {
  let isLogin=Auth.getToken() !== null?true:false;
  //console.log("PrivateRoute isLogin=",isLogin);
  let route=(rest.render && isLogin)? (<Route {...rest} /> )
    :(isLogin? (
        <Component {...rest} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: rest.location.pathname },
          }}
        />
      )
  )
  return route;
  }
export default PrivateRoute;
