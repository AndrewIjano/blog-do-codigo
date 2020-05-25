const usuariosDao = require('./usuarios-dao');
const { InvalidArgumentError } = require('../erros');
const validacoes = require('../validacoes-comuns');
const bcrypt = require('bcrypt');
const tokens = require('./tokens');

class Usuario {
  constructor(usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senhaHash = usuario.senhaHash;
    this.emailVerificado = Number(usuario.emailVerificado);
    this.chaveAutenticacaoDoisFatores = usuario.chaveAutenticacaoDoisFatores;
    this.valida();
  }

  async adiciona() {
    if (await Usuario.buscaPorEmail(this.email)) {
      throw new InvalidArgumentError('O usuário já existe!');
    }

    await usuariosDao.adiciona(this);
    // necessário ter o id para verificação de e-mail
    // não encontrei ainda forma de recuperar isso a partir do INSERT
    const { id } = await Usuario.buscaPorEmail(this.email);
    this.id = id;
  }

  async adicionaSenha(senha) {
    validacoes.campoStringNaoNulo(senha, 'senha');
    validacoes.campoTamanhoMinimo(senha, 'senha', 8);
    validacoes.campoTamanhoMaximo(senha, 'senha', 64);

    this.senhaHash = await Usuario.gerarSenhaHash(senha);
  }

  adicionaChaveAutenticacaoDoisFatores() {
    this.chaveAutenticacaoDoisFatores = tokens.totp.cria();
  }

  valida() {
    validacoes.campoStringNaoNulo(this.nome, 'nome');
    validacoes.campoStringNaoNulo(this.email, 'email');
  }

  async verificaEmail() {
    await usuariosDao.modificaEmailVerificado(this, true);
  }

  async modificaSenha(senhaNova) {
    await this.adicionaSenha(senhaNova);
    await usuariosDao.modificaSenhaHash(this, this.senhaHash);
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

  static lista() {
    return usuariosDao.lista();
  }

  static gerarSenhaHash(senha) {
    const custoHash = 12;
    return bcrypt.hash(senha, custoHash);
  }
}

module.exports = Usuario;
