'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { generateUniqueCertificateId } from '@/lib/certificateUtils';
import { generatePdfBlob, generateImageBlob, generateCertificateFileName } from '@/lib/pdfGenerator';
import { saveCertificateToDB } from '@/lib/certificateService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  Loader2, 
  Download, 
  Sparkles, 
  Trash2,
  ClipboardPaste,
  FileText,
  AlertCircle,
  Award,
  Image as ImageIcon,
  FileType
} from 'lucide-react';

interface ParsedParticipant {
  id: string;
  name: string;
  type: 'Participation' | '1st Prize' | '2nd Prize' | '3rd Prize';
  certificateId: string;
  status: 'Ready' | 'Generating' | 'Done' | 'Error';
}

export default function BulkGeneratePage() {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'both'>('pdf');
  const [pastedText, setPastedText] = useState('');
  const [participants, setParticipants] = useState<ParsedParticipant[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [completedZip, setCompletedZip] = useState<Blob | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const sampleExcelData = `Rahul Patil\tParticipation
Ayesha Shaikh\tParticipation
Sahil Deshmukh\t1st Prize
Ananya Kulkarni\tParticipation
Sufiyan Shaikh\tParticipation`;

  /**
   * Smart parser for Excel copy-paste (Tabs), CSVs (Commas), Semicolons, or simple line-by-line names
   */
  const parseRawTextData = (text: string) => {
    setParseError(null);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setParticipants([]);
      return;
    }

    const parsed: ParsedParticipant[] = [];

    // Check if first row is header
    const firstLineLower = lines[0].toLowerCase();
    const isHeader = 
      firstLineLower.includes('name') || 
      firstLineLower.includes('participant') || 
      firstLineLower.includes('student') ||
      firstLineLower.includes('certificate type') ||
      firstLineLower.includes('type');

    const startIndex = isHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes('|')) {
        parts = line.split('|');
      } else {
        parts = [line];
      }

      const cleanParts = parts.map(p => p.trim()).filter(p => p.length > 0);
      const name = cleanParts[0];
      if (!name) continue;

      let type: 'Participation' | '1st Prize' | '2nd Prize' | '3rd Prize' = 'Participation';
      if (cleanParts[1]) {
        const rawType = cleanParts[1].toLowerCase();
        if (rawType.includes('1st') || rawType.includes('first') || rawType.includes('winner') || rawType.includes('rank 1')) {
          type = '1st Prize';
        } else if (rawType.includes('2nd') || rawType.includes('second') || rawType.includes('runner') || rawType.includes('rank 2')) {
          type = '2nd Prize';
        } else if (rawType.includes('3rd') || rawType.includes('third') || rawType.includes('rank 3')) {
          type = '3rd Prize';
        }
      }

      parsed.push({
        id: `p-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        type,
        certificateId: generateUniqueCertificateId(),
        status: 'Ready'
      });
    }

    if (parsed.length === 0) {
      setParseError('No valid participant names found. Please check your data format.');
      return;
    }

    setParticipants(parsed);
    setCompletedZip(null);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    parseRawTextData(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!rows || rows.length === 0) {
          setParseError('The uploaded Excel sheet is empty.');
          return;
        }

        const tsvText = rows
          .map(row => (Array.isArray(row) ? row.join('\t') : String(row)))
          .join('\n');

        setPastedText(tsvText);
        parseRawTextData(tsvText);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setPastedText(text);
          parseRawTextData(text);
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParseError(`Failed to parse file: ${err.message || 'Unknown format'}`);
    }
  };

  const handleLoadSample = () => {
    setPastedText(sampleExcelData);
    parseRawTextData(sampleExcelData);
  };

  const handleTypeChange = (id: string, newType: 'Participation' | '1st Prize' | '2nd Prize' | '3rd Prize') => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, type: newType } : p));
  };

  const handleDeleteRow = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateAll = async () => {
    if (participants.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("EUREKA_2026_CERTIFICATES");

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      
      setParticipants(prev => prev.map(item => item.id === p.id ? { ...item, status: 'Generating' } : item));
      setProgressText(`Generating ${i + 1} of ${participants.length}: ${p.name}...`);

      const certData = {
        certificateId: p.certificateId,
        participantName: p.name,
        certificateType: p.type,
        eventName: 'EUREKA! PITCHING COMPETITION 2026',
        eventDate: '22 AUGUST 2026',
        institution: 'N. K. Orchid College of Engineering & Technology, Solapur.',
        issuedBy: 'E-Cell NKOCET'
      };

      // Save to Supabase and LocalStorage
      await saveCertificateToDB(certData);

      try {
        if (exportFormat === 'pdf' || exportFormat === 'both') {
          const pdfBlob = await generatePdfBlob(p.name, p.certificateId);
          const pdfName = generateCertificateFileName(p.name, p.certificateId, 'pdf');
          if (folder) folder.file(pdfName, pdfBlob);
        }

        if (exportFormat === 'png' || exportFormat === 'both') {
          const imgBlob = await generateImageBlob(p.name, p.certificateId);
          const imgName = generateCertificateFileName(p.name, p.certificateId, 'png');
          if (folder) folder.file(imgName, imgBlob);
        }

        setParticipants(prev => prev.map(item => item.id === p.id ? { ...item, status: 'Done' } : item));
      } catch (err) {
        console.error(`Error generating file for ${p.name}`, err);
        setParticipants(prev => prev.map(item => item.id === p.id ? { ...item, status: 'Error' } : item));
      }
    }

    setProgressText('Packaging ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setCompletedZip(zipBlob);
    setIsProcessing(false);
    setProgressText('All Certificates Generated ✓');
  };

  const handleDownloadZip = () => {
    if (!completedZip) return;
    const formatTag = exportFormat === 'png' ? 'IMAGES' : exportFormat === 'both' ? 'PDF_AND_IMAGES' : 'PDF';
    saveAs(completedZip, `EUREKA_2026_CERTIFICATES_${formatTag}.zip`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-navy">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-navy">Bulk Certificate Generation</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Paste from Excel / Google Sheets or upload spreadsheets to generate batch PDF or Image (PNG) ZIP archives
          </p>
        </div>

        {/* INPUT METHOD & FORMAT SELECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'paste'
                    ? 'bg-electric-blue text-white shadow'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Paste from Excel / Google Sheets</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'upload'
                    ? 'bg-electric-blue text-white shadow'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Excel / CSV File</span>
              </button>
            </div>

            <button
              onClick={handleLoadSample}
              className="text-xs font-semibold text-electric-blue hover:text-blue-700 inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Load Sample List</span>
            </button>
          </div>

          {/* PASTE TAB */}
          {inputMode === 'paste' && (
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                Paste Excel Columns (Name & optional Certificate Type)
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={handlePasteChange}
                placeholder="Copy columns from Excel/Google Sheets and press Ctrl+V here:
e.g.
Rahul Patil	Participation
Ayesha Shaikh	Participation
Sahil Deshmukh	1st Prize"
                className="w-full p-4 rounded-lg border border-slate-200 font-mono text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-2">
                💡 <span className="font-semibold text-gray-600">Tip:</span> You can copy 1 column (just names) or 2 columns (names + certificate types) directly from Excel or Google Sheets.
              </p>
            </div>
          )}

          {/* UPLOAD TAB */}
          {inputMode === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-electric-blue flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy">Select an Excel or CSV File</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Supports <span className="font-semibold text-navy">.xlsx</span>, <span className="font-semibold text-navy">.xls</span>, <span className="font-semibold text-navy">.csv</span>, or <span className="font-semibold text-navy">.txt</span>
              </p>

              <label className="mt-4 px-5 py-2.5 rounded-lg bg-electric-blue hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-md transition-all">
                <span>Browse Spreadsheet</span>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv,.tsv,.txt" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {/* EXPORT FORMAT SELECTOR */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileType className="w-4 h-4 text-electric-blue" />
              <span className="text-xs font-bold text-navy uppercase tracking-wider">Download Format:</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setExportFormat('pdf'); setCompletedZip(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  exportFormat === 'pdf'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>PDF in ZIP</span>
              </button>

              <button
                type="button"
                onClick={() => { setExportFormat('png'); setCompletedZip(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  exportFormat === 'png'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-electric-blue" />
                <span>Images (PNG) in ZIP</span>
              </button>

              <button
                type="button"
                onClick={() => { setExportFormat('both'); setCompletedZip(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  exportFormat === 'both'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Both (PDF + Image)</span>
              </button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {parseError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* TABLE & GENERATE SECTION */}
        {participants.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-electric-blue" />
                  <h2 className="text-base font-bold text-navy">
                    Parsed Participants ({participants.length})
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Exporting as <span className="font-bold text-navy uppercase">{exportFormat === 'both' ? 'PDF & PNG Images' : exportFormat === 'png' ? 'PNG Images' : 'PDFs'}</span> in ZIP archive
                </p>
              </div>

              {completedZip ? (
                <button
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download {exportFormat === 'png' ? 'Images' : exportFormat === 'both' ? 'PDF & Images' : 'PDFs'} ZIP
                </button>
              ) : (
                <button
                  onClick={handleGenerateAll}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-electric-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>
                    {isProcessing 
                      ? progressText 
                      : `GENERATE ${participants.length} ${exportFormat === 'png' ? 'IMAGES' : exportFormat === 'both' ? 'PDF + IMAGES' : 'PDFs'} (ZIP)`
                    }
                  </span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-navy">
                <thead className="bg-slate-50 border-b border-slate-100 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Participant Name</th>
                    <th className="px-5 py-3.5">Certificate Type</th>
                    <th className="px-5 py-3.5">Generated ID</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {participants.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-bold text-navy">{p.name}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={p.type}
                          disabled={isProcessing}
                          onChange={(e) => handleTypeChange(p.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-bold text-navy bg-white focus:outline-none focus:border-electric-blue cursor-pointer"
                        >
                          <option value="Participation">Participation</option>
                          <option value="1st Prize">1st Prize</option>
                          <option value="2nd Prize">2nd Prize</option>
                          <option value="3rd Prize">3rd Prize</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-electric-blue font-semibold">{p.certificateId}</td>
                      <td className="px-5 py-3.5">
                        {p.status === 'Ready' && <span className="text-gray-400 font-semibold">Ready</span>}
                        {p.status === 'Generating' && <span className="text-electric-blue font-bold animate-pulse">Generating...</span>}
                        {p.status === 'Done' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready in ZIP
                          </span>
                        )}
                        {p.status === 'Error' && <span className="text-red-500 font-bold">Failed</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDeleteRow(p.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove participant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
