const roteador = require('express').Router()
const TabelaFornecedor = require('./TabelaFornecedor')
const Fornecedor = require('./Fornecedor')
const SerializadorFornecedor = require('../../Serializador').SerializadorFornecedor
const TabelaProduto = require('./produtos/TabelaProduto')

roteador.options('/', (req, res) => {
  res
    .set('Access-Control-Allow-Methods', 'GET, POST')
    .set('Access-Control-Allow-Headers', 'Content-Type')
    .status(204)
    .end()
})

roteador.get('/', async (req, res) => {
  const resultados = await TabelaFornecedor.listar()
  const serializador = new SerializadorFornecedor(
    res.getHeader('Content-Type'),
    ['empresa', 'categoria']
  )
  res.send(serializador.serializar(resultados))
})

roteador.post('/', async (req, res, proximo) => {
  try {
    const dadosRecebidos = req.body
    const fornecedor = new Fornecedor(dadosRecebidos)
    await fornecedor.criar()

    const serializador = new SerializadorFornecedor(
      res.getHeader('Content-Type'),
      ['empresa', 'categoria']
    )
    res
      .status(201)
      .send(serializador.serializar(fornecedor))
  } catch (erro) {
    proximo(erro)
  }
})

roteador.options('/:idFornecedor', (req, res) => {
  res
    .set('Access-Control-Allow-Methods', 'GET, PUT, DELETE')
    .set('Access-Control-Allow-Headers', 'Content-Type')
    .status(204)
    .end()
})

roteador.get('/:idFornecedor', async (req, res, proximo) => {
  try {
    const id = req.params.idFornecedor
    const fornecedor = new Fornecedor({ id: id })
    await fornecedor.carregar()
    const serializador = new SerializadorFornecedor(
      res.getHeader('Content-Type'),
      ['empresa', 'categoria', 'email', 'dataCriacao', 'dataAtualizacao', 'versao']
    )
    res.send(serializador.serializar(fornecedor))
  } catch (erro) {
    proximo(erro)
  }
})

roteador.put('/:idFornecedor', async (req, res, proximo) => {
  try {
    const id = req.params.idFornecedor
    const dadosRecebidos = req.body
    const fornecedor = new Fornecedor({ id, ...dadosRecebidos })
    await fornecedor.atualizar()
    res
      .status(204)
      .end()
  } catch (erro) {
    proximo(erro)
  }
})

roteador.delete('/:idFornecedor', async (req, res, proximo) => {
  try {
    const id = req.params.idFornecedor
    const fornecedor = new Fornecedor({ id: id })
    await fornecedor.carregar()
    await fornecedor.remover()
    res
      .status(204)
      .end()
  } catch (erro) {
    proximo(erro)
  }
})

roteador.post('/:idFornecedor/calcular-reposicao-de-estoque', async (req, res, proximo) => {
  try {
    const fornecedor = new Fornecedor({
      id: req.params.idFornecedor
    })
    await fornecedor.carregar()
    const produtos = await TabelaProduto.listar(fornecedor.id, { estoque: 0 })
    res.send({
      mensagem: `${produtos.length} precisam de reposição de estoque`
    })
  } catch (erro) {
    proximo(erro)
  }
})

const roteadorProdutos = require('./produtos')

const verificarFornecedor = async (req, res, proximo) => {
  try {
    const id = req.params.idFornecedor
    const fornecedor = new Fornecedor({ id: id })
    await fornecedor.carregar()
    req.fornecedor = fornecedor
    proximo()
  } catch (erro) {
    proximo(erro)
  }
}
roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos)

module.exports = roteador
