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

export interface IInstituteLocation {
    address: string;
    city: string;
    country: string;
}

export interface IInstituteOptions extends Document {
    _id: Types.ObjectId;
    name: string;
    domain: string;
    location: IInstituteLocation;
    contactPhone?: string;
    contactEmail?: string;
    website?: string;
    type: "university" | "college" | "school" | "polytechnic";
    establishedYear?: number;
    logoInitials: string;
    isActive: boolean;
    principal?: Types.ObjectId;
    studentsCount: number;
    departmentsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
