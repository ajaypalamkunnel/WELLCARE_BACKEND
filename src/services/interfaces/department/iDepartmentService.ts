import { IDepartment } from "../../../model/department/departmentModel";
import { DepartmentTpe } from "../../../types/departmentTypes";

export interface IDepartmentService {
    createDeparment(
        departmentDetails: IDepartment
    ): Promise<{ department: IDepartment }>;
    getAllDepartments(): Promise<IDepartment[]>;
    updateDeptStatus(deptId: string, status: boolean): Promise<DepartmentTpe>;
    getAllActiveDepartments(): Promise<IDepartment[]>;
    getAllPaginatedDepartments(page: number, limit: number): Promise<{data:IDepartment[],totalPages:number,currentPage:number}>
}
