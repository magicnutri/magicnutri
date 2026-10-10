import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { MagicNutriLogo } from './MagicNutriLogo';
import { X, QrCode, Download, ExternalLink, Printer } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: (table?: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('Counter / General');

  useEffect(() => {
    if (!isOpen) return;

    // Construct the live URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://magicnutri.in';
    const targetUrl = selectedTable === 'Counter / General'
      ? `${baseUrl}/`
      : `${baseUrl}/?table=${encodeURIComponent(selectedTable)}`;

    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#4A2414', // Brand deep brown
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [isOpen, selectedTable]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `MagicNutri-QR-${selectedTable.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-sm bg-[#FFFDF9] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden print:border-none print:shadow-none">
        {/* Header (hidden in print) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/60 bg-[#FFF7E8] print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#F47B16]" />
            <h3 className="text-sm font-bold text-[#4A2414] uppercase tracking-wide">
              Shop Table QR Code
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Table selector (hidden in print) */}
          <div className="mb-4 print:hidden text-left">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Select Placement:
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 focus:ring-1 focus:ring-[#F47B16]"
            >
              <option value="Counter / General">Counter / Storefront Display</option>
              <option value="Table 1">Table 1 (Dine-in)</option>
              <option value="Table 2">Table 2 (Dine-in)</option>
              <option value="Table 3">Table 3 (Dine-in)</option>
              <option value="Table 4">Table 4 (Dine-in)</option>
              <option value="Table 5">Table 5 (Dine-in)</option>
              <option value="Table 6">Table 6 (Dine-in)</option>
              <option value="Takeaway Pickup Stand">Takeaway Pickup Stand</option>
            </select>
          </div>

          {/* Printable Stand Frame */}
          <div className="p-4 bg-white rounded-2xl border-2 border-[#F47B16]/30 shadow-md inline-block">
            <div className="flex flex-col items-center justify-center mb-2">
              <MagicNutriLogo variant="full" size="sm" className="scale-85 -my-2" />
            </div>

            <p className="text-[11px] font-bold text-[#4A2414] uppercase tracking-wider mb-2">
              Scan to Order & Win Scratch Rewards
            </p>

            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Magic Nutri Shop QR Code"
                className="w-48 h-48 mx-auto rounded-lg shadow-xs"
              />
            )}

            <div className="mt-2 text-xs font-bold text-[#4A2414]">
              {selectedTable}
            </div>
            <p className="text-[10px] text-stone-500 mt-0.5">
              Pay at Counter • Instant 20–50 Points
            </p>
          </div>

          {/* Action buttons (hidden in print) */}
          <div className="mt-5 space-y-2 print:hidden">
            <button
              onClick={() => {
                onSimulateScan(selectedTable);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256628] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Simulate Customer Scanning This QR</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-3 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Image</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2 px-3 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
