import { hostname } from 'os'
import EventEmitter2 from 'eventemitter2'
import { Ros, type ITransportFactory } from 'roslib'

// Re-export useful types from roslib
export type { ITransportFactory }

// Private variables
const host = hostname() || 'localhost'
const defaultUrl = `ws://${host}:9090`

// reconnect timeout in ms
const RECONNECT_TIMEOUT = 5000

/**
 * Options for configuring AutoRos
 */
export interface AutoRosOptions {
  /**
   * The reconnect timeout in milliseconds
   * @default 5000
   */
  reconnectTimeOut?: number
  
  /**
   * Options passed to the Ros constructor
   */
  rosOptions?: {
    /**
     * The factory to use to create a transport.
     * Defaults to a WebSocket transport factory.
     */
    transportFactory?: ITransportFactory
    [key: string]: unknown
  }
}

/**
 * Connection status type
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'closed' | 'error'

/**
 * Auto reconnecting wrapper of ROSLIB.Ros
 * 
 * This class extends EventEmitter2 and provides automatic reconnection
 * functionality for ROS connections through rosbridge.
 * 
 * @example
 * ```typescript
 * import AutoRos from 'auto-ros'
 * 
 * const autoRos = new AutoRos()
 * autoRos.connect('ws://localhost:9090')
 * 
 * autoRos.on('status', (status) => {
 *   console.log('Connection status:', status)
 * })
 * ```
 */
export class AutoRos extends EventEmitter2 {
  /**
   * The underlying Ros instance
   */
  public ros: Ros

  /**
   * Current connection URL
   */
  private url?: string

  /**
   * Current connection status
   */
  private _status: ConnectionStatus = 'closed'

  /**
   * Reconnect timeout in milliseconds
   */
  private readonly _reconnectTimeOut: number

  /**
   * Create a new AutoRos instance
   * 
   * @param options - Configuration options
   * @throws {Error} If 'url' is provided in rosOptions (use connect method instead)
   */
  constructor(options?: AutoRosOptions) {
    super()

    const opts = options ?? {}
    this._reconnectTimeOut = opts.reconnectTimeOut ?? RECONNECT_TIMEOUT

    const rosOptions = opts.rosOptions ?? {}

    if ('url' in rosOptions) {
      throw new Error('"url" option to ROS is not allowed. Connect by calling the connect function on this object with the "url" as argument')
    }

    console.debug('Creating ROS with the options:', rosOptions)

    this.ros = new Ros(rosOptions)

    this.ros.on('connection', this.onConnection.bind(this))
    this.ros.on('close', this.onClose.bind(this))
    this.ros.on('error', this.onError.bind(this))
  }

  /**
   * Get the current connection status
   */
  get status(): ConnectionStatus {
    return this._status
  }

  /**
   * Set the connection status and emit status event
   * 
   * @param value - New status value
   */
  set status(value: ConnectionStatus) {
    this._status = value
    this.emit('status', value)
  }

  /**
   * Connect to rosbridge
   * 
   * If a URL is provided, it will connect to that one. Otherwise, it will
   * use the previous URL. Uses a URL based on the hostname if no URLs
   * have been provided.
   * 
   * @param url - WebSocket URL to connect to (e.g., 'ws://localhost:9090')
   */
  connect(url?: string): void {
    this.url = url ?? this.url ?? defaultUrl

    console.log(`connecting to ${this.url}`)
    this.status = 'connecting'
    
    // Handle the promise but don't change the method signature for backward compatibility
    this.ros.connect(this.url).catch((error) => {
      console.error('Connection error:', error)
      // The error event will be emitted by Ros, so we don't need to do anything else here
    })
  }

  /**
   * Event callback on 'connection'
   * 
   * @private
   */
  private onConnection(): void {
    console.log('connection')
    this.status = 'connected'
  }

  /**
   * Event callback on 'close'
   * 
   * @private
   */
  private onClose(): void {
    setTimeout(this.connect.bind(this), this._reconnectTimeOut)
    console.log('connection closed')
    this.status = 'closed'
  }

  /**
   * Event callback on 'error'
   * 
   * @private
   */
  private onError(): void {
    // console.log('connection error')
    this.status = 'error'
  }
}
