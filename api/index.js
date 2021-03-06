const express = require('express')
const app = express()
const config = require('config')
const NaoEncontrado = require('./erros/NaoEncontrado')
const CampoInvalido = require('./erros/CampoInvalido')
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const formatosAceitos = require('./Serializador').formatosAceitos
const SerializadorErro = require('./Serializador').SerializadorErro

app.use(express.json())

app.use((req, res, proximo) => {
  let formatoRequisitado = req.header('Accept')

  if (formatoRequisitado === '*/*') {
    formatoRequisitado = 'application/json'
  }

  if (formatosAceitos.indexOf(formatoRequisitado) === -1) {
    res.status(406)
    res.end()
    return
  }

  res.setHeader('Content-Type', formatoRequisitado)
  proximo()
})

app.use((req, res, proximo) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('X-Powered-By', 'Gatito Petshop')
  proximo()
})

const roteador = require('./rotas/fornecedores')
app.use('/api/fornecedores', roteador)

const roteadorV2 = require('./rotas/fornecedores/rotas.v2')
app.use('/api/v2/fornecedores', roteadorV2)

app.use((erro, req, res, proximo) => {
  let status = 500
  if (erro instanceof NaoEncontrado) {
    status = 404
  } else if (erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos) {
    status = 400
  } else if (erro instanceof ValorNaoSuportado) {
    status = 406
  }

  const serializador = new SerializadorErro(res.getHeader('Content-Type'))

  res
    .status(status)
    .send(
      serializador.serializar({
        id: erro.idErro,
        mensagem: erro.message
      })
    )
})

app.listen(config.get('api.porta'), () => {
  console.log('A API está funcionando!')
})
