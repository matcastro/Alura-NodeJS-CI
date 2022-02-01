const modelos = [
  require('../rotas/fornecedores/ModeloTabelaFornecedor'),
  require('../rotas/fornecedores/produtos/ModeloTabelaProduto')
]

async function criarTabelas () {
  for (let i = 0; i < modelos.length; i++) {
    const modelo = modelos[i]
    await modelo
      .sync()
      .then(() => console.log(`Tabela ${i + 1} de ${modelos.length} criada com sucesso`))
      .catch(console.log)
  }
}

criarTabelas()
