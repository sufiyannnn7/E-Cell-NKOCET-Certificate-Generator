'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { CertificateTemplate, CertificateData } from '@/components/certificate/CertificateTemplate';
import { generateUniqueCertificateId } from '@/lib/certificateUtils';
import { downloadPdfCertificate, downloadImageCertificate } from '@/lib/pdfGenerator';
import { saveCertificateToDB } from '@/lib/certificateService';
import { 
  Sparkles, 
  Download, 
  Copy, 
  ExternalLink, 
  Check, 
  Loader2,
  Award,
  Image as ImageIcon
} from 'lucide-react';

export default function GenerateCertificatePage() {
  const [participantName, setParticipantName] = useState('');
  const [certificateType, setCertificateType] = useState<'Participation' | '1st Prize' | '2nd Prize' | '3rd Prize'>('Participation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [copied, setCopied] = useState(false);

  const [generatedCert, setGeneratedCert] = useState<CertificateData | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) return;

    setIsGenerating(true);
    setGenerationStep('Creating unique certificate ID...');

    await new Promise(r => setTimeout(r, 200));

    const newId = generateUniqueCertificateId();
    setGenerationStep('Preparing certificate layout...');

    const certData: CertificateData = {
      certificateId: newId,
      participantName: participantName.trim(),
      certificateType,
      eventName: 'EUREKA! PITCHING COMPETITION 2026',
      eventDate: '22 AUGUST 2026',
      institution: 'N. K. Orchid College of Engineering & Technology, Solapur.',
      issuedBy: 'E-Cell NKOCET'
    };

    setGenerationStep('Saving to Supabase Database...');
    await saveCertificateToDB(certData);

    setGenerationStep('Certificate Ready ✓');
    await new Promise(r => setTimeout(r, 150));

    setGeneratedCert(certData);
    setIsGenerating(false);
  };

  const handleDownloadPdf = async () => {
    if (!generatedCert) return;
    await downloadPdfCertificate(
      'active-cert-preview-render',
      generatedCert.participantName,
      generatedCert.certificateId
    );
  };

  const handleDownloadImage = async () => {
    if (!generatedCert) return;
    await downloadImageCertificate(
      'active-cert-preview-render',
      generatedCert.participantName,
      generatedCert.certificateId
    );
  };

  const handleCopyLink = () => {
    if (!generatedCert) return;
    const url = `${window.location.origin}/verify/${generatedCert.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-navy">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-navy">Generate Certificate</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Create an official certificate for Eureka! Pitching Competition 2026
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM COLUMN */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  Participant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sufiyan Shaikh"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-navy font-semibold focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  Certificate Type
                </label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-navy font-semibold focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue bg-white transition-all"
                >
                  <option value="Participation">Participation</option>
                  <option value="1st Prize">1st Prize Winner</option>
                  <option value="2nd Prize">2nd Prize Winner</option>
                  <option value="3rd Prize">3rd Prize Winner</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !participantName.trim()}
                className="w-full py-3 px-4 rounded-lg bg-electric-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{generationStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Certificate</span>
                  </>
                )}
              </button>
            </form>

            {generatedCert && (
              <div className="mt-6 pt-6 border-t border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Certificate ID:</span>
                  <span className="font-mono font-bold text-electric-blue">{generatedCert.certificateId}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Issued Date:</span>
                  <span className="font-semibold text-navy">22 August 2026</span>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-electric-blue" />
                  <h2 className="text-base font-bold text-navy">Certificate Preview</h2>
                </div>
                {generatedCert && (
                  <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ ID: {generatedCert.certificateId}
                  </span>
                )}
              </div>

              {/* Certificate Template Render */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex justify-center items-center overflow-hidden">
                <div style={{ width: '665px', height: '475px', overflow: 'hidden', position: 'relative' }}>
                  <CertificateTemplate
                    id="active-cert-preview-render"
                    data={generatedCert || {
                      certificateId: 'EKNK26-EUR-A7X92K',
                      participantName: participantName.trim() || 'Sufiyan Shaikh',
                      certificateType: certificateType
                    }}
                    scale={0.65}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS BELOW PREVIEW */}
              {generatedCert && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <button
                      onClick={handleDownloadPdf}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-navy hover:bg-navy-dark text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>

                    <button
                      onClick={handleDownloadImage}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-electric-blue hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Download Image
                    </button>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-navy font-semibold text-xs transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
                  </button>

                  <Link
                    href={`/verify/${generatedCert.certificateId}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-electric-blue text-electric-blue hover:bg-blue-50 font-semibold text-xs transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Verification</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
