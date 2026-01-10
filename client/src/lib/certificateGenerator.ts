import { jsPDF } from 'jspdf';

export const generateCertificate = (data: {
    participantName: string;
    eventTitle: string;
    date: string;
    mentorName: string;
    id: string;
    logo?: string;
}) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Background and Frame
    doc.setFillColor(23, 26, 32); // Dark background
    doc.rect(0, 0, 297, 210, 'F');

    doc.setDrawColor(212, 175, 55); // Gold border
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190, 'S');
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186, 'S');

    // Header / Branding
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.text('INS-CREVA-SE', 148.5, 40, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text('CERTIFICADO DE PARTICIPAÇÃO', 148.5, 70, { align: 'center' });

    // Body
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos para os devidos fins que', 148.5, 95, { align: 'center' });

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(32);
    doc.setFont('times', 'italic');
    doc.text(data.participantName.toUpperCase(), 148.5, 115, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`participou com sucesso da masterclass / evento:`, 148.5, 130, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(data.eventTitle, 148.5, 145, { align: 'center' });

    // Footer
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${data.date}`, 60, 175, { align: 'center' });
    doc.text(`Mentor: ${data.mentorName}`, 237, 175, { align: 'center' });

    // Decorative Lines for signatures
    doc.setDrawColor(212, 175, 55);
    doc.line(40, 170, 80, 170);
    doc.line(212, 170, 262, 170);

    // Footer Branding
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Código de Autenticidade: ${data.id.toUpperCase()}`, 148.5, 195, { align: 'center' });
    doc.text('Validado digitalmente pela plataforma Inscreva-se', 148.5, 200, { align: 'center' });

    // Download the PDF
    doc.save(`Certificado-${data.participantName.replace(/\s+/g, '-')}.pdf`);
};
