import session from "express-session";
import { EUserRoles } from "./index.ts";
import { Types } from "mongoose";

declare module "express-session" {
    interface SessionData {
        user: {
            id: Types.ObjectId;
            role: EUserRoles | "";
        };
    }
}
