import { IDepartment } from "../../../model/department/departmentModel";
import { IBaseRepository } from "../../base/IBaseRepository";


export default interface IDepartmentRepository extends IBaseRepository<IDepartment>{

    findDepartmentByName(name:string):Promise<IDepartment|null>
    // getAllDepartments():Promise<IDepartment[]|null>

}