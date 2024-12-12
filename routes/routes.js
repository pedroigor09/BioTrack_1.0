const express = require('express');
const router = express.Router();
const Biologo = require('../models/biologos');
const User = require('../models/users');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Configuração do armazenamento de imagens para upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// Rota para renderizar o formulário de cadastro de biólogos
router.get('/register', (req, res) => {
    res.render('register', { message: req.session.message });
    delete req.session.message; // Limpa a mensagem após renderizar
});

// Inserindo o animal na rota da database
router.post('/add', upload, (req, res) => {
    const user = new User({
        nomeComum: req.body.nomeComum,
        nomeCientifico: req.body.nomeCientifico,
        description: req.body.description,
        habitat: req.body.habitat,
        statusConservacao: req.body.statusConservacao,
        localizacao: req.body.localizacao,
        email: req.body.email,
        image: req.file.filename,
        pais: req.body.pais,
        estado: req.body.estado,
        cidade: req.body.cidade
    });
    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'O usuário acabou de registrar um animal com sucesso!'
            };
            res.redirect('/index');
        })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
});

// Pegar todos os animais da rota
router.get("/", (req, res) => {
    User.find()
        .then(users => {
            res.render('index', {
                title: 'Bio Track Home Page',
                users: users,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

router.get('/index', (req, res) => {
    User.find()
        .then(users => {
            res.render('index', {
                title: 'Bio Track Home Page',
                users: users,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

router.get('/add', (req, res) => {
    res.render('add_animals', { title: 'Add animals' });
});

router.get('/login', (req, res) => {
    const message = req.session.message;
    console.log('Mensagem na sessão:', message); // Log adicional
    res.render('login', { message: message });
    delete req.session.message; // Limpa a mensagem após renderizar
});


// Rota POST para login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("E-mail: ", email);
    console.log("Password: ", password);

    try {
        const user = await Biologo.findOne({ email: email });

        if (user) {
            console.log("Usuário encontrado:", user);
            const isMatch = await bcrypt.compare(password, user.senha); // Comparação da senha usando bcrypt
            console.log("Senha corresponde:", isMatch);

            if (isMatch) {
                // Autenticação bem-sucedida
                console.log("Autenticação bem-sucedida");
                req.session.message = {
                    type: 'success',
                    message: 'Login bem-sucedido.'
                };
                res.redirect('/index');
            } else {
                // Senha incorreta
                console.log("Senha incorreta");
                req.session.message = {
                    type: 'danger',
                    message: 'Autenticação falhou. Senha incorreta.'
                };
                res.redirect('/login');
            }
        } else {
            // Usuário não encontrado
            console.log("Usuário não encontrado");
            req.session.message = {
                type: 'danger',
                message: 'Autenticação falhou. Usuário não encontrado.'
            };
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Erro ao buscar o usuário:", error);
        req.session.message = {
            type: 'danger',
            message: 'Erro ao buscar o usuário.'
        };
        res.redirect('/login');
    }
});

// Editando o animal da rota
router.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id)
        .then(user => {
            if (!user) {
                return res.redirect('/');
            }
            res.render('edit_animals', {
                title: "Edit Animal",
                user: user,
            });
        })
        .catch(err => {
            res.redirect('/');
        });
});

// update do animal da rota
router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            // Remove a imagem antiga
            await fs.promises.unlink('./uploads/' + req.body.old_image);
        } catch (err) {
            console.error("Erro ao remover a imagem antiga:", err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            nomeComum: req.body.nomeComum,
            nomeCientifico: req.body.nomeCientifico,
            description: req.body.description,
            habitat: req.body.habitat,
            statusConservacao: req.body.statusConservacao,
            localizacao: req.body.localizacao,
            email: req.body.email,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'Animal atualizado com sucesso!'
        };
        res.redirect('/index');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete dos animais das rotas
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Busca e deleta o usuário
        const result = await User.findByIdAndDelete(id);

        // Remove a imagem associada se existir
        if (result && result.image !== '') {
            try {
                await fs.promises.unlink('./uploads/' + result.image);
            } catch (err) {
                console.error("Erro ao remover a imagem:", err);
            }
        }

        // Configura a mensagem de sucesso
        req.session.message = {
            type: 'info',
            message: 'Animal deletado com sucesso!'
        };
        res.redirect('/index');
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get('/dashboard', async (req, res) => {
    try {
        const speciesCount = await User.countDocuments();
        const statusCount = await User.aggregate([{ $group: { _id: "$statusConservacao", count: { $sum: 1 } } }]);
        const locationCount = await User.aggregate([
            { 
                $group: { 
                    _id: "$estado",  // Agregar apenas por estado
                    count: { $sum: 1 } 
                } 
            }
        ]);

        // Log para verificar os dados de localização formatados
        console.log('locationCount:', locationCount);

        res.render('dashboard', {
            speciesCount,
            statusCount,
            locationCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

var uploadCertificado = multer({
    storage: storage,
}).single('certificado');

router.post('/register', uploadCertificado, async (req, res) => {
    const { nome, sobrenome, cpf, email, senha, confirmarSenha } = req.body;

    console.log('Dados recebidos:', req.body); // Log para verificar os dados recebidos

    // Validação básica
    if (senha !== confirmarSenha) {
        req.session.message = {
            type: 'danger',
            message: 'As senhas não conferem. Por favor, verifique e tente novamente.'
        };
        console.log('Erro: As senhas não conferem');
        return res.redirect('/register');
    }

    if (!req.file) {
        req.session.message = {
            type: 'danger',
            message: 'Certificado de Biólogo é obrigatório.'
        };
        console.log('Erro: Certificado de Biólogo é obrigatório');
        return res.redirect('/register');
    }

    try {
        // Hash da senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        const newBiologo = new Biologo({
            nome,
            sobrenome,
            cpf,
            email,
            senha: hashedSenha, // Salva a senha hash
            certificado: req.file.filename
        });

        await newBiologo.save();

        req.session.message = {
            type: 'success',
            message: 'Cadastrado com sucesso, faça o login para entrar no BioTrack.'
        };
        console.log('Mensagem de sucesso configurada na sessão:', req.session.message); // Log adicional
        console.log('Usuário registrado com sucesso');
        res.redirect('/login'); // Redireciona para a página de login após o registro
    } catch (err) {
        console.error("Erro ao registrar o usuário:", err); // Log de erro
        if (!res.headersSent) {
            req.session.message = {
                type: 'danger',
                message: 'Erro ao registrar o usuário: ' + err.message
            };
            res.redirect('/register');
        }
    }
});

module.exports = router;
