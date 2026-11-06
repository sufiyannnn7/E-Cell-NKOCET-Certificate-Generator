'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { getAllCertificatesFromDB, deleteCertificateFromDB, DBRecord } from '@/lib/certificateService';
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Trash2,
  AlertTriangle,
  X 
} from 'lucide-react';
import { CertificateTemplate } from '@/components/certificate/CertificateTemplate';
import { downloadPdfCertificate, downloadImageCertificate } from '@/lib/pdfGenerator';

export default function CertificatesHistoryPage() {
  const [certificates, setCertificates] = useState<DBRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<DBRecord | null>(null);
  const [certToDelete, setCertToDelete] = useState<DBRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllCertificatesFromDB();
    setCertificates(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/verify/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!certToDelete) return;
    setIsDeleting(true);
    await deleteCertificateFromDB(certToDelete.certificate_id);
    
    // Update local state immediately
    setCertificates(prev => prev.filter(c => c.certificate_id !== certToDelete.certificate_id));
    if (previewCert && previewCert.certificate_id === certToDelete.certificate_id) {
      setPreviewCert(null);
    }
    
    setCertToDelete(null);
    setIsDeleting(false);
  };

  const filtered = certificates.filter((cert) => {
    const matchesSearch =
      cert.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || cert.certificate_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-navy">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-navy">Certificates History</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              View, search, verify, download, and manage all issued certificates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-electric-blue w-64 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-navy font-bold cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Participation">Participation</option>
                <option value="1st Prize">1st Prize</option>
                <option value="2nd Prize">2nd Prize</option>
                <option value="3rd Prize">3rd Prize</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-gray-400">
              Loading certificate records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm font-semibold text-gray-400">
              No matching certificates found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-400 uppercase tracking-wider font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Certificate ID</th>
                    <th className="px-5 py-3.5">Participant Name</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Event Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((cert) => (
                    <tr key={cert.certificate_id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3.5 font-mono text-electric-blue font-bold">
                        {cert.certificate_id}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-navy">
                        {cert.participant_name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          cert.certificate_type === 'Participation' ? 'bg-blue-50 text-electric-blue' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cert.certificate_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {cert.event_date || '2026-08-22'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleCopyLink(cert.certificate_id)}
                          className="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-navy font-semibold transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === cert.certificate_id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <Link
                          href={`/verify/${cert.certificate_id}`}
                          target="_blank"
                          className="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-navy font-semibold transition-colors inline-flex items-center"
                          title="Verify Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="px-2.5 py-1.5 rounded bg-electric-blue hover:bg-blue-700 text-white font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> View
                        </button>

                        <button
                          onClick={() => setCertToDelete(cert)}
                          className="px-2 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors inline-flex items-center"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* COMPACT MODAL */}
        {previewCert && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-3xl w-full flex flex-col shadow-2xl border border-slate-200">
              
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-navy">
                    Certificate Preview — <span className="font-mono text-electric-blue">{previewCert.certificate_id}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {previewCert.participant_name} ({previewCert.certificate_type})
                  </p>
                </div>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-navy transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-slate-100 flex justify-center items-center overflow-hidden mb-4 shadow-inner">
                <div style={{ width: '615px', height: '439px', overflow: 'hidden', position: 'relative' }}>
                  <CertificateTemplate
                    id="history-cert-render"
                    data={{
                      certificateId: previewCert.certificate_id,
                      participantName: previewCert.participant_name,
                      certificateType: previewCert.certificate_type as any
                    }}
                    scale={0.6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => {
                    const toDel = previewCert;
                    setCertToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Certificate
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewCert(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      await downloadImageCertificate(
                        'history-cert-render',
                        previewCert.participant_name,
                        previewCert.certificate_id
                      );
                    }}
                    className="px-4 py-2.5 rounded-lg border border-electric-blue text-electric-blue hover:bg-blue-50 font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </button>
                  <button
                    onClick={async () => {
                      await downloadPdfCertificate(
                        'history-cert-render',
                        previewCert.participant_name,
                        previewCert.certificate_id
                      );
                    }}
                    className="px-5 py-2.5 rounded-lg bg-electric-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {certToDelete && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-navy tracking-tight">Delete Certificate?</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Are you sure you want to permanently delete the certificate for{' '}
                <span className="font-bold text-navy">{certToDelete.participant_name}</span> (ID:{' '}
                <span className="font-mono font-bold text-electric-blue">{certToDelete.certificate_id}</span>)?
                This action cannot be undone and verification for this ID will no longer be valid.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCertToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
