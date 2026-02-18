import type { Document, Types } from "mongoose";

export interface IUserOptions extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "admin" | "principal" | "hod" | "teacher" | "student";
    department?: Types.ObjectId;
    institute: Types.ObjectId;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    matchPassword: (password: string) => Promise<boolean>;
}
