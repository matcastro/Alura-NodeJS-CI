const roteador = require('express').Router()
const TabelaFornecedor = require('./TabelaFornecedor')
const Fornecedor = require('./Fornecedor')
const SerializadorFornecedor = require('../../Serializador').SerializadorFornecedor

roteador.options('/', (req, res) => {
  res
    .set('Access-Control-Allow-Methods', 'GET')
    .set('Access-Control-Allow-Headers', 'Content-Type')
    .status(204)
    .end()
})

roteador.get('/', async (req, res) => {
  const resultados = await TabelaFornecedor.listar()
  const serializador = new SerializadorFornecedor(
    res.getHeader('Content-Type'),
    ['categoria'],
    ['empresa']
  )
  res.send(serializador.serializar(resultados))
})

roteador.post('/', async (req, res, proximo) => {
  try {
    const dadosRecebidos = req.body
    const fornecedor = new Fornecedor(dadosRecebidos)
    await fornecedor.criar()

    const serializador = new SerializadorFornecedor(
      res.getHeader('Content-Type')
    )
    res
      .status(201)
      .send(serializador.serializar(fornecedor))
  } catch (erro) {
    proximo(erro)
  }
})

module.exports = roteador
