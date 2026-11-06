'use client';

import React, { useEffect, useState, use } from 'react';
import { getCertificateFromDB, DBRecord } from '@/lib/certificateService';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Loader2
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    certificateId: string;
  }>;
}

export default function VerifyCertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const certificateId = resolvedParams.certificateId;

  const [cert, setCert] = useState<DBRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      setLoading(true);
      const data = await getCertificateFromDB(certificateId);
      setCert(data);
      setLoading(false);
    }
    verify();
  }, [certificateId]);

  const isValid = cert && cert.verification_status === 'valid';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-electric-blue">
      {/* HEADER */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-electric-blue flex items-center justify-center font-bold text-white shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white">E-CELL NKOCET</h1>
            <p className="text-[11px] text-gray-400 font-medium">Official Verification System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-electric-blue" />
            2026 Verification Portal
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto w-full my-8">
        {loading ? (
          <div className="bg-slate-800/90 border border-white/10 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-md">
            <Loader2 className="w-10 h-10 animate-spin text-electric-blue mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Verifying Certificate Authenticity...</h2>
            <p className="text-xs text-gray-400 mt-2 font-mono">{certificateId}</p>
          </div>
        ) : isValid ? (
          <div className="bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            
            {/* VERIFIED BADGE HEADER */}
            <div className="flex flex-col items-center text-center pb-8 border-b border-white/10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Official Record
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                ✓ CERTIFICATE VERIFIED
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                This document is authentic and officially issued by E-Cell NKOCET.
              </p>
            </div>

            {/* RECORD DETAILS GRID */}
            <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Participant Name</span>
                <p className="text-xl font-black text-white">{cert.participant_name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Certificate Type</span>
                <p className="text-lg font-bold text-electric-blue">
                  {cert.certificate_type === 'Participation' ? 'Certificate of Participation' : `Certificate of Achievement (${cert.certificate_type})`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Event Name</span>
                <p className="text-sm font-semibold text-gray-200">{cert.event_name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Certificate ID</span>
                <p className="text-sm font-mono font-bold text-electric-blue bg-electric-blue/10 px-2.5 py-1 rounded border border-electric-blue/20 w-fit">
                  {cert.certificate_id}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Issue Date</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
                  <Calendar className="w-4 h-4 text-electric-blue" />
                  <span>22 August 2026</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Issued By</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
                  <Building2 className="w-4 h-4 text-electric-blue" />
                  <span>{cert.issued_by}</span>
                </div>
              </div>
            </div>

            {/* INSTITUTION FOOTER */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center">
              <p className="text-xs font-semibold text-gray-300">{cert.institution}</p>
            </div>
          </div>
        ) : (
          /* NOT FOUND / INVALID STATE */
          <div className="bg-slate-800/90 border border-red-500/30 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-500/10">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ✕ CERTIFICATE NOT FOUND
            </h2>
            <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto leading-relaxed">
              This certificate ID <span className="font-mono text-red-400 font-bold">{certificateId}</span> could not be verified in the official E-Cell NKOCET database.
            </p>
            <div className="mt-8 pt-6 border-t border-white/10 text-xs text-gray-400">
              If you believe this is an error, please contact the E-Cell NKOCET Tech Team at <span className="text-white font-semibold">admin@nkocet.ac.in</span>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-gray-500 py-4 border-t border-white/10">
        © 2026 E-Cell NKOCET • N. K. Orchid College of Engineering & Technology, Solapur.
      </footer>
    </div>
  );
}
