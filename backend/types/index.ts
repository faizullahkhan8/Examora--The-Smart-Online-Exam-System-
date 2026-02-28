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

// ─── MESSENGER ────────────────────────────────────────────────────────────────

export interface IConversation extends Document {
    _id: Types.ObjectId;
    type: "direct" | "group" | "announcement";
    name?: string;
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    createdBy: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessage extends Document {
    _id: Types.ObjectId;
    conversation: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    readBy: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

export interface INotification extends Document {
    _id: Types.ObjectId;
    recipient: Types.ObjectId;
    type: "security" | "user" | "system" | "institute";
    title: string;
    message: string;
    priority: "low" | "medium" | "high";
    isRead: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── DEPARTMENTS ────────────────────────────────────────────────────────

export interface IDepartment extends Document {
    _id: Types.ObjectId;
    name: string;
    code: string;
    description?: string;
    institute: Types.ObjectId;
    hod?: Types.ObjectId;
    capacity?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── ACADEMIC SESSION ──────────────────────────────────────────────────────────

export interface IAcademicSession extends Document {
    _id: Types.ObjectId;
    /** e.g., 2026 */
    startYear: number;
    /** startYear + 4 */
    endYear: number;
    department: Types.ObjectId;
    institute: Types.ObjectId;
    /** 1‑8 — single source of truth for the entire cohort's semester */
    currentSemester: number;
    /** upcoming → active → completed (or locked at any point) */
    status: "upcoming" | "active" | "locked" | "completed";
    intakeCapacity: number;
    totalEnrolledStudents: number;
    /** false once enrollment is closed and progression begins */
    enrollmentOpen: boolean;
    /** Date when the next automated/manual promotion should occur */
    nextPromotionDate: Date;
    /** Who created the session */
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
