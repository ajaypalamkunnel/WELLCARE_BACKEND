import { IDepartment } from "../../../model/department/departmentModel";
import IDepartmentRepository from "../../../repositories/interfaces/department/IDepartment";
import { DepartmentTpe } from "../../../types/departmentTypes";
import { IDepartmentService } from "../../interfaces/department/iDepartmentService";


class DepartmentService implements IDepartmentService{

    private _departmentRepository:IDepartmentRepository

    constructor(departmentRepository:IDepartmentRepository){
        this._departmentRepository = departmentRepository
    }
    

    async createDeparment(departmentDetails: IDepartment): Promise<{ department: IDepartment; }> {
        try{

            console.log("dept service");
            console.log(departmentDetails);
            
            
            const {name,icon} ={...departmentDetails}
            console.log(name,"------",icon);
            
    
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


    async updateDeptStatus(deptId: string, status: boolean): Promise<DepartmentTpe> {
        try {

            if(typeof status !== 'boolean'){

                throw new Error("Invalid status only accept boolean value")
            }

            const existDepartment = await this._departmentRepository.findById(deptId)

        if(!existDepartment){
            throw new Error("Department not found")
        }

        const updatedDepartment = await this._departmentRepository.update(deptId,{status})

        if(!updatedDepartment){
            throw new Error("Failed to update department status")
        }

        return updatedDepartment
            
        } catch (error) {
            console.error(`Error in update depatment status :${error instanceof Error ? error.message : error}`);
            throw error
        }
    }

    
}


export default DepartmentService;