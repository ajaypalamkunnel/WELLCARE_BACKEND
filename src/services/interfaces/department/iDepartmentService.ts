import { IDepartment } from "../../../model/department/departmentModel";


export interface IDepartmentService{

    createDeparment(departmentDetails:IDepartment):Promise<{department:IDepartment}>
    getAllDepartments():Promise<IDepartment[]>
}