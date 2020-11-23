import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import TimersContainer from './components/TimersContainer';


export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <div className="App">
        <TimersContainer />
      </div>
    </React.Fragment>
  );
}

