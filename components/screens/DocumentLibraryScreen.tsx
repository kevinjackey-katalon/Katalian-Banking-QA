import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ViewType } from '../../types';
import Button from '../common/Button';

interface DocumentLibraryScreenProps {
    onNavigate: (view: ViewType) => void;
}

const buildLoanRequestFormPdf = (): jsPDF => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const drawField = (label: string, y: number, width = 230, x = 48) => {
        doc.setFontSize(10);
        doc.setTextColor(62, 70, 84);
        doc.text(label, x, y);
        doc.setDrawColor(170, 177, 190);
        doc.line(x, y + 14, x + width, y + 14);
    };

    doc.setFillColor(16, 24, 39);
    doc.rect(0, 0, pageWidth, 92, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Loan Request Form', 48, 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Katalian Banking - Generic Loan Application', 48, 68);

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Applicant Information', 48, 132);

    doc.setFont('helvetica', 'normal');
    drawField('Full Name', 154, 240, 48);
    drawField('Date of Birth (MM/DD/YYYY)', 154, 220, 320);
    drawField('Phone Number', 192, 180, 48);
    drawField('Email Address', 192, 280, 248);
    drawField('Street Address', 230, 420, 48);
    drawField('City', 268, 180, 48);
    drawField('State', 268, 90, 248);
    drawField('ZIP Code', 268, 110, 360);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Loan Details', 48, 320);
    doc.setFont('helvetica', 'normal');
    drawField('Loan Type (Personal / Auto / Mortgage / Other)', 342, 300, 48);
    drawField('Requested Amount (USD)', 380, 190, 48);
    drawField('Requested Term (Months)', 380, 190, 270);
    drawField('Purpose of Loan', 418, 500, 48);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Employment & Income', 48, 470);
    doc.setFont('helvetica', 'normal');
    drawField('Employer Name', 492, 240, 48);
    drawField('Job Title', 492, 240, 320);
    drawField('Annual Gross Income (USD)', 530, 230, 48);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Declarations', 48, 580);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('[ ] I certify all information provided is accurate and complete.', 48, 602);
    doc.text('[ ] I authorize Katalian Banking to verify credit and employment records.', 48, 620);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Electronic Signature', 48, 664);
    doc.setFont('helvetica', 'normal');
    drawField('Borrower Electronic Signature (type full legal name)', 686, 320, 48);
    drawField('Borrower Signature Date', 686, 190, 392);
    drawField('Co-Borrower Electronic Signature (if applicable)', 724, 320, 48);
    drawField('Co-Borrower Signature Date', 724, 190, 392);

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    doc.text('System metadata: Signature IP, timestamp, and consent hash are recorded upon submission.', 48, 778);

    return doc;
};

const DocumentLibraryScreen: React.FC<DocumentLibraryScreenProps> = ({ onNavigate }) => {
    const [pdfUrl, setPdfUrl] = useState<string>('');

    const pdfDoc = useMemo(() => buildLoanRequestFormPdf(), []);

    useEffect(() => {
        const blob = pdfDoc.output('blob');
        const objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [pdfDoc]);

    const handleDownload = () => {
        pdfDoc.save('Loan Request Form.pdf');
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Asset Management</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Document Library</h2>
                <p className="text-slate-400 max-w-3xl">
                    Secure document repository for standardized client forms. The Loan Request Form below includes generic lending fields and electronic signature sections.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                    <Button onClick={handleDownload} variant="primary" className="!rounded-full px-8">Download Loan Request Form (PDF)</Button>
                    <Button onClick={() => onNavigate({ name: 'dashboard' })} variant="secondary" className="!rounded-full px-8">Return to Dashboard</Button>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-4 md:p-6 shadow-2xl">
                <div className="flex items-center justify-between px-2 pb-4">
                    <h3 className="text-sm md:text-base font-bold text-white">Loan Request Form</h3>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">PDF Preview</span>
                </div>

                {pdfUrl ? (
                    <iframe
                        title="Loan Request Form Preview"
                        src={pdfUrl}
                        className="w-full h-[72vh] rounded-2xl border border-white/10 bg-white"
                    />
                ) : (
                    <div className="w-full h-[72vh] rounded-2xl border border-white/10 bg-slate-950 flex items-center justify-center text-slate-400">
                        Preparing PDF preview...
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentLibraryScreen;
