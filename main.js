require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CONEXÃO COM A DATABASE -> UTILIZEI O MONGODB
mongoose.connect('mongodb://127.0.0.1:27017/biotrack_crud', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log("Connected to the database"));

// MIDDLEWARES, CUIDADO AO MEXER
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));

// Ajuste do middleware para que a mensagem seja passada corretamente
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// SETANDO O FUNCIONAMENTO DO TEMPLATE (ENGRENAGEM)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Redirecionar a raiz do site para a página de login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// ROTA PARA HEADER
app.get('/header', (req, res) => {
    res.render('header'); // Renderiza a página 'header.ejs'
});

// PREFIXO DAS ROTAS
app.use("", require('./routes/routes.js'));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});