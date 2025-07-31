import { DepartmentDTO } from "../../../dto/departmentDto/Department.dto";
import { IDepartment } from "../../../model/department/departmentModel";
import { DepartmentTpe } from "../../../types/departmentTypes";

export interface IDepartmentService {
    createDeparment(
        departmentDetails: IDepartment
    ): Promise<{ department: IDepartment }>;
    getAllDepartments(): Promise<DepartmentDTO[]>;
    updateDeptStatus(deptId: string, status: boolean): Promise<DepartmentTpe>;
    getAllActiveDepartments(): Promise<DepartmentDTO[]>;
    getAllPaginatedDepartments(page: number, limit: number): Promise<{data:DepartmentDTO[],totalPages:number,currentPage:number}>
}
