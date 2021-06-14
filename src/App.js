import React from "react";
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import Header from "./Common/header";
import Footer from "./Common/footer";
import Login from "./Login/login";
import {Visualisation} from "./Visualisation/visualisation";
import {Interfaces} from "./Interfaces/interfaces";
import {isLoggedIn, isUserProfessor} from "./Utils/localStorageHandler";
import "./App.scss";
import "./Common/footer.scss"
import "./Common/input.scss"
import "./Common/header.scss"
import "./Common/button.scss"
import "./Common/dropdown.scss"
import "./Common/searchPanel.scss"
import "./Login/login.scss"
import "./Visualisation/visualisation.scss"
import "./Visualisation/trafficVisualisationCharts.scss"
import "./Interfaces/interfaces.scss"
import "./Interfaces/bubble.scss";



export default function App() {
    //TODO rename all files
  return (
      <Router>
          <div>
              <Header />
              <Switch>
                  <Route path="/login">
                      <Login />
                  </Route>
                  <PrivateRoute mustBeProfessor={true} redirect="/" path="/schnittstellen">
                      <Interfaces />
                  </PrivateRoute>
                  <PrivateRoute mustBeProfessor={false} redirect="/login" path="/*">
                      <Visualisation />
                      <Footer />
                  </PrivateRoute>
              </Switch>
          </div>
      </Router>
  );
}

function PrivateRoute({redirect, mustBeProfessor, children, ...rest }) {
    let isAuthorised = mustBeProfessor? isUserProfessor(): isLoggedIn();
  return (
      <Route
          {...rest}
          render={({ location }) =>
               isAuthorised ? (
                  children
              ) : (
                  <Redirect
                      to={{
                        pathname: redirect,
                        state: { from: location }
                      }}
                  />
              )
          }
      />
  );
}
