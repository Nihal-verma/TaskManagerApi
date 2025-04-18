import { JwtUserPayload } from "../middlewares/authMiddleware"; // Adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
export {}; 