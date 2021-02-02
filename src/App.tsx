import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

import Messages from "./components/Messages/Messages";
import { ApolloProvider } from '@apollo/client';
import client from './services/ApiClient';

class App extends React.Component<{}, {}> {
  constructor(props: any) {
    super(props);

    this.state = {

    };
  }
  render() {
    return (
      <ApolloProvider client={client}>
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
      </ApolloProvider>
    );
  }
}

export default App;
