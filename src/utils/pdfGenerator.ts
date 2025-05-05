import PDFDocument from "pdfkit";
import { IPrescription } from "../model/prescription/prescription Modal";
import { Readable } from "stream";

export const generatePrescriptionPDFBuffer = async (prescription: IPrescription): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Uint8Array[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.fontSize(20).text("Prescription", { align: "center" }).moveDown();

        doc.fontSize(14).text(`Doctor ID: ${prescription.doctorId}`);
        doc.text(`Patient ID: ${prescription.patientId}`);
        doc.text(`Appointment ID: ${prescription.appointmentId}`);
        doc.moveDown();

        doc.text("Medicines:", { underline: true });

        prescription.medicines.forEach((med, index) => {
            doc.moveDown(0.5);
            doc.text(`${index + 1}. ${med.name}`);
            doc.text(`   Dosage: ${med.dosage}`);
            doc.text(`   Duration: ${med.duration}`);
            doc.text(`   Time: ${med.time_of_consumption}`);
            doc.text(`   Method: ${med.consumption_method}`);
        });

        doc.end();
    });
};
