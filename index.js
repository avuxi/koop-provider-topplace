/*
  index.js

  This file is required. It's role is to specify configuration settings.

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/

// Define the provider path
const provider = {
  type: 'provider',
  name: 'vx',
  hosts: true, // if true, also adds disableIdParam
  disableIdParam: false, // if true, adds to path and req.params
  Controller: require('./controller'),
  Model: require('./model'),
  version: require('./package.json').version
}

module.exports = provider
