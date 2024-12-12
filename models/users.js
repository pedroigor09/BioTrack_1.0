const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nomeComum: {
        type: String,
        required: true,
    },
    nomeCientifico: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    habitat: {
        type: String,
        required: true,
    },
    statusConservacao: {
        type: String,
        required: true,
    },
    localizacao: {
        type: String,
        required: true,
    },
    cidade: {
        type: String,
        required: true,
    },
    estado: {
        type: String,
        required: true,
    },
    pais: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);
