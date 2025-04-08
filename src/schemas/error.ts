
export class ClientError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = "ClientError";
        this.statusCode = statusCode;
    }
}

export class ServerError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = "ServerError";
        this.statusCode = statusCode;
    }
}

export class NotificationValidationError extends ClientError {
    constructor(message: string, statusCode: number = 422) {
        super(message, statusCode);
        this.name = "NotificationValidationError";
    }
}

export class NotificationSendError extends ServerError {
    constructor(message: string, statusCode: number = 500) {
        super(message, statusCode);
        this.name = "NotificationSendError";
    }
}
