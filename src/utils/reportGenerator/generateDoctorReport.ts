import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { IConsultationAppointment } from "../../model/consultationBooking/consultationBooking";
import mongoose from "mongoose";

// Populated Interfaces
interface IPatientPopulated {
  _id: mongoose.Types.ObjectId;
  fullName: string;
}

interface IServicePopulated {
  _id: mongoose.Types.ObjectId;
  name: string;
  fee: number;
}

type IConsultationAppointmentPopulated = Omit<IConsultationAppointment, 'patientId' | 'serviceId'> & {
  patientId: IPatientPopulated | mongoose.Types.ObjectId;
  serviceId: IServicePopulated | mongoose.Types.ObjectId;
};

export const generateDoctorReport = async (
  appointments: IConsultationAppointmentPopulated[],
  formatType: "pdf" | "excel"
): Promise<Buffer> => {
  if (formatType === "pdf") {
    return generatePDFReport(appointments);
  } else {
    return generateExcelReport(appointments);
  }
};

const generatePDFReport = async (
  appointments: IConsultationAppointmentPopulated[]
): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Uint8Array[] = [];

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

    let y = tableTop + 30;

    appointments.forEach((app) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const dateStr = format(new Date(app.appointmentDate), "yyyy-MM-dd");
      const patient =
        typeof app.patientId === "object" && "fullName" in app.patientId
          ? app.patientId.fullName
          : "N/A";
      const service =
        typeof app.serviceId === "object" && "name" in app.serviceId
          ? app.serviceId.name
          : "N/A";
      const fee =
        typeof app.serviceId === "object" && "fee" in app.serviceId
          ? app.serviceId.fee
          : 0;

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
  appointments: IConsultationAppointmentPopulated[]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Doctor Report");

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

  appointments.forEach((app) => {
    const patient =
      typeof app.patientId === "object" && "fullName" in app.patientId
        ? app.patientId.fullName
        : "N/A";
    const service =
      typeof app.serviceId === "object" && "name" in app.serviceId
        ? app.serviceId.name
        : "N/A";
    const fee =
      typeof app.serviceId === "object" && "fee" in app.serviceId
        ? app.serviceId.fee
        : 0;

    worksheet.addRow([
      format(new Date(app.appointmentDate), "yyyy-MM-dd"),
      patient,
      service,
      app.status,
      `₹${fee}`,
    ]);
  });

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
