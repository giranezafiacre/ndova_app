import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    const hasRole = allowedRoles.some((role) => req.user!.roles.includes(role));
    if (!hasRole) {
      next(
        ApiError.forbidden(
          "You do not have permission to access this resource",
        ),
      );
      return;
    }

    next();
  };
}
