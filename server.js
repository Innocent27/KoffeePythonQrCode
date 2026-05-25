const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const filePath = "qroutput_log.xlsx";

// store ALL scans as rows
let scanLog = [];

// Load existing Excel file if it exists
function loadExistingData() {
    if (fs.existsSync(filePath)) {
        const wb = XLSX.readFile(filePath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        scanLog = XLSX.utils.sheet_to_json(ws);
    }
}

// Save full log to Excel
function saveToExcel() {
    const ws = XLSX.utils.json_to_sheet(scanLog);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QR Log");

    XLSX.writeFile(wb, filePath);
}

loadExistingData();
// API to receive scans from the browser
app.post("/scan", (req, res) => {
    const { qr } = req.body;

    if (!qr) return res.status(400).send("No QR data");

    const timestamp = new Date().toISOString();

    // ADD NEW ROW EVERY TIME (NO COUNTING)
    scanLog.push({
        QR_Code: qr,
        Timestamp: timestamp
    });

    console.log(`Logged: ${qr} @ ${timestamp}`);

    saveToExcel();

    res.json({
        success: true,
        qr,
        timestamp
    });
});
//  endpoint to download the excel file
app.get("/download-log", (req, res) => {
    if (fs.existsSync(filePath)) {
        res.download(filePath, "qroutput_log.xlsx");
    } else {
        res.status(404).send("File not found");
    }
});



app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});