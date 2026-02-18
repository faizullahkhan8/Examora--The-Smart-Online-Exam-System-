export class ErrorResponse extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        // Fix the prototype chain
        Object.setPrototypeOf(this, ErrorResponse.prototype);

        // Optional: Capture the stack trace (V8 engines like Node.js)
        Error.captureStackTrace(this, this.constructor);
    }
}
