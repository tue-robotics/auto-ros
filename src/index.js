import { hostname } from 'os'
import { EventEmitter2 } from 'eventemitter2'
import ROSLIB from 'roslib'

// Private variables
const host = hostname() || 'localhost'
const defaultUrl = `ws://${host}:9090`

// reconnect timeout in ms
const RECONNECT_TIMEOUT = 5000

class AutoRos extends EventEmitter2 {
  /**
   * Auto reconnecting wrapper of ROSLIB.Ros
   *
   * @param {Object} [options]
   * @param {number} [options.reconnectTimeOut=5000] - The reconnect timeout in ms.
   * @param {Object} [options.rosOptions] - Option object passed to the constructor of the ROSLIB.Ros object.
   */
  constructor (options) {
    super()

    options = options || {}
    this._reconnectTimeOut = options.reconnectTimeOut || RECONNECT_TIMEOUT

    var rosOptions = options.rosOptions || {}
    rosOptions.encoding = rosOptions.encoding || 'ascii'
    rosOptions.transportLibrary = rosOptions.transportLibrary || 'websocket'

    console.debug('Creating ROS with the options:', rosOptions)

    this.ros = new ROSLIB.Ros(rosOptions)

    this._status = 'closed'

    this.ros.on('connection', this.onConnection.bind(this))
    this.ros.on('close', this.onClose.bind(this))
    this.ros.on('error', this.onError.bind(this))
  }

  get status () {
    return this._status
  }

  set status (value) {
    this._status = value
    this.emit('status', value)
  }

  /**
   * Connect to rosbridge
   *
   * If an url is provided, it will connect to that one. Else it will
   * use the previous url. Uses a url based on the hostname if no urls
   * are provided.
   */
  connect (url) {
    this.url = url || this.url || defaultUrl

    console.log(`connecting to ${this.url}`)
    this.ros.connect(this.url)
    this.status = 'connecting'
  }

  // ros status event handling
  onConnection () {
    console.log('connection')
    this.status = 'connected'
  }

  onClose () {
    setTimeout(this.connect.bind(this), this._reconnectTimeOut)
    console.log('connection closed')
    this.status = 'closed'
  }

  onError () {
    // console.log('connection error')
    this.status = 'error'
  }
}

export default AutoRos
