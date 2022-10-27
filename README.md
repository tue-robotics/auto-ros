# auto-ros

[![CI][gh-actions-image]][gh-actions-url] [![NPM version][npm-version-image]][npm-version-url]

Wrapper of ROSLIB.Ros which automatically reconnects

[gh-actions-image]: https://github.com/tue-robotics/auto-ros/actions/workflows/main.yml/badge.svg
[gh-actions-url]: https://github.com/tue-robotics/auto-ros/actions/workflows/main.yml

[npm-version-image]: https://img.shields.io/npm/v/auto-ros.svg
[npm-version-url]: https://www.npmjs.com/package/auto-ros

## Usage

```js
import AutoRos from 'auto-ros'

const autoRos = new AutoRos()

autoRos.connect()
```
