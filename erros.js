class InvalidArgumentError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.nome = 'InvalidArgumentError';
  }
}

class InternalServerError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.nome = 'InternalServerError';
  }
}

module.exports = {
  InvalidArgumentError: InvalidArgumentError,
  InternalServerError: InternalServerError
};
