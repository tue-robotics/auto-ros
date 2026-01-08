# auto-ros

[![CI][gh-actions-image]][gh-actions-url] [![NPM version][npm-version-image]][npm-version-url]

Wrapper of ROSLIB.Ros which automatically reconnects

[gh-actions-image]: https://github.com/tue-robotics/auto-ros/actions/workflows/main.yml/badge.svg
[gh-actions-url]: https://github.com/tue-robotics/auto-ros/actions/workflows/main.yml

[npm-version-image]: https://img.shields.io/npm/v/auto-ros.svg
[npm-version-url]: https://www.npmjs.com/package/auto-ros

## Features

- 🔄 Automatic reconnection to rosbridge websocket
- 📘 Full TypeScript support with type definitions
- 🎯 Modern ES2022+ module
- 🔔 Event-based status updates
- ⚡ Zero configuration required

## Installation

```bash
npm install auto-ros
```

## Usage

### JavaScript

```js
import AutoRos from 'auto-ros'

const autoRos = new AutoRos()

autoRos.connect()
```

### TypeScript

```typescript
import AutoRos, { type ConnectionStatus } from 'auto-ros'

const autoRos = new AutoRos({
  reconnectTimeOut: 5000
})

autoRos.on('status', (status: ConnectionStatus) => {
  console.log('Connection status:', status)
})

autoRos.connect('ws://localhost:9090')
```

## API

### Constructor

```typescript
new AutoRos(options?: AutoRosOptions)
```

#### Options

- `reconnectTimeOut` (number, optional): Reconnect timeout in milliseconds. Default: `5000`

### Methods

#### `connect(url?: string): void`

Connect to rosbridge. If no URL is provided, uses the previous URL or a default based on hostname.

### Properties

#### `ros: Ros`

The underlying Ros instance from roslib.

#### `status: ConnectionStatus`

Current connection status. Can be: `'connecting'`, `'connected'`, `'closed'`, or `'error'`.

### Events

The class extends `EventEmitter2`, so you can listen to events:

- `'status'`: Emitted when connection status changes

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## License

See the repository license file.

