import React from 'react';

export interface CertificateData {
  certificateId: string;
  participantName: string;
  certificateType?: 'Participation' | '1st Prize' | '2nd Prize' | '3rd Prize';
  eventName?: string;
  eventDate?: string;
  institution?: string;
  issuedBy?: string;
  baseUrl?: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  id?: string;
  scale?: number;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  data,
  id = "certificate-render-node",
  scale = 1
}) => {
  const {
    certificateId = 'EKNK26-EUR-A7X92K',
    participantName = 'SUFIYAN SHAIKH',
  } = data;

  const cleanName = (participantName || '').trim().toUpperCase();

  // Dynamic font size calculation based on name length
  const nameLength = cleanName.length;
  let nameFontSize = 'text-[32px] md:text-[34px]';
  if (nameLength > 30) {
    nameFontSize = 'text-[20px] md:text-[22px]';
  } else if (nameLength > 22) {
    nameFontSize = 'text-[24px] md:text-[26px]';
  } else if (nameLength > 16) {
    nameFontSize = 'text-[28px] md:text-[30px]';
  }

  return (
    <div
      id={id}
      className="certificate-container relative bg-white select-none overflow-hidden mx-auto"
      style={{
        width: '1024px',
        height: '731px',
        boxSizing: 'border-box',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif"
      }}
    >
      {/* LAYER 1: LOCKED MASTER CERTIFICATE IMAGE BACKGROUND */}
      <img
        src="/master-certificate-template.jpg"
        alt="E-Cell NKOCET Master Certificate Template"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
        style={{ width: '1024px', height: '731px' }}
      />

      {/* LAYER 2: DYNAMIC PARTICIPANT NAME (BALANCED POSITION Y=47.0%, SLIGHTLY DOWNWARD, PERFECT HORIZONTAL CENTER) */}
      <div 
        className="absolute z-20 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none w-[780px]"
        style={{
          top: '47.0%', // Adjusted slightly downward for optimal optical balance
        }}
      >
        <h2 
          className={`${nameFontSize} font-black text-center px-4 leading-none font-professional`}
          style={{ 
            color: '#071A33',
            fontFamily: "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}
        >
          {cleanName}
        </h2>
      </div>

      {/* LAYER 3: CERTIFICATE ID INSIDE CERTIFICATE FRAME (BOTTOM MARGIN) */}
      <div 
        className="absolute z-20 left-1/2 -translate-x-1/2 flex items-center pointer-events-none"
        style={{
          bottom: '26px'
        }}
      >
        <span 
          className="font-mono text-[10.5px] font-bold tracking-wider"
          style={{ 
            color: 'rgba(7, 26, 51, 0.75)',
            letterSpacing: '0.08em'
          }}
        >
          Certificate ID: <span className="font-semibold" style={{ color: '#1264FF' }}>{certificateId}</span>
        </span>
      </div>
    </div>
  );
};
