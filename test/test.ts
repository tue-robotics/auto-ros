import * as chai from 'chai'
import sinonChai from 'sinon-chai'
import { stub, useFakeTimers, type SinonStub, type SinonFakeTimers } from 'sinon'
import { AutoRos } from '../src/index.js'
import { expect } from 'chai'

chai.use(sinonChai)

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
    connect.resolves()
  })

  afterEach('Restore connect', () => {
    connect.restore()
  })

  describe('AutoRos.connect', () => {
    /**
     * Tests
     */
    it('Should connect to a custom url', () => {
      expect(connect).to.not.have.been.called
      autoRos.connect(exampleUrl)
      expect(connect).to.have.been.calledOnce
      expect(connect).to.have.been.calledWithExactly(exampleUrl)
    })

    it('Should connect to a default url', () => {
      expect(connect).to.not.have.been.called
      autoRos.connect()
      expect(connect).to.have.been.calledOnce
      expect(connect).to.have.been.calledWithMatch(/ws:\/\/[a-zA-Z\d-.]+:9090/)
    })

    it('Should remember the previous url', () => {
      expect(connect).to.not.have.been.called

      autoRos.connect(exampleUrl)
      expect(connect).to.have.been.calledOnce

      autoRos.connect()
      expect(connect).to.have.been.calledTwice
      expect(connect).to.always.have.been.calledWithExactly(exampleUrl)
    })
  })

  describe('AutoRos.status', () => {
    /**
     * Stubs
     */
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
      expect(autoRos.status).to.equal('closed')
    })

    it('Should respond to the ros::connection event', () => {
      autoRos.connect(exampleUrl)
      expect(autoRos.status).to.equal('connecting')
      expect(connect).to.have.been.calledOnce
      expect(connect).to.have.been.calledWithExactly(exampleUrl)

      autoRos.ros.emit('connection', {})
      expect(autoRos.status).to.equal('connected')
    })

    it('Should reconnect after the ros::closed event', () => {
      autoRos.connect(exampleUrl)
      expect(connect).to.have.been.calledOnce
      expect(connect).to.have.been.calledWithExactly(exampleUrl)

      autoRos.ros.emit('close', {})
      expect(autoRos.status).to.equal('closed')
      clock.tick(100)

      expect(connect).to.have.been.calledOnce
      expect(connect).to.have.been.calledWithExactly(exampleUrl)

      clock.tick(5000)

      expect(connect).to.have.been.calledTwice
      expect(connect).to.always.have.been.calledWithExactly(exampleUrl)
    })

    it('Should respond to the ros::error event', () => {
      autoRos.ros.emit('error', {})
      expect(autoRos.status).to.equal('error')
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
      customConnect.resolves()
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
      expect(customConnect).to.have.been.calledOnce
      expect(customConnect).to.have.been.calledWithExactly(exampleUrl)

      customAutoRos.ros.emit('close', {})
      expect(customAutoRos.status).to.equal('closed')
      clock.tick(5100)

      expect(customConnect).to.have.been.calledOnce
      expect(customConnect).to.have.been.calledWithExactly(exampleUrl)

      clock.tick(5000)

      expect(customConnect).to.have.been.calledTwice
      expect(customConnect).to.always.have.been.calledWithExactly(exampleUrl)
    })
  })
})

describe('rosOptions.url is not allowed', () => {
  it('Constructor should throw', () => {
    const options = { rosOptions: { url: exampleUrl } }
    const badConstructor = function() {
      return new AutoRos(options)
    }
    expect(badConstructor).to.throw(/url/)
  })
})
