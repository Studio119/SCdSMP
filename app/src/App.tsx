/*
 * @Author: Antoine YANG 
 * @Date: 2020-01-16 22:19:37 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2020-01-16 22:52:06
 */
import React, { Component } from 'react';
import './App.css';
// import { Map } from './Map';
import TaskQueue from './tools/TaskQueue';
import { CordDict, Proxy } from './TypeLib';
import { proxy } from './Proxy';

class App extends Component<{}, {}, {}> {
  public render(): JSX.Element {
    return (
      <div className="App">
        <TaskQueue<Proxy> ref="DataCenter" control={ proxy } />
        {/* <Map id="map" zoom={ 5 } center={[51.750882, -0.341271]} /> */}
      </div>
    );
  }

  public componentDidMount(): void {
    (this.refs["DataCenter"] as TaskQueue).open("./data/output_area_location.json", (data: CordDict) => {
      proxy.getCordinateByCode = (code: string) => data[code] ? data[code][0] : [0, 0];
    });
  }
}

export default App;
