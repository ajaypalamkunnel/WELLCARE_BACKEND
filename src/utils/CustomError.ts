export class CustomError extends Error {
    public statusCode: number; // Stores HTTP status code

    constructor(message: string, statusCode: number) {
        super(message); // Call the base class (Error) constructor
        this.statusCode = statusCode; // Assign custom status code

        // Ensure proper prototype chain for 'instanceof' checks
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
