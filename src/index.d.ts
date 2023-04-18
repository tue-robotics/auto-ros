import {EventEmitter2 } from 'eventemitter2'
import ROSLIB from 'roslib'

export class AutoRos extends EventEmitter2 {

	public ros: ROSLIB.Ros;

	/* Needs to contain 
	   * rosOptions
	   * reconnectTimeOut
	   * rosOptions.encoding
	  */
	constructor();
	constructor(options:{
		url?: string
	});
	connect(url:string):void;

}

export default AutoRos;

