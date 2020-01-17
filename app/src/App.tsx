/*
 * @Author: Antoine YANG 
 * @Date: 2020-01-16 22:19:37 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2020-01-16 22:52:06
 */
import React, { Component } from 'react';
import './App.css';
import { Map } from './Map';
import TaskQueue from './tools/TaskQueue';
import { CordDict, Proxy } from './TypeLib';
import { proxy } from './Proxy';

class App extends Component<{}, {}, {}> {
  public render(): JSX.Element {
    return (
      <div className="App">
        <TaskQueue<Proxy> ref="DataCenter" control={ proxy } />
        <Map ref="map" id="map" minZoom={ 4.7 } zoom={ 4.7 } center={[-2.31, 53.56]} width={ 400 } height={ 400 } />
      </div>
    );
  }

  public componentDidMount(): void {
    (this.refs["DataCenter"] as TaskQueue).open("./data/output_area_location.json", (data: CordDict) => {
      proxy.getCordinateByCode = (code: string) => data[code] ? data[code][0] : [0, 0];
      (this.refs["map"] as Map).setState({
        data: Object.values(data).map((item: [[number, number]]) => {
          return {
            lng: item[0][1],
            lat: item[0][0],
            value: null
          };
        })
      });
      (this.refs["DataCenter"] as TaskQueue).open("./data/ONSPD_NOV_2019_UK.csv", (data: any) => {
        console.log(data);
      });
    });
  }
}

export default App;
