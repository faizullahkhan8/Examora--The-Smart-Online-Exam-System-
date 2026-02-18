import type { NextFunction, Request, Response } from "express";

export const authorize =
    (...allowedRoles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Un-authorized. Please login!",
            });
        }
        if (
            req.session.user.role &&
            !allowedRoles.includes(req.session.user.role)
        ) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions",
            });
        }

        next();
    };

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Un-authorized. Please login!",
        });
    }
    next();
};
