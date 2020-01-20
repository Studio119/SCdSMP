/*
 * @Author: Antoine YANG 
 * @Date: 2020-01-16 22:19:37 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2020-01-20 22:05:03
 */
import React, { Component } from 'react';
import './App.css';
import { Map } from './Map';
import TaskQueue from './tools/TaskQueue';
import { CordDict, Proxy } from './TypeLib';
import { proxy } from './Proxy';
import { Matrix } from './math/Matrix';

class App extends Component<{}, {}, {}> {
  public render(): JSX.Element {
    return (
      <div className="App">
        <TaskQueue<Proxy> ref="DataCenter" control={ proxy } />
        <Map ref="map" id="map" minZoom={ 1 } zoom={ 4.7 } center={[-2.31, 53.56]} width={ 400 } height={ 400 } />
      </div>
    );
  }

  public componentDidMount(): void {
    (this.refs["DataCenter"] as TaskQueue).open("./data/output_area_location.json", (data: CordDict) => {
      proxy.getCordinateByCode = (code: string) => data[code] ? data[code][0] : [0, 0];
      (window as any)["load"] = (list: Array<string>) => {
        (this.refs["map"] as Map).setState({
          data: list.map((code: string) => {
            return {
              lng: proxy.getCordinateByCode(code)[0],
              lat: proxy.getCordinateByCode(code)[1],
              value: null
            };
          })
        });
      };
      // console.log(Object.keys(data).slice(0, 5));
      (this.refs["DataCenter"] as TaskQueue).open("./data/bulk.csv", (data: Array<{"\"geography code\"": string}>) => {
        // const addrs = data.map((item: {"\"geography code\"": string}) => {
        //   return item["\"geography code\""].substring(1, 9);
        // });
        // let count: number = 0;
        // addrs.forEach((item: string) => {
        //   if (proxy.getCordinateByCode(item)[0] !== 0) {
        //     count++;
        //   }
        // });
        // console.log(count, addrs.length);
        // console.log(data.slice(0, 5).map((item: {"\"geography code\"": string}) => {
        //   return item["\"geography code\""].substring(1, 9);
        // }));
      });
    });
    (window as any)["m"] = new Matrix(5, 5);
    ((window as any)["m"] as Matrix).load([
      [2, 4, 2, 6, 3],
      [1, 7, 4, 9, 7],
      [2, 8, 4, 2 ,0],
      [3, 6, 2, 3 ,1],
      [8, 3, 2, 2, 6]
    ]);
  }
}

export default App;
