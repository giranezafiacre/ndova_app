// Extended Request type — populated in auth stages.
// Placed here so all middleware and controllers can import it cleanly.
import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
