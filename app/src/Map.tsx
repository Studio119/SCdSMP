/*
 * @Author: Antoine YANG 
 * @Date: 2019-09-23 18:41:23 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2020-01-16 22:39:10
 */
import React from 'react';
import $ from 'jquery';
import MapBox from './react-mapbox/MapBox';
import Color from './preference/Color';
import Dragable from './prototypes/Dragable';


export interface MapViewProps {
    id: string;
    center: [number, number];
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    options?: any;  //L.MapOptions;
}

export interface MapViewState {
    data: Array<{
        id: string;
        lng: number;
        lat: number;
        words: string;
        day: string;
        city: string;
        sentiment: string;
        class: number;
    }>;
    sampled: Array<number>;
}

export class Map extends Dragable<MapViewProps, MapViewState, {}> {
    private originBounds: Readonly<[[number, number], [number, number]]>
        = [[ 50.55349948549696, 22.86881607932105 ], [ -128.14621384226703, -67.85378615773539 ]];
    private bounds: [[number, number], [number, number]]
        = [[ 50.55349948549696, 22.86881607932105 ], [ -128.14621384226703, -67.85378615773539 ]];
    private mounted: boolean;
    private canvas: null | HTMLCanvasElement;
    private lastStyle: string;
    private ctx: null | CanvasRenderingContext2D;
    private timers: Array<NodeJS.Timeout>;

    public constructor(props: MapViewProps) {
        super(props);
        this.mounted = false;
        this.state = { data: [], sampled: [] };
        this.canvas = null;
        this.ctx = null;
        this.lastStyle = '#FF0000';
        this.timers = [];
    }

    public render(): JSX.Element {
        return (
            <div id={ this.props.id }
            style={{
                position: 'absolute',
                left: '294px',
                top: '59px',
                height: '531px',
                width: '863.6px',
                background: 'white',
                border: '1px solid rgb(149,188,239)',
                fontSize: '12.4px',
                overflow: 'hidden'
            }} >
                <div
                style={{
                    height: '24px',
                    width: '848px',
                    borderBottom: '1px solid rgb(149,188,239)',
                    background: Color.linearGradient([
                        Color.setLightness(Color.Nippon.Berimidori, 0.56),
                        0,
                        Color.setLightness(Color.Nippon.Berimidori, 0.47),
                        0.15,
                        Color.setLightness(Color.Nippon.Berimidori, 0.65),
                        1
                    ], 'right'),
                    color: 'white',
                    textAlign: 'left',
                    paddingLeft: '16px',
                    letterSpacing: '2px',
                    fontSize: 'larger'
                }} >
                    Map View
                </div>
                <div
                id={ this.props.id + ">>" }
                style={{
                    height: '506.6px',
                    width: '865px'
                }} >
                    {
                        this.mounted
                            ? <MapBox
                                accessToken={ "pk.eyJ1IjoiaWNoZW4tYW50b2luZSIsImEiOiJjazF5bDh5eWUwZ2tiM2NsaXQ3bnFvNGJ1In0.sFDwirFIqR4UEjFQoKB8uA" }
                                styleURL={"mapbox://styles/ichen-antoine/ck1504bas09eu1cs1op2eqsnu"}
                                containerID={ this.props.id + ">>" } center={ this.props.center } zoom={ this.props.zoom }
                                minZoom={ this.props.minZoom } maxZoom={ this.props.maxZoom } ref="map"
                                onDragEnd={ this.onDragEnd.bind(this) }
                                onZoomEnd={ this.onZoomEnd.bind(this) } />
                            : null
                    }
                </div>
                <div id="scatter"
                style={{
                    display: 'unset'
                }} >
                    {/* 这个画布用于展现全部的点 */}
                    <canvas key="1" id="map_layer_canvas" ref="canvas" width="867px" height="508.64px" style={{
                        position: 'relative',
                        top: '-506px',
                        pointerEvents: 'none'
                    }} />
                </div>
            </div>
        )
    }

    public dragableComponentDidMount(): void {
        this.mounted = true;
        this.canvas = document.getElementById("map_layer_canvas") as HTMLCanvasElement;
        this.ctx = this.canvas!.getContext("2d");
        this.ctx!.globalAlpha = 0.8;
    }

    public componentDidUpdate(): void {
        if (this.state.sampled.length === 0) {
            this.redraw();
            $("#map_layer_canvas").css('opacity', 1);
        }
    }

    private redraw(): void {
        this.ctx!.clearRect(-2, -2, 869, 510.64);
        this.timers.forEach((timer: NodeJS.Timeout) => {
            clearTimeout(timer);
        });
        this.timers = [];
        let ready: Array<Array<[number, number, string]>> = [];
        for (let i: number = 0; i < 100; i++) {
            ready.push([]);
        }
        this.state.data.forEach((d: {
            id: string, lng: number, lat: number, words: string,
        day: string, city: string, sentiment: string}, index: number) => {
            if (d.lat >= 0 || d.lat < 0 || d.lng >= 0 || d.lng < 0) {
                ready[index % 100].push([d.lng, d.lat, parseFloat(d.sentiment) < 0
                                                    ? Color.Nippon.Syozyohi
                                                    : parseFloat(d.sentiment) > 0
                                                        ? Color.Nippon.Ruri // Tokiwa
                                                        : Color.Nippon.Ukonn]);
            }
        });
        ready.forEach((list: Array<[number, number, string]>, index: number) => {
            this.timers.push(
                setTimeout(() => {
                    list.forEach((d: [number, number, string]) => {
                        this.addPoint(d[0], d[1], d[2]);
                    });
                }, index * 10)
            );
        });
    }

    private onDragEnd(bounds: [[number, number], [number, number]]): void {
        this.bounds = bounds;
        $(this.refs['svg']).html("");
        this.redraw();
    }

    private onZoomEnd(bounds: [[number, number], [number, number]]): void {
        this.bounds = bounds;
        $(this.refs['svg']).html("");
        this.redraw();
    }

    private fx(d: number): number {
        return (d - this.bounds[1][0]) / (this.bounds[1][1] - this.bounds[1][0]) * (867 - 2);
    }

    private fy(d: number): number {
        d = (d - this.bounds[0][0]) / (this.bounds[0][1] - this.bounds[0][0])
            * (this.originBounds[0][1] - this.originBounds[0][0]) + this.originBounds[0][0]
            + 2 * (1 - (this.bounds[0][1] - this.bounds[0][0]) / (this.originBounds[0][1] - this.originBounds[0][0]));
        return 508.6 * (d * d * (-0.00025304519602050573) - d * 0.01760550015218513 + 1.5344062688366468);
    }

    private addPoint(x: number, y: number, style: string): void {
        if (style !== this.lastStyle) {
            this.ctx!.fillStyle = style;
            this.lastStyle = style;
        }
        x = this.fx(x) - 1;
        y = this.fy(y) - 1;
        this.ctx!.fillRect(x, y, 2, 2);
    }
}
