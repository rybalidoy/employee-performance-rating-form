import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = "Sheet1") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const formatYearData = (evaluations: any[]) => {
    // Format for: Year Data (Average scores per employee)
    // We expect the input 'evaluations' to be the raw list (or processed list)
    // Actually, if we pass the 'topPerformers' or 'breakdown' data from dashboard stats, it's easier.
    // Let's make this generic for now.
    return evaluations;
};
