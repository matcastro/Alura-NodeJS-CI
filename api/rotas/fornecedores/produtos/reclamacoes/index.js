const roteador = require('express').Router({ mergeParams: true })

roteador.get('/', (req, res) => {
  res.send(
    JSON.stringify([])
  )
})

module.exports = roteador
