import { jsPDF } from 'jspdf';

export const generateCertificate = (data: {
    participantName: string;
    eventTitle: string;
    date: string;
    mentorName: string;
    id: string;
    logo?: string;
    config?: {
        primaryColor?: string;
        title?: string;
        subtitle?: string;
        description?: string;
        signerName?: string;
        signerRole?: string;
    };
}) => {
    // A4 Landscape: 297mm x 210mm
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const width = 297;
    const height = 210;
    const center = width / 2;

    // --- PALETTE & CONFIG ---
    // Helper helper to hex to rgb
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] as [number, number, number] : [30, 58, 138] as [number, number, number];
    };

    const userColor = data.config?.primaryColor ? hexToRgb(data.config.primaryColor) : [30, 58, 138]; // Default Dark Blue

    // We use the User's Main Color as the "Simulated Wave Color"
    const waveColor = userColor;

    const white = [255, 255, 255] as [number, number, number];
    const gold = [212, 175, 55] as [number, number, number];    // #D4AF37
    const goldLight = [234, 179, 8] as [number, number, number];// #EAB308
    const grey = [100, 116, 139] as [number, number, number];   // #64748b

    // Text overrides
    const titleText = data.config?.title || 'Certificate';
    const subtitleText = data.config?.subtitle || 'OF ACHIEVEMENT';
    const descriptionText = data.config?.description || 'concluiu com êxito a participação no evento:';
    const signerRoleText = data.config?.signerRole || 'MENTOR';
    const signerNameText = data.config?.signerName || data.mentorName;

    // 1. Background (White)
    doc.setFillColor(white[0], white[1], white[2]);
    doc.rect(0, 0, width, height, 'F');

    // 2. Artistic Waves

    // Top-Left Wave
    doc.setFillColor(waveColor[0], waveColor[1], waveColor[2]);
    doc.path([
        { op: 'm', c: [0, 0] },
        { op: 'l', c: [0, 110] },
        { op: 'c', c: [50, 90, 120, 40, 140, 0] }, // Curve back to top edge
        { op: 'l', c: [0, 0] },
        { op: 'h' }
    ]);
    doc.fill(); // Uses setFillColor above

    // Gold Trim Top-Left
    doc.setLineWidth(2);
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.path([
        { op: 'm', c: [0, 115] },
        { op: 'c', c: [55, 95, 125, 45, 145, 0] }
    ]);
    doc.stroke();

    // Bottom-Right Wave (Mirrored)
    doc.setFillColor(waveColor[0], waveColor[1], waveColor[2]);
    doc.path([
        { op: 'm', c: [width, height] },
        { op: 'l', c: [width, height - 110] },
        { op: 'c', c: [width - 50, height - 90, width - 120, height - 40, width - 140, height] },
        { op: 'l', c: [width, height] },
        { op: 'h' }
    ]);
    doc.fill();

    // Gold Trim Bottom-Right
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.path([
        { op: 'm', c: [width, height - 115] },
        { op: 'c', c: [width - 55, height - 95, width - 125, height - 45, width - 145, height] }
    ]);
    doc.stroke();


    // 3. Border (Geometric)
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(1);
    const margin = 15;
    const corner = 8;

    // Main Rectangle
    doc.rect(margin, margin, width - (margin * 2), height - (margin * 2), 'S');

    // Decorative Corners
    doc.setLineWidth(1.5);
    // Bottom-Left
    doc.rect(margin - 3, height - margin - corner, corner, corner, 'S'); // Outer square part
    doc.rect(margin, height - margin - corner, corner, corner, 'S'); // Intersecting

    // Top-Right
    doc.rect(width - margin, margin, corner, corner, 'S');
    doc.rect(width - margin - corner + 3, margin - 3, corner, corner, 'S');

    // 4. Header Text
    // Title
    doc.setTextColor(waveColor[0], waveColor[1], waveColor[2]); // Use wave color for text too
    doc.setFontSize(60);
    doc.setFont('times', 'italic');
    doc.text(titleText, width - 80, 45, { align: 'center' });

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setCharSpace(3);
    doc.setTextColor(grey[0], grey[1], grey[2]);
    doc.text(subtitleText, width - 80, 55, { align: 'center' });
    doc.setCharSpace(0);

    // 5. Main Body
    // "PROUDLY PRESENT TO"
    doc.setFontSize(10);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTE DIPLOMA É CONFERIDO A', center - 20, 85, { align: 'center' });

    // Name Surname
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFontSize(50);
    doc.setFont('times', 'bolditalic');
    doc.text(data.participantName, center - 20, 105, { align: 'center' });

    // Underline
    const nameWidth = doc.getTextWidth(data.participantName);
    doc.setLineWidth(0.5);
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.line(center - 20 - (nameWidth / 2) - 10, 110, center - 20 + (nameWidth / 2) + 10, 110);

    // Description
    doc.setFontSize(11);
    doc.setTextColor(grey[0], grey[1], grey[2]);
    doc.setFont('helvetica', 'normal');

    // Use dynamic description and date
    const finalDesc = `${descriptionText} "${data.eventTitle}". Este documento certifica a atualização profissional na data de ${data.date}.`;

    // Wrap text
    const splitDesc = doc.splitTextToSize(finalDesc, 140);
    doc.text(splitDesc, center - 20, 125, { align: 'center' });

    // 6. Badge (Right Side)
    // Gold Circle
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.circle(230, 95, 18, 'F');
    doc.setFillColor(waveColor[0], waveColor[1], waveColor[2]);
    doc.circle(230, 95, 14, 'F');
    // Text inside badge
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL', 230, 93, { align: 'center' });
    doc.text('CERTIFIED', 230, 96, { align: 'center' });
    // Stars
    doc.text('★ ★ ★', 230, 100, { align: 'center' });

    // Ribbons
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.triangle(223, 110, 237, 110, 230, 125, 'F');


    // 7. Signatures (Bottom)
    const sigY = 165;

    // Left Sig
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.line(50, sigY, 100, sigY);
    doc.setFontSize(10);
    doc.setTextColor(waveColor[0], waveColor[1], waveColor[2]);
    doc.text(signerRoleText, 75, sigY + 5, { align: 'center' });

    // Simulation of signature
    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.text(signerNameText, 75, sigY - 5, { align: 'center' });

    // Center/Right Sig (Date/Validation)
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.line(140, sigY, 190, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DATA DE EMISSÃO', 165, sigY + 5, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.text(data.date, 165, sigY - 5, { align: 'center' });

    // 8. Seal (Bottom Right)
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(1);
    doc.circle(260, 170, 12, 'S');
    doc.setFontSize(6);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('VALIDATED', 260, 168, { align: 'center' });
    doc.text(data.id.substring(0, 8).toUpperCase(), 260, 172, { align: 'center' });


    // Save
    doc.save(`Certificado-${data.participantName.replace(/\s+/g, '-')}.pdf`);
};
// Trigger Vercel Rebuild
