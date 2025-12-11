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
        { last_name: 'Alejandro', first_name: 'Jonathan', middle_initial: 'F', roleId: employeeRole!.id },
        { last_name: 'Ancheta', first_name: 'Raquel', middle_initial: 'C', roleId: adminRole!.id },
        { last_name: 'Aronchay', first_name: 'Julie', middle_initial: 'S', roleId: employeeRole!.id },
        { last_name: 'Barretto', first_name: 'Leticia', middle_initial: 'D', roleId: employeeRole!.id },
        { last_name: 'Bay-on', first_name: 'Jennifer', middle_initial: 'T', roleId: divHeadRole!.id },
        { last_name: 'Cabading', first_name: 'Avelino', middle_initial: 'G', roleId: employeeRole!.id },
        { last_name: 'Cawating', first_name: 'Aldrin', middle_initial: 'D', roleId: employeeRole!.id },
        { last_name: 'Cong-o', first_name: 'Michael Jr.', middle_initial: 'D', roleId: employeeRole!.id },
        { last_name: 'Cortez', first_name: 'Florecita', middle_initial: 'A', roleId: divHeadRole!.id },
        { last_name: 'Dela Vega', first_name: 'Sammy', middle_initial: 'C', roleId: employeeRole!.id },
        { last_name: 'Deo', first_name: 'Marjorie Ann', middle_initial: 'D', roleId: employeeRole!.id },
        { last_name: 'Figueroa', first_name: 'Jennifer Grace', middle_initial: 'T', roleId: employeeRole!.id },
        { last_name: 'Hernandez', first_name: 'Daisy', middle_initial: 'M', roleId: employeeRole!.id },
        { last_name: 'Jimenez', first_name: 'Fredda', middle_initial: 'C', roleId: divHeadRole!.id },
        { last_name: 'Lopez', first_name: 'Jeofrey', middle_initial: 'D', roleId: employeeRole!.id },
        { last_name: 'Lumba', first_name: 'Cecilia', middle_initial: 'L', roleId: employeeRole!.id },
        { last_name: 'Passi', first_name: 'Pamela', middle_initial: 'N', roleId: employeeRole!.id },
        { last_name: 'Sabelo', first_name: 'Rivas', middle_initial: 'M', roleId: employeeRole!.id },
        { last_name: 'Samuel', first_name: 'Sheryl', middle_initial: 'B', roleId: employeeRole!.id },
        { last_name: 'Sawac', first_name: 'Pedro Jr.', middle_initial: 'M', roleId: divHeadRole!.id },
        { last_name: 'Tan', first_name: 'Marilou', middle_initial: 'T', roleId: employeeRole!.id },
        { last_name: 'Tinawi', first_name: 'Jennifer', middle_initial: 'T', roleId: employeeRole!.id },
        { last_name: 'Torre', first_name: 'Jedidiah David', middle_initial: 'T', roleId: employeeRole!.id },
        { last_name: 'Jofrey', first_name: 'Ester', middle_initial: 'T', roleId: employeeRole!.id },
        { last_name: 'Monoten', first_name: 'Kathrine', middle_initial: 'S', roleId: employeeRole!.id },
        { last_name: 'Rimando', first_name: 'Raymart', middle_initial: 'N', roleId: employeeRole!.id },
        { last_name: 'Atiwag', first_name: 'Jan Flouraine', middle_initial: 'D', roleId: employeeRole!.id },
        { last_name: 'Balidoy', first_name: 'Ryan Christopher', middle_initial: 'A', roleId: employeeRole!.id },
        { last_name: 'Cauilan', first_name: 'Rosemarie', middle_initial: 'C', roleId: employeeRole!.id },
        { last_name: 'Lagan', first_name: 'Rennel', middle_initial: 'P', roleId: employeeRole!.id },
        { last_name: 'Malubay', first_name: 'Adelynne', middle_initial: '', roleId: employeeRole!.id },
        { last_name: 'Nimer', first_name: 'Mark John', middle_initial: 'M', roleId: employeeRole!.id },
    ];

    for (const emp of employees) {
        const username = `${emp.last_name.replace(/\s+/g, '').toLowerCase()}.${emp.first_name.replace(/\s+/g, '').toLowerCase()}`;
        await prisma.employee.upsert({
            where: { username },
            update: {},
            create: {
                ...emp,
                username,
                password: `${emp.last_name.replace(/\s+/g, '').toLowerCase()}123`
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
