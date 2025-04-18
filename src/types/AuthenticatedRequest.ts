import { Request } from "express";
import { JwtUserPayload } from "../middlewares/authMiddleware";

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}