import Department, { IDepartment } from "../../../model/department/departmentModel";
import { BaseRepository } from "../../base/BaseRepository";
import IDepartmentRepository from "../../interfaces/department/IDepartment";


class DepartmentRepository extends BaseRepository<IDepartment> implements IDepartmentRepository {

    constructor(){
        super(Department)
    }
    async findDepartmentByName(name: string): Promise<IDepartment | null> {
        return await Department.findOne({name})
    }
   

}


export default DepartmentRepository;