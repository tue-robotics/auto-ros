import {EventEmitter2 } from 'eventemitter2'
import ROSLIB from 'roslib'

export class AutoRos extends EventEmitter2 {

	public ros: ROSLIB.Ros;

	constructor(options?:{
		reconnectTimeOut?: number,
		rosOptions?: {
			encoding?: string,
		}
        });

	connect(url:string):void;

}

export default AutoRos;

