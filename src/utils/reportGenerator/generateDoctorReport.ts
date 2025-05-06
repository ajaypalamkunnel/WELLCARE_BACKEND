import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { IConsultationAppointment } from "../../model/consultationBooking/consultationBooking";


export const generateDoctorReport = async (
    appointments: IConsultationAppointment[],
    formatType: "pdf" | "excel"
  ): Promise<Buffer> => {
    if (formatType === "pdf") {
      return generatePDFReport(appointments);
    } else {
      return generateExcelReport(appointments);
    }
  };




  const generatePDFReport = async (
    appointments: IConsultationAppointment[]
  ): Promise<Buffer> => {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: any[] = [];
  
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
  
      // Header
      doc
        .fillColor("#03045e")
        .fontSize(20)
        .text("WELLCARE DOCTOR REPORT", { align: "center" });
  
      doc.moveDown().fontSize(12).fillColor("black");
  
      const tableTop = 100;
  
      // Table header
      doc
        .font("Helvetica-Bold")
        .text("Date", 50, tableTop)
        .text("Patient", 150, tableTop)
        .text("Service", 280, tableTop)
        .text("Status", 400, tableTop)
        .text("Fee", 480, tableTop);
  
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  
      // Table rows
      let y = tableTop + 30;
  
      appointments.forEach((app, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
  
        const dateStr = format(new Date(app.appointmentDate), "yyyy-MM-dd");
        const patient = (app.patientId as any)?.fullName ?? "N/A";
        const service = (app.serviceId as any)?.name ?? "N/A";
        const fee = (app.serviceId as any)?.fee ?? 0;
  
        doc
          .font("Helvetica")
          .text(dateStr, 50, y)
          .text(patient, 150, y)
          .text(service, 280, y)
          .text(app.status, 400, y)
          .text(`₹${fee}`, 480, y);
  
        y += 25;
      });
  
      doc.end();
    });
  };
  
  const generateExcelReport = async (
    appointments: IConsultationAppointment[]
  ): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Doctor Report");
  
    // Header style
    worksheet.mergeCells("A1", "E1");
    const header = worksheet.getCell("A1");
    header.value = "WELLCARE DOCTOR REPORT";
    header.alignment = { horizontal: "center", vertical: "middle" };
    header.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF03045E" },
    };
    worksheet.getRow(1).height = 30;
  
    worksheet.addRow([]);
  
    // Table headings
    worksheet.addRow([
      "Appointment Date",
      "Patient Name",
      "Service",
      "Status",
      "Fee",
    ]);
  
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDEEFF" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
  
    // Table rows
    appointments.forEach((app) => {
      worksheet.addRow([
        format(new Date(app.appointmentDate), "yyyy-MM-dd"),
        (app.patientId as any)?.fullName ?? "N/A",
        (app.serviceId as any)?.name ?? "N/A",
        app.status,
        `₹${(app.serviceId as any)?.fee ?? 0}`,
      ]);
    });
  
    // Column widths
    worksheet.columns = [
      { width: 18 },
      { width: 25 },
      { width: 25 },
      { width: 15 },
      { width: 10 },
    ];
  
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  };