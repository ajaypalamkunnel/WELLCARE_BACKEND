
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { IDoctorSubscriptionPopulated } from "../../types/admin/adminDashboardDto";

export const generateSubscriptionReport = async (
    data: IDoctorSubscriptionPopulated[],
    format: "pdf" | "excel"
): Promise<Buffer> => {

    if (format === 'pdf') {
        // Create a PDF document with improved margins
        const doc = new PDFDocument({
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });
        const buffers: Uint8Array[] = [];
    
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => { });
    
        // Define colors for the report
        const primaryColor = '#0066cc';
        const secondaryColor = '#f0f7ff';
        const textColor = '#333333';
        const headerTextColor = '#ffffff';
    
        // Add company logo or header image if available
        // doc.image('path/to/logo.png', 50, 45, { width: 150 });
    
        // Add report title with better styling
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fillColor(primaryColor)
           .text("WELLCARE SUBSCRIPTION REPORT", { align: "center" });
        
        doc.moveDown(2);
    
        // Add report generation date
        doc.fontSize(10)
           .fillColor(textColor)
           .font('Helvetica')
           .text(`Report Generated: ${new Date().toLocaleDateString()}`, { align: "right" });
        
        doc.moveDown(1);
    
        // Create table header
        const tableTop = 160;
        const tableColumnWidth = (doc.page.width - 100) / 5;
        
        // Draw table header background
        doc.rect(50, tableTop - 20, doc.page.width - 100, 30)
           .fillColor(primaryColor)
           .fill();
        
        // Add table headers
        doc.fillColor(headerTextColor)
           .font('Helvetica-Bold')
           .fontSize(12);
        
        doc.text("S/N", 60, tableTop - 14);
        doc.text("Doctor", 60 + tableColumnWidth, tableTop - 14);
        doc.text("Email", 60 + tableColumnWidth * 2, tableTop - 14);
        doc.text("Plan", 60 + tableColumnWidth * 3, tableTop - 14);
        doc.text("Amount", 60 + tableColumnWidth * 4, tableTop - 14);
    
        // Reset text color
        doc.fillColor(textColor);
        
        // Add table rows
        let yPosition = tableTop + 15;
        
        data.forEach((item, idx) => {
            // Add zebra striping for better readability
            if (idx % 2 !== 0) {
                doc.rect(50, yPosition - 15, doc.page.width - 100, 30)
                   .fillColor(secondaryColor)
                   .fill();
            }
            
            doc.fillColor(textColor)
               .font('Helvetica')
               .fontSize(10);
            
            // Check if we need a new page
            if (yPosition > doc.page.height - 100) {
                doc.addPage();
                yPosition = 80;
                
                // Add column headers to new page
                doc.rect(50, yPosition - 20, doc.page.width - 100, 30)
                   .fillColor(primaryColor)
                   .fill();
                
                doc.fillColor(headerTextColor)
                   .font('Helvetica-Bold')
                   .fontSize(12);
                
                doc.text("S/N", 60, yPosition - 14);
                doc.text("Doctor", 60 + tableColumnWidth, yPosition - 14);
                doc.text("Email", 60 + tableColumnWidth * 2, yPosition - 14);
                doc.text("Plan", 60 + tableColumnWidth * 3, yPosition - 14);
                doc.text("Amount", 60 + tableColumnWidth * 4, yPosition - 14);
                
                yPosition += 15;
                doc.fillColor(textColor);
            }
    
            // Serial number
            doc.text(`${idx + 1}`, 60, yPosition);
            
            // Doctor name - truncate if too long
            const doctorName = item.doctorId?.fullName || "N/A";
            doc.text(doctorName.length > 20 ? doctorName.substring(0, 18) + '...' : doctorName, 
                     60 + tableColumnWidth, yPosition);
            
            // Email - truncate if too long
            const email = item.doctorId?.email || "N/A";
            doc.text(email.length > 20 ? email.substring(0, 18) + '...' : email, 
                     60 + tableColumnWidth * 2, yPosition);
            
            // Plan name
            doc.text(item.planId?.planName || "N/A", 60 + tableColumnWidth * 3, yPosition);
            
            // Amount
            doc.text(`₹${item.paymentDetails?.paymentAmount || "0"}`, 60 + tableColumnWidth * 4, yPosition);
            
            yPosition += 30;
        });
    
        // Draw table border
        doc.rect(50, tableTop - 20, doc.page.width - 100, yPosition - tableTop + 5)
           .stroke();
        
        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            
            // Add page number
            doc.fontSize(10)
               .text(`Page ${i + 1} of ${pageCount}`, 
                     50, 
                     doc.page.height - 50,
                     { align: "center" });
        }
    
        doc.end();
        return await new Promise(resolve => doc.on("end", () => resolve(Buffer.concat(buffers))));
    }



    // Excel generation
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Subscription Report");

    sheet.columns = [
        { header: "Doctor Name", key: "doctorName", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Plan", key: "plan", width: 20 },
        { header: "Price (₹)", key: "price", width: 15 },
        { header: "Subscribed At", key: "date", width: 20 },
    ];

    data.forEach((item) => {
        sheet.addRow({
            doctorName: item.doctorId?.fullName,
            email: item.doctorId?.email,
            plan: item.planId?.planName,
            price: item.paymentDetails?.paymentAmount,
            date: new Date(item.createdAt).toLocaleDateString(),
        });
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);



}