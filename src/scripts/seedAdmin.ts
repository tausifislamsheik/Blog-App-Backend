import { error } from "node:console"
import { prisma } from "../lib/prisma"
import { UserRole } from "../middleware/auth"

const seedAdmin = async () =>{
    try{
        const adminData = {
            name: "Admin Shaheb1",
            email: "admin1@gmail.com",
            role: UserRole.Admin,
            password: "password123"
        }

        const existingUser = await prisma.user.findUnique({
            where:{
                email: adminData.email
            }
        })

        if(existingUser){
            throw new Error("User already exists")
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email",{
            method: "POST",
            headers:{
                "content-type": "application/json"
            },
            body: JSON.stringify(adminData)
        })

        if(signUpAdmin.ok){
            await prisma.user.update({
                where:{
                    email: adminData.email
                },
                data:{
                    emailVerified: true
                }
            })
        }
    }catch(err){
        console.error(err)
    }
}


seedAdmin();