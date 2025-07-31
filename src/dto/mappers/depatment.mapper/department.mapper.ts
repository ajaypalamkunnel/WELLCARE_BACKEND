
import { IDepartment } from "../../../model/department/departmentModel";
import { DepartmentDTO } from "../../departmentDto/Department.dto";
export const mapDepartmentToDto = (department: IDepartment): DepartmentDTO => {
  return {
    _id: department._id,
    name: department.name,
    icon: department.icon,
    status: department.status,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
};

export const mapDepartmentsToDto = (departments: IDepartment[]): DepartmentDTO[] => {
  return departments.map(mapDepartmentToDto);
};
