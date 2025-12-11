import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Roles
    const roles = [
        { name: "Admin" },
        { name: "Division Head" },
        { name: "Assistant Division Head" },
        { name: "Employee" },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
    const divHeadRole = await prisma.role.findUnique({ where: { name: "Division Head" } });
    const assistHeadRole = await prisma.role.findUnique({ where: { name: "Assistant Division Head" } });
    const employeeRole = await prisma.role.findUnique({ where: { name: "Employee" } });

    // Employees
    const employees = [
        { first_name: 'Bruce', last_name: 'Wayne', middle_initial: 'T', roleId: adminRole!.id },
        { first_name: 'Clark', last_name: 'Kent', middle_initial: 'J', roleId: divHeadRole!.id },
        { first_name: 'Diana', last_name: 'Prince', roleId: assistHeadRole!.id },
        { first_name: 'Barry', last_name: 'Allen', roleId: employeeRole!.id },
        { first_name: 'Hal', last_name: 'Jordan', roleId: employeeRole!.id },
        { first_name: 'Arthur', last_name: 'Curry', roleId: employeeRole!.id },
        { first_name: 'Victor', last_name: 'Stone', roleId: employeeRole!.id },
        { first_name: 'Oliver', last_name: 'Queen', roleId: employeeRole!.id },
        { first_name: 'Billy', last_name: 'Batson', roleId: employeeRole!.id },
        { first_name: 'Carter', last_name: 'Hall', roleId: employeeRole!.id },
        { first_name: 'Shiera', last_name: 'Hall', roleId: employeeRole!.id },
        { first_name: 'Ray', last_name: 'Palmer', roleId: employeeRole!.id },
        { first_name: 'Dinah', last_name: 'Lance', roleId: employeeRole!.id },
        { first_name: 'John', last_name: 'Stewart', roleId: employeeRole!.id },
        { first_name: 'Kara', last_name: 'Zor-El', roleId: employeeRole!.id },
    ];

    for (const emp of employees) {
        const username = `${emp.last_name.toLowerCase()}.${emp.first_name.toLowerCase()}`;
        await prisma.employee.upsert({
            where: { username }, // Use username as unique identifier for upsert
            update: {},
            create: {
                ...emp,
                username,
                password: 'password123'
            },
        });
    }

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
