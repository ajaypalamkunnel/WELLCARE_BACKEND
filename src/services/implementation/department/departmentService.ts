import { IDepartment } from "../../../model/department/departmentModel";
import IDepartmentRepository from "../../../repositories/interfaces/department/IDepartment";
import { IDepartmentService } from "../../interfaces/department/iDepartmentService";


class DepartmentService implements IDepartmentService{

    private _departmentRepository:IDepartmentRepository

    constructor(departmentRepository:IDepartmentRepository){
        this._departmentRepository = departmentRepository
    }


    async createDeparment(departmentDetails: IDepartment): Promise<{ department: IDepartment; }> {
        try{

            const {name,icon} = departmentDetails
    
            if(!name||!icon){
                throw new Error("All fields are required")
            }
    
            const departmentName = name.toLowerCase()
    
            const existingDepartment = await this._departmentRepository.findDepartmentByName(departmentName)
    
            if(existingDepartment){
                throw new Error("Department already exists")
            }
    
            const department = await this._departmentRepository.create({
                name: departmentName,
                icon: icon,
                status:true
            })
    
            return {department}
        }catch(error){
            console.error("Error in department creation");
            throw error
            
        }

    }

     async getAllDepartments ():Promise<IDepartment[]>{
        try {
            const departments = await this._departmentRepository.findAll()

            if(!departments || departments.length === 0){
                return []
            }
            return departments
        } catch (error) {
            console.error("Error in department department fetch");
            throw new Error("Failed to fetch departments")
        }
     }
    
}


export default DepartmentService;