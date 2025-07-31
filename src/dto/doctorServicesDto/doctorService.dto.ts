export interface DoctorServiceDTO {
  _id: string;
  name: string;
  mode: 'Online' | 'In-Person' | 'Both';
  fee: number;
  description: string;
  isActive?: boolean;
  doctorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}