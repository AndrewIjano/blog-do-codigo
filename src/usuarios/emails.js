const nodemailer = require('nodemailer');

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
  constructor(usuario, endereco) {
    super();
    this.from = '"Blog do Código" <noreply@blogdocodigo.com.br>';
    this.to = usuario.email;
    this.subject = 'Email de verificação';
    this.text = `Olá! Confirme seu e-mail aqui: ${endereco}.`;
    this.html = `<h1>Olá!</h1> Confirme seu e-mail aqui: ${endereco}.`;
  }
}

module.exports = { EmailVerificacao };
