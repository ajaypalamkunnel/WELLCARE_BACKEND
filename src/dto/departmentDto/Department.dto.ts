import { ObjectId } from "mongoose";

export interface DepartmentDTO {
    _id:ObjectId|string;
    name: string;
    icon: string;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
