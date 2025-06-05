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

    async getAllPaginatedDepartments(page: number=1, limit: number=10): Promise<{data:IDepartment[],totalCount:number}> {

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            Department.find().skip(skip).limit(limit),
            Department.countDocuments()
        ])

        return {data,totalCount}
    }
}

export default DepartmentRepository;
