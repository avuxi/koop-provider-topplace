/*
  controller.js

  This file is not required unless additional routes specified in routes.js
  If so, corresponding functions must be written to match those routes.

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/

function Controller (model) {
  this.model = model
  this.get = function (req, res) {
    this.model.getData(req, function (err, datasets) {
      res.status(200).json(datasets)
    })
  }
}

module.exports = Controller
