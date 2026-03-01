import type { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "./error.handler.ts"; // Path to your class

export const ErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
): any => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for the developer
    console.error(`[Error] ${err.stack}`);

    // Handle specific Mongoose/Database errors (Optional but recommended)
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new ErrorResponse(message, 400);
    }

    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val: any) => val.message)
            .join(", ");
        error = new ErrorResponse(message, 400);
    }

    // Final Response
    return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Internal Server Error",
    });
};
