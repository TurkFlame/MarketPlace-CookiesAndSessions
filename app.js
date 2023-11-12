//Importando o framework express
const express = require("express")

//Importar as bibliotecas de sessões e cookies
const session = require("express-session")
const cookieParser = require("cookie-parser")

//Inicializar a aplicacação express
const app = express()

function criarHeadHtml(conteudoEspecifico) {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My MarketPlace</title>
        <link rel="stylesheet" href="./style.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&family=Rubik:wght@300&display=swap" rel="stylesheet">
    </head>
    
    <body>
        <div>
            ${conteudoEspecifico}
        </div>
    </body>
    <script src="https://kit.fontawesome.com/222eab0554.js" crossorigin="anonymous"></script>
    </html>`
}

app.use(express.static('public'))

//Configurando os cookies
app.use(cookieParser())

//Configurando as sessões
app.use(
    session({
        secret: "minhachave",
        resave: false, //evitar regravar sessões sem alterações,
        saveUninitialized: true //Salva sessões não inicializadas        
    })
)

const produtos = [
    { id: 1, nome: "Arroz", preco: 25 },
    { id: 2, nome: "Feijão", preco: 15 },
    { id: 3, nome: "Bife", preco: 40 }
]

app.get('/produtos', (req, res) => {
    res.send(criarHeadHtml(`
    <h1>Lista de Produtos</h1>
    <ul>
        ${produtos.map(produto => `
        <li>
        <a href="/adicionar/${produto.id}"><i class="fa-solid fa-cart-shopping"></i></a>
        ${produto.nome} R$ ${produto.preco} 
        <a href="/adicionarFavoritos/${produto.id}"><i class="fa-solid fa-star" href="/adicionarFavoritos/${produto.id}"></i></a>
        </li>`).join("")
        }
    </ul>
    <a href="/carrinho">Ver carrinho</a>
    <br>
    <a href="/favoritos">Ver favoritos</a>
    `))
})

//Rota de adicionar 

app.get("/adicionar/:id", (req, res) => {
    const id = parseInt(req.params.id)
    const produto = produtos.find(produtoAtual => produtoAtual.id === id)

    if (produto) {
        if (!req.session.carrinho) {
            req.session.carrinho = []
        }
        req.session.carrinho.push(produto)
    }
    res.redirect("/produtos")
})

app.get("/adicionarFavoritos/:id", (req, res) => {
    const id = parseInt(req.params.id)
    const produto = produtos.find(produtoAtual => produtoAtual.id === id)

    if (produto) {
        console.log("Achou produtos")
        let favorites = req.cookies.favorites || []
        favorites.push(produto)
        res.cookie('favorites', favorites, { maxAge: 900000, httpOnly: true }) // Definindo o cookie de favoritos
    }

    res.redirect("/produtos")
})

app.get('/favoritos', (req, res) => {
    const favorites = req.cookies.favorites || []
    const total = favorites.reduce((acc, produto) => acc += produto.preco, 0)

    res.send(criarHeadHtml(`
    <h1>Favoritos</h1>
    <ul>
        ${favorites.map(produto => `<li>${produto.nome} - ${produto.preco}</li>`).join("")}
    </ul>
    <p> Total: ${total}</p>
    <a href="/produtos">Continuar Comprando</a>
    `))
})

//Rota do carrinho

app.get('/carrinho', (req, res) => {
    const carrinho = req.session.carrinho || []
    const total = carrinho.reduce((acc, produto) => acc += produto.preco, 0)

    res.send(criarHeadHtml(`
    <h1>Carrinho de compras</h1>
    <ul>
        ${carrinho.map(produto => `<li>${produto.nome} - ${produto.preco}</li>`).join("")}
    </ul>
    <p> Total: ${total}</p>
    <a href="/produtos">Continuar Comprando</a>
    `))
})

app.listen(3000, () => console.log("Aplicação iniciada na porta 3000"))