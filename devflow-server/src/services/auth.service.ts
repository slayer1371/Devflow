import bcrypt from 'bcryptjs';
import { prisma } from '../db';

export async function loginOrRegister(email: string, password: string, name?: string) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        // Login logic
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Invalid password");
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } else {
        // Register logic
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0]
            }
        });
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true }
    });
}
