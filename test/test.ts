import * as chai from 'chai'
import sinonChai from 'sinon-chai'
import { stub, useFakeTimers, type SinonStub, type SinonFakeTimers } from 'sinon'
import AutoRos from '../src/index.js'

chai.use(sinonChai)
const should = chai.should()

const exampleUrl = 'ws://example.com:9090'

describe('AutoRos', () => {
  const options = {}
  let autoRos: AutoRos
  
  beforeEach('create a AutoRos', () => {
    autoRos = new AutoRos(options)
  })

  let connect: SinonStub
  
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
    let send: SinonStub
    
    beforeEach('Stub ros.socket.send', () => {
      // stub callOnConnection to prevent sending something on the websocket
      should.not.exist(null)
      should.not.exist(autoRos.ros.socket)

      send = stub()
      send.returns()
      autoRos.ros.socket = {
        send
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    })

    afterEach('Stub callOnConnection', () => {
      autoRos.ros.socket = null
    })

    let clock: SinonFakeTimers
    
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
    let customAutoRos: AutoRos
    
    beforeEach('Create AutoRos with custom timeout', () => {
      customAutoRos = new AutoRos({ reconnectTimeOut: 10000 })
    })

    let customConnect: SinonStub
    
    beforeEach('Stub connect', () => {
      customConnect = stub(customAutoRos.ros, 'connect')
      customConnect.returns()
    })

    afterEach('Restore connect', () => {
      customConnect.restore()
    })

    let clock: SinonFakeTimers
    
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
      customAutoRos.connect(exampleUrl)
      customConnect.should.have.been.calledOnce
      customConnect.should.have.been.calledWithExactly(exampleUrl)

      customAutoRos.ros.emit('close')
      customAutoRos.status.should.equal('closed')
      clock.tick(5100)

      customConnect.should.have.been.calledOnce
      customConnect.should.have.been.calledWithExactly(exampleUrl)

      clock.tick(5000)

      customConnect.should.have.been.calledTwice
      customConnect.should.always.have.been.calledWithExactly(exampleUrl)
    })
  })
})

describe('rosOptions.url is not allowed', () => {
  it('Constructor should throw', () => {
    const options = { rosOptions: { url: exampleUrl } }
    const badConstructor = function() {
      return new AutoRos(options)
    }
    badConstructor.should.throw(/url/)
  })
})
