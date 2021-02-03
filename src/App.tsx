import React, { createContext } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom"

import Messages from "./components/Messages/Messages";
import { ApolloProvider } from '@apollo/client';
import client from './services/ApiClient';
import Cookies from "universal-cookie";
import {socket} from "./services/SocketIO";
import LoginPage from './components/Login/LoginPage';


export const AuthData = createContext<{authCookie?: string, loggedIn?: boolean}>({});

class App extends React.Component<{}, {authData:{authCookie: string, loggedIn?: boolean}}> {
  constructor(props: any) {
    super(props);
    let cookies = new Cookies();
    
    this.state = {
      authData: {
        authCookie: cookies.get("authCookie") + "",
      }
    };
  }

  componentDidMount() {
    let cookies = new Cookies();

    socket.on("Send-Auth-Cookie", (cookie: string, loggedIn: boolean) => {
      console.log(cookie, loggedIn);
      cookies.set("authCookie", cookie);
      this.setState({authData: {authCookie: cookie, loggedIn: loggedIn}});
    });
  }

  componentWillUnmount() {
    socket.off("Send-Auth-Cookie");
  }

  render() {
    let data;

    //Redirect to login if you are not logged in
    if (this.state.authData.loggedIn === false) {
      data = <Redirect to={"/login"} />
    }

    return (
      <ApolloProvider client={client}>
        <AuthData.Provider value={this.state.authData}>
          <div className="App">
            <div className="App-header">
              <Router>
                {data}
                <Switch>
                  <Route path="/messages" render={() => <Messages />}></Route>
                  <Route path="/login" render={() => <LoginPage />}></Route>
                  <Route path="/">Hello, World!</Route>
                </Switch>
              </Router>
            </div>
          </div>
        </AuthData.Provider>
      </ApolloProvider>
    );
  }
}

export default App;
