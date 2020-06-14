 class HttpError extends Error {
     constructor(message,errorCode) {
         super(message)   //add msg property 
         this.code = errorCode;  //add "code" property
     }
}

module.exports = HttpError;
