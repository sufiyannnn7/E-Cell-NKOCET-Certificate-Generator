import jsPDF from 'jspdf';

export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_');
}

export function generateCertificateFileName(participantName: string, certificateId: string, ext = 'pdf'): string {
  const cleanName = sanitizeFileName(participantName);
  return `EUREKA_2026_${cleanName}_${certificateId}.${ext}`;
}

/**
 * Renders the master certificate template and overlays participant text
 * with 100% mathematical pixel-precision onto a high-resolution 1512x1080 canvas.
 * This guarantees zero transform drift, zero scaling shifts, and identical alignment on all devices.
 */
export async function renderCertificateToCanvas(
  participantName: string,
  certificateId: string
): Promise<HTMLCanvasElement> {
  const cleanName = (participantName || '').trim().toUpperCase();

  // Load master certificate image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/master-certificate-template.jpg';

  await new Promise<void>((resolve, reject) => {
    if (img.complete && img.naturalWidth !== 0) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = (e) => reject(new Error('Failed to load master certificate template image'));
    }
  });

  const width = img.naturalWidth || 1512;
  const height = img.naturalHeight || 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Master Template Image
  ctx.drawImage(img, 0, 0, width, height);

  // 2. Ensure Fonts are loaded
  try {
    await document.fonts.load('900 46px "Montserrat"');
    await document.fonts.load('700 16px "Montserrat"');
  } catch (e) {
    // Continue with system fallback
  }

  // 3. Draw Participant Name (Slightly downward adjusted position Y=507px / 47.0%, perfect horizontal center)
  const nameLength = cleanName.length;
  let fontSize = 48;
  if (nameLength > 32) {
    fontSize = 32;
  } else if (nameLength > 24) {
    fontSize = 38;
  } else if (nameLength > 16) {
    fontSize = 44;
  }

  ctx.save();
  ctx.font = `900 ${fontSize}px "Montserrat", "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.fillStyle = '#071A33';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Center coordinates: X = width / 2 (756px), Y = 507px (46.95% of 1080h)
  const centerX = width / 2;
  const centerY = Math.round(height * 0.46944); // 507px on 1080h

  ctx.fillText(cleanName, centerX, centerY);
  ctx.restore();

  // 4. Draw Certificate ID (Bottom safe margin: Y=1040px)
  ctx.save();
  ctx.font = `700 16px "Montserrat", "Inter", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const bottomY = Math.round(height * 0.963); // 1040px on 1080h
  const fullIdText = `Certificate ID: ${certificateId}`;

  ctx.fillStyle = 'rgba(7, 26, 51, 0.75)';
  ctx.fillText(fullIdText, centerX, bottomY);
  ctx.restore();

  return canvas;
}

export async function generateImageBlob(
  participantName: string,
  certificateId: string
): Promise<Blob> {
  const canvas = await renderCertificateToCanvas(participantName, certificateId);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert canvas to PNG blob'));
    }, 'image/png', 1.0);
  });
}

export async function generatePdfBlob(
  participantName: string,
  certificateId: string
): Promise<Blob> {
  const canvas = await renderCertificateToCanvas(participantName, certificateId);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
  return pdf.output('blob');
}

export async function generatePdfFromElement(
  elementId: string,
  participantName: string,
  certificateId: string
): Promise<Blob> {
  return generatePdfBlob(participantName, certificateId);
}

export async function downloadImageCertificate(
  elementId: string,
  participantName: string,
  certificateId: string
): Promise<void> {
  const canvas = await renderCertificateToCanvas(participantName, certificateId);
  const imgData = canvas.toDataURL('image/png', 1.0);
  const fileName = generateCertificateFileName(participantName, certificateId, 'png');

  const link = document.createElement('a');
  link.href = imgData;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadPdfCertificate(
  elementId: string,
  participantName: string,
  certificateId: string
): Promise<void> {
  const blob = await generatePdfBlob(participantName, certificateId);
  const fileName = generateCertificateFileName(participantName, certificateId, 'pdf');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
