const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

class Email {
  async enviaEmail() {
    const contaTeste = await nodemailer.createTestAccount();

    const transportador = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      auth: contaTeste
    });

    const info = await transportador.sendMail(this);
    console.log('URL:' + nodemailer.getTestMessageUrl(info));
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
