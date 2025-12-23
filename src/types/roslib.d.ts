declare module 'roslib' {
  import { EventEmitter } from 'events'

  namespace ROSLIB {
    interface RosOptions {
      encoding?: string
      [key: string]: unknown
    }

    class Ros extends EventEmitter {
      socket: any
      
      constructor(options?: RosOptions)
      
      connect(url: string): void
      
      on(event: 'connection', listener: () => void): this
      on(event: 'close', listener: () => void): this
      on(event: 'error', listener: (error: any) => void): this
      on(event: string, listener: (...args: any[]) => void): this
      
      emit(event: 'connection'): boolean
      emit(event: 'close'): boolean
      emit(event: 'error', error?: any): boolean
      emit(event: string, ...args: any[]): boolean
    }
  }

  export default ROSLIB
}
