const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

class ConfiguracaoEmail {
  constructor() {
    this.host = process.env.EMAIL_HOST;
    this.auth = {
      user: process.env.EMAIL_USUARIO,
      pass: process.env.EMAIL_SENHA
    };
  }
}

class ConfiguracaoEmailTeste {
  constructor(contaTeste) {
    this.host = 'smtp.ethereal.email';
    this.auth = contaTeste;
  }
}

async function criaConfiguracaoEmail() {
  if (process.env.NODE_ENV === 'production') {
    return new ConfiguracaoEmail();
  } else {
    const contaTeste = await nodemailer.createTestAccount();
    return new ConfiguracaoEmailTeste(contaTeste);
  }
}

class Email {
  async enviaEmail() {
    const configuracaoEmail = await criaConfiguracaoEmail();
    const transportador = nodemailer.createTransport(configuracaoEmail);
    const info = await transportador.sendMail(this);
    // Tem como mandar imprimir isso apenas em desenvolvimento sem usar if?
    if (process.env.NODE_ENV !== 'production') {
      console.log('URL:' + nodemailer.getTestMessageUrl(info));
    }
  }
}

class EmailVerificacao extends Email {
  constructor(usuario) {
    super();
    const endereco = EmailVerificacao.geraEndereco(usuario.id);
    this.from = '"Blog do Código" <noreply@blogdocodigo.com.br>';
    this.to = usuario.email;
    this.subject = 'Verificação de e-mail';
    this.text = `Olá! Confirme seu e-mail aqui: ${endereco}.`;
    this.html = `Olá! Confirme seu e-mail <a href="${endereco}">aqui</a>.`;
  }

  static geraEndereco(id) {
    const token = jwt.sign({ id }, process.env.CHAVE_JWT, { expiresIn: '1h' });
    const baseURL = process.env.BASE_URL;
    return `${baseURL}/usuario/verifica_email/${token}`;
  }
}

module.exports = { EmailVerificacao };
