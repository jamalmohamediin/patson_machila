import { useCallback, useMemo, useState } from 'react';
import headerLogo from './src/assets/header-logo.png';

const INVOICE_ROWS = [
  { description: 'ATTENDANCE AT OPERATION', tariff: '39179' },
  { description: 'ATTENDANCE AT OPERATION', tariff: '3607' },
  { description: 'CHEST (ITEM 167 INC.)', tariff: '39107' },
  { description: 'DISCOGRAPHY', tariff: '39125' },
  { description: 'FINGER, TOE', tariff: '39001' },
  { description: 'FLUOROSCOPY: PER HALF HOUR', tariff: '3601' },
  { description: 'FLUOROSCOPY: PER HALF HOUR', tariff: '39167' },
  { description: 'LIMB PER REGION', tariff: '39003' },
  { description: 'PELVIS (SIJ OR HIP)', tariff: '39027' },
  { description: 'PER REGION, E.G. CERVICAL', tariff: '39017' },
  { description: 'RETROGRADE PYELOGRAPHY', tariff: '39137' },
  { description: 'THEATRE INVESTIGATION', tariff: '39187' },
  { description: 'VASCULAR STUDY', tariff: '39199' },
  { description: 'WHERE C-ARM PORTABLE UNIT IS USED', tariff: '3602' },
  { description: 'WHERE C-ARM PORTABLE UNIT IS USED', tariff: '39169' },
  { description: 'ERCP + STENT', tariff: '39085' },
  { description: 'INTRA-OPERATIVE CHOLANGIOGRAM', tariff: '39095' },
  { description: 'PERMANENT DIALYSIS CATHETER/CHEMO PORT', tariff: '39107' },
  { description: 'OESOPHAGEAL/DUODENAL/COLON DILATATION', tariff: '39087' },
];

