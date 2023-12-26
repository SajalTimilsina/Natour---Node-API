// operational erros
//AppError('dsadsadasd', 401)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // by doing this we already said incomming as a message property
    // thats why we don't need to do this.message = message;
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // sending this status to customer
    //when new object is created and constructor is called, it will not pollute the stack tray
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
