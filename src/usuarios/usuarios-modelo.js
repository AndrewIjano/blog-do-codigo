const usuariosDao = require('./usuarios-dao');
const { InvalidArgumentError } = require('../erros');
const bcrypt = require('bcrypt');
const validacoes = require('../validacoes-comuns');
const speakeasy = require('speakeasy');

class Usuario {
  constructor(usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senhaHash = usuario.senhaHash;
    this.chaveAutenticacaoDoisFatores = usuario.chaveAutenticacaoDoisFatores;

    this.valida();
  }

  async adicionaSenha(senha) {
    validacoes.campoStringNaoNulo(senha, 'senha');
    validacoes.campoTamanhoMinimo(senha, 'senha', 8);
    validacoes.campoTamanhoMaximo(senha, 'senha', 64);

    this.senhaHash = await Usuario.gerarSenhaHash(senha);
  }

  async adicionaChaveAutenticacaoDoisFatores() {
    this.chaveAutenticacaoDoisFatores = speakeasy.generateSecret().base32;
  }

  async adiciona() {
    if (await Usuario.buscaPorEmail(this.email)) {
      throw new InvalidArgumentError('O usuário já existe!');
    }

    return usuariosDao.adiciona(this);
  }

  valida() {
    validacoes.campoStringNaoNulo(this.nome, 'nome');
    validacoes.campoStringNaoNulo(this.email, 'email');
  }

  async deleta() {
    return usuariosDao.deleta(this);
  }

  static async buscaPorId(id) {
    const usuario = await usuariosDao.buscaPorId(id);
    if (!usuario) {
      return null;
    }

    return new Usuario(usuario);
  }

  static async buscaPorEmail(email) {
    const usuario = await usuariosDao.buscaPorEmail(email);
    if (!usuario) {
      return null;
    }

    return new Usuario(usuario);
  }

  static async gerarSenhaHash(senha) {
    const custoHash = 12;
    return bcrypt.hash(senha, custoHash);
  }
}

module.exports = Usuario;
