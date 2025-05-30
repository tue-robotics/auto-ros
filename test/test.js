/* eslint no-unused-expressions: 0 */
import * as chai from 'chai'
import sinonChai from 'sinon-chai'
import { stub, useFakeTimers } from 'sinon'
import AutoRos from '../src/index.js';

chai.use(sinonChai)
const should = chai.should()

const exampleUrl = 'ws://example.com:9090'

describe('AutoRos', () => {
  let options = {}
  let autoRos
  beforeEach('create a AutoRos', () => {
    autoRos = new AutoRos(options)
  })

  let connect
  beforeEach('Stub connect', () => {
    connect = stub(autoRos.ros, 'connect')
    connect.returns()
  })

  afterEach('Restore connect', () => {
    connect.restore()
  })

  describe('AutoRos.connect', () => {
    /**
     * Tests
     */
    it('Should connect to a custom url', () => {
      connect.should.have.not.been.called
      autoRos.connect(exampleUrl)
      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithExactly(exampleUrl)
    })

    it('Should connect to a default url', () => {
      connect.should.have.not.been.called
      autoRos.connect()
      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithMatch(/ws:\/\/[a-zA-Z\d-.]+:9090/)
    })

    it('Should remember the previous url', () => {
      connect.should.have.not.been.called

      autoRos.connect(exampleUrl)
      connect.should.have.been.calledOnce

      autoRos.connect()
      connect.should.have.been.calledTwice
      connect.should.always.have.been.calledWithExactly(exampleUrl)
    })
  })

  describe('AutoRos.status', () => {
    /**
     * Stubs
     */
    let send
    beforeEach('Stub ros.socket.send', () => {
      // stub callOnConnection to prevent sending something on the websocket
      should.not.exist(null)
      should.not.exist(autoRos.ros.socket)

      send = stub()
      send.returns()
      autoRos.ros.socket = {
        send
      }
    })

    afterEach('Stub callOnConnection', () => {
      autoRos.ros.socket = null
    })

    let clock
    beforeEach('Stub setTimeout', () => {
      clock = useFakeTimers()
    })

    afterEach('Restore setTimeout', () => {
      clock.restore()
    })

    /**
     * Tests
     */
    it('Should have a default status', () => {
      autoRos.status.should.equal('closed')
    })

    it('Should respond to the ros::connection event', () => {
      autoRos.connect(exampleUrl)
      autoRos.status.should.equal('connecting')
      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithExactly(exampleUrl)

      autoRos.ros.emit('connection')
      autoRos.status.should.equal('connected')
    })

    it('Should reconnect after the ros::closed event', () => {
      autoRos.connect(exampleUrl)
      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithExactly(exampleUrl)

      autoRos.ros.emit('close')
      autoRos.status.should.equal('closed')
      clock.tick(100)

      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithExactly(exampleUrl)

      clock.tick(5000)

      connect.should.have.been.calledTwice
      connect.should.always.have.been.calledWithExactly(exampleUrl)
    })

    it('Should respond to the ros::error event', () => {
      autoRos.ros.emit('error')
      autoRos.status.should.equal('error')
    })
  })

  describe('Custom reconnectTimeOut', () => {
    /**
     * Stubs
     */
    let oldOptions
    before('Set reconnectTimeOut', () => {
      oldOptions = options
      options = {reconnectTimeOut: 10000}
    })

    after('restore options', () => {
      options = oldOptions
      options.should.equal(oldOptions)
    })

    let clock
    beforeEach('Stub setTimeout', () => {
      clock = useFakeTimers()
    })

    afterEach('Restore setTimeout', () => {
      clock.restore()
    })

    /**
     * Tests
     */
    it('Should reconnect after the ros::closed event', () => {
      autoRos.connect(exampleUrl)
      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithExactly(exampleUrl)

      autoRos.ros.emit('close')
      autoRos.status.should.equal('closed')
      clock.tick(5100)

      connect.should.have.been.calledOnce
      connect.should.have.been.calledWithExactly(exampleUrl)

      clock.tick(5000)

      connect.should.have.been.calledTwice
      connect.should.always.have.been.calledWithExactly(exampleUrl)
    })
  })
})

describe('rosOptions.url is not allowed', () => {

    it('Constructor should throw', () => {
      const options = {rosOptions: {url: exampleUrl}}
      var badConstructor = function() {
      return new AutoRos(options)
      }
      badConstructor.should.throw(/url/)
    })
  })
