class InvalidArgumentError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InvalidArgumentError';
  }
}

class InvalidRefreshTokenError extends InvalidArgumentError {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InvalidRefreshTokenError';
  }
}

class InternalServerError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InternalServerError';
  }
}

module.exports = { InvalidArgumentError, InternalServerError,  InvalidRefreshTokenError};