const PatsonMachilaTemplate = () => {
  const [activeTemplate, setActiveTemplate] = useState('referral');
  const [stickerImage, setStickerImage] = useState(null);
  const [stickerCropSrc, setStickerCropSrc] = useState(null);
  const [stickerCropZoom, setStickerCropZoom] = useState(1);
  const [stickerCropX, setStickerCropX] = useState(0);
  const [stickerCropY, setStickerCropY] = useState(0);
  const [doctorSignatureImage, setDoctorSignatureImage] = useState(null);
  const [doctorSigCropSrc, setDoctorSigCropSrc] = useState(null);
  const [doctorSigCropZoom, setDoctorSigCropZoom] = useState(1);
  const [doctorSigCropX, setDoctorSigCropX] = useState(0);
  const [doctorSigCropY, setDoctorSigCropY] = useState(0);
  const [invoiceAmounts, setInvoiceAmounts] = useState(
    () => INVOICE_ROWS.map(() => '')
  );

  const generatePDF = useCallback(() => {
    const templateId = activeTemplate === 'invoice' ? 'invoice-container' : 'form-container';
    const element = document.getElementById(templateId);
    if (!element || !window.html2pdf) {
      return;
    }

    const formatDateLong = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const formatDateShort = (date) => {
      const months = [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
      ];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const formatDateForFilename = (value) => {
      if (!value) {
        return '';
      }
      const trimmed = value.trim();
      if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
        const [day, month, year] = trimmed.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        const months = [
          'JAN',
          'FEB',
          'MAR',
          'APR',
          'MAY',
          'JUN',
          'JUL',
          'AUG',
          'SEP',
          'OCT',
          'NOV',
          'DEC',
        ];
        const monthName = months[monthIndex] || month;
        return `${day} ${monthName} ${year}`;
      }
      if (/^\d{2}\s\d{2}\s\d{4}$/.test(trimmed)) {
        const [day, month, year] = trimmed.split(' ');
        const monthIndex = parseInt(month, 10) - 1;
        const months = [
          'JAN',
          'FEB',
          'MAR',
          'APR',
          'MAY',
          'JUN',
          'JUL',
          'AUG',
          'SEP',
          'OCT',
          'NOV',
          'DEC',
        ];
        const monthName = months[monthIndex] || month;
        return `${day} ${monthName} ${year}`;
      }
      return trimmed;
    };
    const isInvoice = activeTemplate === 'invoice';
    const dateInput = element.querySelector(
      `input[name="${isInvoice ? 'invoiceDate' : 'referralDate'}"]`
    );
    const patientNameInput = element.querySelector(
      `input[name="${isInvoice ? 'invoicePatientName' : 'patientName'}"]`
    );
    const idNumberInput = element.querySelector(
      `input[name="${isInvoice ? 'invoiceAccountNumber' : 'idNumber'}"]`
    );
    const today = new Date();
    const dateValue = dateInput && dateInput.value ? dateInput.value : formatDateLong(today);
    const fileDate = dateInput && dateInput.value ? formatDateForFilename(dateInput.value) : formatDateShort(today);
    const nameValue = patientNameInput && patientNameInput.value ? patientNameInput.value.trim() : 'PATIENT';
    const idValue = idNumberInput && idNumberInput.value ? idNumberInput.value.trim() : 'ID';

    const opt = {
      margin: 0,
      filename: `${nameValue} ${fileDate} ${idValue}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(element).save();
  }, [activeTemplate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const processStickerFile = (file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setStickerCropSrc(event.target.result);
      setStickerCropZoom(1);
      setStickerCropX(0);
      setStickerCropY(0);
    };
    reader.readAsDataURL(file);
  };

  const handleStickerUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      processStickerFile(file);
    }
  };

  const captureSticker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) {
        processStickerFile(file);
      }
    };
    input.click();
  };

  const applyStickerCrop = () => {
    if (!stickerCropSrc) {
      return;
    }
    const img = new Image();
    img.onload = () => {
      const targetWidth = 180;
      const targetHeight = 120;
      const targetRatio = targetWidth / targetHeight;
      const imageRatio = img.width / img.height;
      const zoom = Math.max(1, stickerCropZoom);
      let sw;
      let sh;

      if (imageRatio > targetRatio) {
        sh = img.height / zoom;
        sw = sh * targetRatio;
      } else {
        sw = img.width / zoom;
        sh = sw / targetRatio;
      }

      const maxOffsetX = (img.width - sw) / 2;
      const maxOffsetY = (img.height - sh) / 2;
      const offsetX = (stickerCropX / 100) * maxOffsetX;
      const offsetY = (stickerCropY / 100) * maxOffsetY;
      const sx = (img.width - sw) / 2 + offsetX;
      const sy = (img.height - sh) / 2 + offsetY;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
      setStickerImage(canvas.toDataURL('image/png'));
      setStickerCropSrc(null);
    };
    img.src = stickerCropSrc;
  };

  const cancelStickerCrop = () => {
    setStickerCropSrc(null);
  };

  const setTodayDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const input = document.querySelector('input[name="referralDate"]');
    if (input) {
      input.value = `${day}-${month}-${year}`;
    }
  };

  const handleDoctorSignatureUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setDoctorSigCropSrc(e.target.result);
      setDoctorSigCropZoom(1);
      setDoctorSigCropX(0);
      setDoctorSigCropY(0);
    };
    reader.readAsDataURL(file);
  };

  const captureDoctorSignature = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setDoctorSigCropSrc(e.target.result);
        setDoctorSigCropZoom(1);
        setDoctorSigCropX(0);
        setDoctorSigCropY(0);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const applyDoctorSignatureCrop = () => {
    if (!doctorSigCropSrc) {
      return;
    }
    const img = new Image();
    img.onload = () => {
      const targetWidth = 460;
      const targetHeight = 180;
      const zoom = Math.max(1, doctorSigCropZoom);
      const sw = img.width / zoom;
      const sh = img.height / zoom;
      const maxOffsetX = (img.width - sw) / 2;
      const maxOffsetY = (img.height - sh) / 2;
      const offsetX = (doctorSigCropX / 100) * maxOffsetX;
      const offsetY = (doctorSigCropY / 100) * maxOffsetY;
      const sx = (img.width - sw) / 2 + offsetX;
      const sy = (img.height - sh) / 2 + offsetY;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const drawRatio = sw / sh;
      let dw = targetWidth;
      let dh = targetHeight;
      if (drawRatio > targetWidth / targetHeight) {
        dh = targetWidth / drawRatio;
      } else {
        dw = targetHeight * drawRatio;
      }
      const dx = (targetWidth - dw) / 2;
      const dy = (targetHeight - dh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      setDoctorSignatureImage(canvas.toDataURL('image/png'));
      setDoctorSigCropSrc(null);
    };
    img.src = doctorSigCropSrc;
  };

  const cancelDoctorSignatureCrop = () => {
    setDoctorSigCropSrc(null);
  };

  const invoiceTotal = useMemo(() => {
    const total = invoiceAmounts.reduce((sum, value) => {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? sum : sum + parsed;
    }, 0);
    return total ? total.toFixed(2) : '';
  }, [invoiceAmounts]);

  const handleInvoiceAmountChange = (index, value) => {
    setInvoiceAmounts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const setInvoiceTodayDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const input = document.querySelector('input[name="invoiceDate"]');
    if (input) {
      input.value = `${day}-${month}-${year}`;
    }
  };

  return (
    <>
      <style>
        {`
          :root {
            --form-width: 800px;
            --form-padding: 40px;
          }

          body {
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Container for the page */
          #form-container,
          #invoice-container {
            background-color: white;
            width: 100%;
            max-width: var(--form-width);
            min-height: 1050px;
            padding: var(--form-padding);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            position: relative;
            box-sizing: border-box;
          }

          /* Template switch */
          .template-switch {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
          }

          .template-tab {
            padding: 8px 14px;
            font-size: 13px;
            background: #e0e0e0;
            color: #000;
            border: 1px solid #000;
            border-radius: 4px;
            box-shadow: none;
          }

          .template-tab:hover {
            background: #d6d6d6;
          }

          .template-tab.active {
            background: #000;
            color: #fff;
          }

          /* Header Section */
          .header-box {
            border: 1px solid #333;
            border-radius: 15px;
            padding: 2px 15px 10px;
            margin-bottom: 30px;
          }

          .header-top {
            display: grid;
            grid-template-columns: 30% 40% 30%;
            align-items: start;
            margin-bottom: -4px;
          }

          .header-logo {
            width: 120px;
            height: auto;
            display: block;
          }

          .header-center {
            text-align: center;
          }

          .header-center h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
            font-weight: 600;
            font-family: 'Times New Roman', Times, serif;
          }

          .header-center h2 {
            margin: 2px 0 0;
            font-size: 14px;
            font-weight: normal;
          }

          .header-grid {
            display: grid;
            grid-template-columns: 30% 40% 30%;
            row-gap: 2px;
            margin-top: -34px;
            font-size: 11px;
            line-height: 1.3;
            text-align: left;
            justify-items: start;
          }

          .header-cell {
            white-space: nowrap;
          }

          .header-center-text {
            text-align: center;
            justify-self: center;
          }

          .header-right-text {
            text-align: right;
          }

          .header-contact {
            justify-self: end;
            text-align: left;
          }

          /* Form Body Styles */
          h3.title {
            text-decoration: underline;
            font-size: 16px;
            margin-bottom: 25px;
            text-transform: uppercase;
          }

          .row {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-end;
          }

          .field-label {
            font-size: 13px;
            text-transform: uppercase;
            white-space: nowrap;
            margin-right: 8px;
          }

          input[type='text'],
          input[type='date'],
          input[type='email'] {
            border: none;
            border-bottom: 1px solid #000;
            flex-grow: 1;
            padding: 2px 5px;
            font-size: 14px;
            outline: none;
            background: transparent;
          }

          .col-2 {
            display: flex;
            width: 100%;
            gap: 20px;
          }

          .col-2 > div {
            flex: 1;
            display: flex;
            align-items: flex-end;
          }

          .sticker-box {
            position: absolute;
            right: 80px;
            top: 250px;
            width: 180px;
            font-size: 10px;
            color: #444;
            height: 170px;
          }

          .sticker-title {
            text-align: center;
            font-size: 10px;
            margin-top: 90px;
            margin-bottom: 2px;
            text-transform: uppercase;
            color: #666;
          }

          .sticker-frame {
            width: 180px;
            height: 120px;
            position: relative;
          }

          .sticker-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .sticker-controls {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-top: 6px;
            position: absolute;
            top: 120px;
            left: 0;
            right: 0;
          }

          .sticker-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .sticker-modal-content {
            background: #fff;
            border: 1px solid #000;
            padding: 16px;
            width: 360px;
          }

          .sticker-crop-frame {
            width: 240px;
            height: 160px;
            margin: 0 auto 12px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            border: 1px solid #000;
          }

          .sticker-crop-controls {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            font-size: 12px;
          }

          .sticker-crop-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
          }

          .sticker-crop-actions button {
            padding: 6px 10px;
            font-size: 12px;
          }

          .sticker-button {
            border: 1px solid #000;
            background: #fff;
            color: #000;
            font-size: 10px;
            padding: 2px 6px;
            cursor: pointer;
          }

          .sticker-remove {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 16px;
            height: 16px;
            border: none;
            background: #000;
            color: #fff;
            font-size: 10px;
            cursor: pointer;
          }

          .procedure-container {
            margin-top: 20px;
            display: flex;
            align-items: flex-start;
          }

          .procedure-box {
            border: 1px solid #000;
            width: 100%;
            height: 80px;
            margin-left: 10px;
            padding: 10px;
            resize: none;
            font-family: inherit;
          }

          .bottom-sections {
            margin-top: 30px;
          }

          /* Signatures */
          .signatures {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 80px;
            row-gap: 2px;
            align-items: start;
          }

          .signature-left,
          .signature-right {
            text-align: center;
            width: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 160px;
          }

          .signature-left {
            justify-self: start;
          }

          .signature-right {
            justify-self: end;
            align-items: center;
            text-align: center;
            position: relative;
          }

          .signature-area {
            height: 100px;
            margin-bottom: 6px;
            width: 100%;
            overflow: hidden;
            position: relative;
          }

          .signature-area img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          .signature-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          .signature-controls {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-bottom: 0;
          }

          .signature-crop-frame {
            width: 280px;
            height: 110px;
            margin: 0 auto 12px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            border: 1px solid #000;
          }

          .date-row {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 300px;
          }

          .today-button {
            border: 1px solid #000;
            background: #fff;
            color: #000;
            font-size: 11px;
            padding: 2px 6px;
            cursor: pointer;
          }
          .signature-row {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            justify-content: center;
          }

          .signature-label {
            border: 1px solid #000;
            height: 30px;
            margin-top: 2px;
            background-color: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #888;
            text-transform: uppercase;
            width: 230px;
          }

          .signature-button {
            border: 1px solid #000;
            background: #fff;
            color: #000;
            font-size: 10px;
            padding: 2px 6px;
            cursor: pointer;
          }

          .signature-remove {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 16px;
            height: 16px;
            border: none;
            background: #000;
            color: #fff;
            font-size: 10px;
            cursor: pointer;
          }

          .sig-line {
            border: 1px solid #000;
            height: 30px;
            margin-bottom: 5px;
            background-color: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #888;
            text-transform: uppercase;
            width: 230px;
          }

          .radiographer-name {
            font-family: 'Brush Script MT', cursive;
            font-size: 20px;
            position: absolute;
            top: 120px;
            left: 0;
            right: 0;
            line-height: normal;
            color: #0b1b3b;
            display: block;
          }

          /* Controls */
          .controls {
            margin-bottom: 20px;
            position: sticky;
            top: 20px;
            z-index: 100;
          }

          button {
            padding: 12px 25px;
            background-color: #000;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          button:hover {
            background-color: #222;
          }

          .bottom-print {
            margin-top: 30px;
            display: flex;
            justify-content: center;
          }

          /* Invoice template */
          .invoice-container {
            font-size: 12px;
            text-transform: uppercase;
          }

          .invoice-date-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .invoice-label {
            min-width: 150px;
            font-size: 12px;
          }

          .invoice-line-input {
            border: none;
            border-bottom: 1px dotted #444;
            flex: 1;
            font-size: 12px;
            padding: 2px 4px;
            background: transparent;
          }

          .invoice-line-input.short {
            flex: 0 0 50%;
            max-width: 50%;
          }

          .invoice-line-input.no-line {
            border-bottom: none;
          }

          .invoice-section-title {
            font-size: 12px;
            margin: 10px 0 8px;
            text-decoration: underline;
          }

          .invoice-detail-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
          }

          .invoice-table {
            margin-top: 18px;
            border-top: 1px solid #000;
          }

          .invoice-table-header {
            display: grid;
            grid-template-columns: 52% 12% 10% 12% 14%;
            column-gap: 8px;
            font-size: 11px;
            padding: 6px 0 4px;
            border-bottom: 1px solid #000;
          }

          .invoice-table-row {
            display: grid;
            grid-template-columns: 52% 12% 10% 12% 14%;
            column-gap: 8px;
            align-items: center;
            font-size: 11px;
            padding: 4px 0;
          }

          .invoice-table-row input {
            width: 100%;
            border: none;
            border-bottom: 1px dotted #444;
            background: transparent;
            font-size: 11px;
            text-align: center;
            padding: 1px 2px;
          }

          .invoice-total-row {
            display: grid;
            grid-template-columns: 52% 12% 10% 12% 14%;
            column-gap: 8px;
            align-items: center;
            margin-top: 24px;
            font-size: 11px;
          }

          .invoice-total-row input {
            width: 100%;
            border: none;
            border-bottom: 1px dotted #444;
            background: transparent;
            font-size: 12px;
            text-align: right;
            padding: 2px 4px;
          }

          /* Hide inputs for PDF conversion but keep text */
          @media print {
            html,
            body {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }
            @page {
              size: A4;
              margin: 0;
            }
            .controls {
              display: none;
            }
            body {
              padding: 0;
              margin: 0;
            }
            #form-container,
            #invoice-container {
              box-shadow: none;
              width: 210mm;
              height: 297mm;
              min-height: 0;
              padding: 10mm;
              transform: scale(0.75);
              transform-origin: top left;
            }
            .sticker-controls,
            .signature-controls,
            .today-button {
              display: none !important;
            }
            .signatures {
              margin-top: -60px;
            }
            .signature-left,
            .signature-right {
              min-height: 140px;
            }
            .signature-area {
              margin-top: 60px;
            }
            .radiographer-name {
              top: 120px;
            }
            .template-switch {
              display: none;
            }
            .bottom-print {
              display: none;
            }
          }

          @media (max-width: 900px) {
            :root {
              --form-padding: 20px;
            }

            body {
              padding: 10px;
            }

            .header-top {
              grid-template-columns: 1fr;
              row-gap: 8px;
              justify-items: center;
            }

            .header-grid {
              grid-template-columns: 1fr;
              row-gap: 6px;
              text-align: center;
            }

            .header-contact,
            .header-right-text {
              justify-self: center;
              text-align: center;
            }

            .col-2 {
              flex-direction: column;
              gap: 12px;
            }

            .row {
              width: 100% !important;
            }

            .procedure-container {
              flex-direction: column;
            }

            .procedure-box {
              margin-left: 0;
              margin-top: 8px;
            }

            .sticker-box {
              position: static;
              margin-top: 20px;
            }

            .invoice-table {
              overflow-x: auto;
            }

            .invoice-table-header,
            .invoice-table-row,
            .invoice-total-row {
              min-width: 620px;
            }
          }
        `}
      </style>

      <div className="controls">
        <div className="template-switch">
          <button
            type="button"
            className={`template-tab ${activeTemplate === 'referral' ? 'active' : ''}`}
            onClick={() => setActiveTemplate('referral')}
          >
            Referral Template
          </button>
          <button
            type="button"
            className={`template-tab ${activeTemplate === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveTemplate('invoice')}
          >
            Invoice Template
          </button>
        </div>
        <button type="button" onClick={generatePDF}>
          Create PDF Document
        </button>
        <button type="button" onClick={handlePrint} style={{ marginLeft: '10px' }}>
          Print
        </button>
      </div>

      {activeTemplate === 'referral' ? (
      <div id="form-container">
        <div className="header-box">
          <div className="header-top">
            <div>
              <img src={headerLogo} alt="Taurus Imaging logo" className="header-logo" />
            </div>
            <div className="header-center">
              <h1>PATSON MACHILA</h1>
              <h2>DIAGNOSTIC RADIOGRAPHER</h2>
            </div>
            <div></div>
          </div>
          <div className="header-grid">
            <div className="header-cell">14 Windermere Court</div>
            <div className="header-cell header-center-text">DIP RAD (EHC, LSK/ZM)</div>
            <div className="header-cell header-contact">Cell: 0814663557</div>
            <div className="header-cell">15 St James Road</div>
            <div className="header-cell header-center-text">HPCSA: DR0054070</div>
            <div className="header-cell header-contact">0652808581</div>
            <div className="header-cell">BELGRAVIA 5201</div>
            <div className="header-cell header-center-text">PN: 39000 3900061</div>
            <div className="header-cell header-right-text"></div>
            <div className="header-cell">EAST LONDON</div>
            <div className="header-cell"></div>
            <div className="header-cell header-contact">Email: machona.machila@gmail.com</div>
          </div>
        </div>

        <h3 className="title">Referral for Intraoperative Fluoroscopy</h3>

        <div className="row date-row">
          <span className="field-label">Date:</span>
          <input type="text" name="referralDate" placeholder="" />
          <button type="button" className="today-button print:hidden" onClick={setTodayDate}>
            Today
          </button>
        </div>

        <div className="row" style={{ width: '380px' }}>
          <span className="field-label">Patient Name:</span>
          <input type="text" name="patientName" />
        </div>

        <div className="row" style={{ width: '300px' }}>
          <span className="field-label">ID Number:</span>
          <input type="text" name="idNumber" />
        </div>

        <div className="row" style={{ width: '300px' }}>
          <span className="field-label">Dependant Code:</span>
          <input type="text" />
        </div>

        <div className="row" style={{ width: '400px' }}>
          <span className="field-label">Cell/Contact Number:</span>
          <input type="text" />
        </div>

        <div className="row">
          <span className="field-label">E-Mail Address:</span>
          <input type="email" />
        </div>

        <div className="col-2">
          <div className="row">
            <span className="field-label">Residential Address:</span>
            <input type="text" />
          </div>
          <div className="row">
            <span className="field-label">Postal Address:</span>
            <input type="text" />
          </div>
        </div>

        <div className="col-2">
          <div className="row">
            <span className="field-label">Main Member Name:</span>
            <input type="text" />
          </div>
          <div className="row">
            <span className="field-label">Main Member ID No:</span>
            <input type="text" />
          </div>
        </div>

        <div className="col-2">
          <div className="row">
            <span className="field-label">Medical Aid:</span>
            <input type="text" />
          </div>
          <div className="row">
            <span className="field-label">Membership Number:</span>
            <input type="text" />
          </div>
        </div>

        <div className="col-2">
          <div className="row">
            <span className="field-label">Next of Kin Details Name:</span>
            <input type="text" />
          </div>
          <div className="row">
            <span className="field-label">Contact Number:</span>
            <input type="text" />
          </div>
        </div>

        <div className="sticker-box">
          {!stickerImage && <div className="sticker-title">Sticker</div>}
          <div className="sticker-frame">
            {stickerImage ? (
              <>
                <img src={stickerImage} alt="Patient sticker" className="sticker-preview" />
                <button
                  type="button"
                  onClick={() => setStickerImage(null)}
                  className="sticker-remove print:hidden"
                >
                  x
                </button>
              </>
            ) : (
              <div className="sticker-preview" aria-label="Sticker placeholder" />
            )}
          </div>
          {!stickerImage && (
            <div className="sticker-controls print:hidden">
              <label className="sticker-button">
                Upload
                <input type="file" accept="image/*" onChange={handleStickerUpload} hidden />
              </label>
              <button type="button" className="sticker-button" onClick={captureSticker}>
                Photo
              </button>
            </div>
          )}
        </div>

        {stickerCropSrc && (
          <div className="sticker-modal">
            <div className="sticker-modal-content">
              <div
                className="sticker-crop-frame"
                style={{
                  backgroundImage: `url(${stickerCropSrc})`,
                  backgroundSize: `${stickerCropZoom * 100}%`,
                  backgroundPosition: `${50 + stickerCropX / 2}% ${50 + stickerCropY / 2}%`,
                }}
              />
              <div className="sticker-crop-controls">
                <label>
                  Zoom
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={stickerCropZoom}
                    onChange={(e) => setStickerCropZoom(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Horizontal
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={stickerCropX}
                    onChange={(e) => setStickerCropX(parseInt(e.target.value, 10))}
                  />
                </label>
                <label>
                  Vertical
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={stickerCropY}
                    onChange={(e) => setStickerCropY(parseInt(e.target.value, 10))}
                  />
                </label>
              </div>
              <div className="sticker-crop-actions">
                <button type="button" onClick={cancelStickerCrop}>
                  Cancel
                </button>
                <button type="button" onClick={applyStickerCrop}>
                  Use Sticker
                </button>
              </div>
            </div>
          </div>
        )}

        {doctorSigCropSrc && (
          <div className="sticker-modal">
            <div className="sticker-modal-content">
              <div
                className="signature-crop-frame"
                style={{
                  backgroundImage: `url(${doctorSigCropSrc})`,
                  backgroundSize: doctorSigCropZoom === 1 ? 'contain' : `${doctorSigCropZoom * 100}%`,
                  backgroundPosition: `${50 + doctorSigCropX / 2}% ${50 + doctorSigCropY / 2}%`,
                }}
              />
              <div className="sticker-crop-controls">
                <label>
                  Zoom
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={doctorSigCropZoom}
                    onChange={(e) => setDoctorSigCropZoom(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Horizontal
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={doctorSigCropX}
                    onChange={(e) => setDoctorSigCropX(parseInt(e.target.value, 10))}
                  />
                </label>
                <label>
                  Vertical
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={doctorSigCropY}
                    onChange={(e) => setDoctorSigCropY(parseInt(e.target.value, 10))}
                  />
                </label>
              </div>
              <div className="sticker-crop-actions">
                <button type="button" onClick={cancelDoctorSignatureCrop}>
                  Cancel
                </button>
                <button type="button" onClick={applyDoctorSignatureCrop}>
                  Use Signature
                </button>
              </div>
            </div>
          </div>
        )}


        <div className="procedure-container">
          <span className="field-label">Procedure</span>
          <textarea className="procedure-box" />
        </div>

        <div className="bottom-sections">
          <div className="row" style={{ width: '450px' }}>
            <span className="field-label">ICD10 Codes</span>
            <input type="text" />
          </div>

          <div className="row" style={{ width: '450px' }}>
            <span className="field-label">Time C-Arm Taken Into Theatre:</span>
            <input type="text" />
          </div>

          <div className="row" style={{ width: '450px' }}>
            <span className="field-label">Time C-Arm Taken Out Of Theatre:</span>
            <input type="text" />
          </div>

          <div className="row" style={{ width: '450px', marginBottom: '0' }}>
            <span className="field-label">Fluoroscopy Time:</span>
            <input type="text" />
            <span style={{ fontSize: '12px', marginLeft: '10px' }}>Min/Sec</span>
          </div>
        </div>

        <div className="signatures">
          <div className="signature-left">
            <div className="signature-area">
              {doctorSignatureImage ? (
                <>
                  <img src={doctorSignatureImage} alt="Doctor signature" />
                  <button
                    type="button"
                    onClick={() => setDoctorSignatureImage(null)}
                    className="signature-remove print:hidden"
                  >
                    x
                  </button>
                </>
              ) : null}
            </div>
            {!doctorSignatureImage && (
              <div className="signature-controls print:hidden">
                <label className="signature-button">
                  Upload
                  <input type="file" accept="image/*" onChange={handleDoctorSignatureUpload} hidden />
                </label>
                <button type="button" className="signature-button" onClick={captureDoctorSignature}>
                  Photo
                </button>
              </div>
            )}
          </div>
          <div className="signature-right">
            <div className="radiographer-name">P.M. Machila</div>
          </div>
          <div className="signature-left">
            <div className="signature-label">Requesting Doctor's Signature</div>
          </div>
          <div className="signature-right">
            <div className="sig-line">Radiographer Signature</div>
          </div>
        </div>
        <div className="bottom-print">
          <button type="button" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
      ) : (
        <div id="invoice-container" className="invoice-container">
          <div className="header-box">
            <div className="header-top">
              <div>
                <img src={headerLogo} alt="Taurus Imaging logo" className="header-logo" />
              </div>
              <div className="header-center">
                <h1>PATSON MACHILA</h1>
                <h2>DIAGNOSTIC RADIOGRAPHER</h2>
              </div>
              <div></div>
            </div>
            <div className="header-grid">
              <div className="header-cell">14 Windermere Court</div>
              <div className="header-cell header-center-text">DIP RAD (EHC, LSK/ZM)</div>
              <div className="header-cell header-contact">Cell: 0814663557</div>
              <div className="header-cell">15 St James Road</div>
              <div className="header-cell header-center-text">HPCSA: DR0054070</div>
              <div className="header-cell header-contact">0652808581</div>
              <div className="header-cell">BELGRAVIA 5201</div>
              <div className="header-cell header-center-text">PN: 39000 3900061</div>
              <div className="header-cell header-right-text"></div>
              <div className="header-cell">EAST LONDON</div>
              <div className="header-cell"></div>
              <div className="header-cell header-contact">Email: machona.machila@gmail.com</div>
            </div>
          </div>

          <div className="invoice-date-row">
            <span className="invoice-label">DATE</span>
            <input type="text" name="invoiceDate" className="invoice-line-input" />
            <button type="button" className="today-button" onClick={setInvoiceTodayDate}>
              Today
            </button>
          </div>

          <div className="invoice-section-title">PATIENT DETAILS</div>

          <div className="invoice-detail-row">
            <span className="invoice-label">NAME</span>
            <input type="text" name="invoicePatientName" className="invoice-line-input short" />
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-label">ACCOUNT NUMBER</span>
            <input type="text" name="invoiceAccountNumber" className="invoice-line-input short" />
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-label">AUTHORISATION</span>
            <input type="text" className="invoice-line-input short" />
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-label">TIME</span>
            <input type="text" className="invoice-line-input short" />
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-label">ICD 10 CODES:</span>
            <input type="text" className="invoice-line-input short" />
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-label">PROCEDURE</span>
            <input type="text" className="invoice-line-input no-line" />
          </div>

          <div className="invoice-table">
            <div className="invoice-table-header">
              <div>TRANSACTION DESCRIPTION</div>
              <div>TARIFF</div>
              <div>%</div>
              <div>QUANTITY</div>
              <div>AMOUNT</div>
            </div>
            {INVOICE_ROWS.map((row, index) => (
              <div className="invoice-table-row" key={`${row.tariff}-${index}`}>
                <div>{row.description}</div>
                <div>{row.tariff}</div>
                <div>100 75 50 25</div>
                <div>
                  <input type="text" aria-label={`Quantity ${row.description}`} />
                </div>
                <div>
                  <input
                    type="text"
                    aria-label={`Amount ${row.description}`}
                    value={invoiceAmounts[index]}
                    onChange={(event) => handleInvoiceAmountChange(index, event.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="invoice-total-row">
            <div>TOTAL AMOUNT:</div>
            <div></div>
            <div></div>
            <div></div>
            <div>
              <input type="text" value={invoiceTotal} readOnly />
            </div>
          </div>

          <div className="bottom-print">
            <button type="button" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatsonMachilaTemplate;
