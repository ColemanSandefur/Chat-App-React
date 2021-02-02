import React, { createContext } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

import Messages from "./components/Messages/Messages";
import { ApolloProvider } from '@apollo/client';
import client from './services/ApiClient';
import Cookies from "universal-cookie";
import {socket} from "./services/SocketIO";


export const AuthData = createContext<{authCookie?: string}>({});

class App extends React.Component<{}, {cookie: string}> {
  constructor(props: any) {
    super(props);
    let cookies = new Cookies();
    
    this.state = {
      cookie: cookies.get("authCookie") + ""
    };
  }

  componentDidMount() {
    let cookies = new Cookies();

    socket.on("Send-Auth-Cookie", (cookie: string) => {
      cookies.set("authCookie", cookie);
      this.setState({cookie: cookie});
    });
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <AuthData.Provider value={{authCookie: this.state.cookie}}>
          <div className="App">
            <div className="App-header">
              <Router>
                <Switch>
                  <Route path="/messages" render={() => <Messages />}></Route>
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
