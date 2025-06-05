import { IDepartment } from "../../../model/department/departmentModel";
import IDepartmentRepository from "../../../repositories/interfaces/department/IDepartment";
import { DepartmentTpe } from "../../../types/departmentTypes";
import { IDepartmentService } from "../../interfaces/department/iDepartmentService";

class DepartmentService implements IDepartmentService {
    private _departmentRepository: IDepartmentRepository;

    constructor(departmentRepository: IDepartmentRepository) {
        this._departmentRepository = departmentRepository;
    }
   
    async createDeparment(
        departmentDetails: IDepartment
    ): Promise<{ department: IDepartment }> {
        try {


            const { name, icon } = { ...departmentDetails };

            if (!name || !icon) {
                throw new Error("All fields are required");
            }

            const departmentName = name.toLowerCase();

            const existingDepartment =
                await this._departmentRepository.findDepartmentByName(departmentName);

            if (existingDepartment) {
                throw new Error("Department already exists");
            }

            const department = await this._departmentRepository.create({
                name: departmentName,
                icon: icon,
                status: true,
            });

            return { department };
        } catch (error) {


            if (error instanceof Error) {
                throw error
            } else {

                throw new Error(`failed to create department :${error}`);
            }
        }
    }

    async getAllDepartments(): Promise<IDepartment[]> {
        try {
            const departments = await this._departmentRepository.findAll();

            if (!departments || departments.length === 0) {
                return [];
            }
            return departments;
        } catch (error) {

            console.error("Failed to fetch departments : ", error)

            throw new Error("Failed to fetch departments");
        }
    }

    async updateDeptStatus(
        deptId: string,
        status: boolean
    ): Promise<DepartmentTpe> {
        try {
            if (typeof status !== "boolean") {
                throw new Error("Invalid status only accept boolean value");
            }

            const existDepartment = await this._departmentRepository.findById(deptId);

            if (!existDepartment) {
                throw new Error("Department not found");
            }

            const updatedDepartment = await this._departmentRepository.update(
                deptId,
                { status }
            );

            if (!updatedDepartment) {
                throw new Error("Failed to update department status");
            }

            return updatedDepartment;
        } catch (error) {
            console.error(
                `Error in update depatment status :${error instanceof Error ? error.message : error
                }`
            );
            throw error;
        }
    }

    async getAllActiveDepartments(): Promise<IDepartment[]> {
        try {
            const departments =
                await this._departmentRepository.getAllActiveDepartments();

            if (!departments || departments.length === 0) {
                return [];
            }
            return departments;
        } catch (error) {

            throw new Error(`Failed to fetch departments : ${error}`);
        }
    }


     async getAllPaginatedDepartments(page: number, limit: number): Promise<{data:IDepartment[],totalPages:number,currentPage:number}> {


        const {data,totalCount} = await this._departmentRepository.getAllPaginatedDepartments(page,limit)

        const totalPages = Math.ceil(totalCount/limit)

        return {
            data,
            totalPages,
            currentPage:page
        }
    }

}

export default DepartmentService;
