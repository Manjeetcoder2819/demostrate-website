import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
// import * as XLSX from "xlsx";

export async function POST(req) {
  try {
    // Parse the incoming request data
    const { fname, lname, email, message } = await req.json();

    // Define the Excel file path inside the "public" directory
    const filePath = join(process.cwd(), "public", "contact_data.xlsx");

    let workbook;

    // Check if file exists
    if (existsSync(filePath)) {
      // Read existing file
      const existingFile = await readFile(filePath);
      workbook = XLSX.read(existingFile, { type: "buffer" });
    } else {
      // Create new workbook if file doesn't exist
      workbook = XLSX.utils.book_new();
      workbook.SheetNames.push("Contacts");
      workbook.Sheets["Contacts"] = XLSX.utils.json_to_sheet([]);
    }

    // Get the existing worksheet
    const worksheet = workbook.Sheets["Contacts"];
    
    // Add new row to the worksheet
    const newRow = { FirstName: fname, LastName: lname, Email: email, Message: message };
    const existingData = XLSX.utils.sheet_to_json(worksheet);
    existingData.push(newRow);

    // Convert data back to worksheet
    const newSheet = XLSX.utils.json_to_sheet(existingData);
    workbook.Sheets["Contacts"] = newSheet;

    // Write the updated workbook to the Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    await writeFile(filePath, excelBuffer);

    return new Response(JSON.stringify({ success: true, message: "Data saved successfully!" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
}
