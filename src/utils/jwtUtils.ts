import jwt,{JwtPayload} from 'jsonwebtoken'
import dotenv from 'dotenv'


dotenv.config()


const accessSecret=process.env.ACCESS_TOKEN_SECRET as string
const refreshSecret=process.env.REFRESH_TOKEN_SECRET as string

class JwtUtils{
    static generateAccesToken(payload:object):string{
        return jwt.sign(payload,accessSecret,{expiresIn:'15m'})
    }

    static generateRefreshToken(payload:object):string{
        return jwt.sign(payload,refreshSecret,{expiresIn:'7d'})
    }


    static verifyToken(token:string,isRefreshToken=false):string|JwtPayload|null{
        try {
            const secret = isRefreshToken ? refreshSecret : accessSecret

            const decode = jwt.verify(token,secret)
            return decode
        } catch (error) {
            if(error instanceof jwt.TokenExpiredError){
                console.error("Token has expired");
                return {message:"Token expired"}
                
            }else if(error instanceof jwt.JsonWebTokenError){
                console.error("Invalid token signature");
                
            }
            return null
        }
    }



}


export default JwtUtils