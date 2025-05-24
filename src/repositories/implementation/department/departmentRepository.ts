import Department, {
    IDepartment,
} from "../../../model/department/departmentModel";
import { BaseRepository } from "../../base/BaseRepository";
import IDepartmentRepository from "../../interfaces/department/IDepartment";

class DepartmentRepository
    extends BaseRepository<IDepartment>
    implements IDepartmentRepository {
    constructor() {
        super(Department);
    }
   
    async findDepartmentByName(name: string): Promise<IDepartment | null> {
        return await Department.findOne({ name });
    }

    async getAllActiveDepartments(): Promise<IDepartment[] | null> {
        return await Department.find({ status: true });
    }

    async getAllPaginatedDepartments(page: number=1, limit: number=10): Promise<IDepartment[]> {

        const skip = (page - 1) * limit

        return await Department.find().skip(skip).limit(limit)
    }
}

export default DepartmentRepository;
