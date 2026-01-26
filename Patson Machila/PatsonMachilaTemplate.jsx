import { useCallback, useEffect, useState } from 'react';
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
  const [invoiceStickerImage, setInvoiceStickerImage] = useState(null);
  const [invoiceStickerCropSrc, setInvoiceStickerCropSrc] = useState(null);
  const [invoiceStickerCropZoom, setInvoiceStickerCropZoom] = useState(1);
  const [invoiceStickerCropX, setInvoiceStickerCropX] = useState(0);
  const [invoiceStickerCropY, setInvoiceStickerCropY] = useState(0);
  const [doctorSignatureImage, setDoctorSignatureImage] = useState(null);
  const [doctorSigCropSrc, setDoctorSigCropSrc] = useState(null);
  const [doctorSigCropZoom, setDoctorSigCropZoom] = useState(1);
  const [doctorSigCropX, setDoctorSigCropX] = useState(0);
  const [doctorSigCropY, setDoctorSigCropY] = useState(0);
  const [invoiceAmounts, setInvoiceAmounts] = useState(() => INVOICE_ROWS.map(() => ''));

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
    const match = trimmed.match(/^(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
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
      const monthName = months[parseInt(month, 10) - 1] || month;
      return `${day} ${monthName} ${year}`;
    }
    return trimmed;
  };

  const sanitizeFilename = (value) => {
    if (!value) return '';
    return value
      .replace(/[\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const buildFilename = (element, invoiceOverride = null) => {
    if (!element) {
      return 'PATIENT';
    }
    const isInvoice = typeof invoiceOverride === 'boolean' ? invoiceOverride : activeTemplate === 'invoice';
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
    const fileDate = dateInput && dateInput.value ? formatDateForFilename(dateInput.value) : formatDateShort(today);
    const nameValue = patientNameInput && patientNameInput.value ? patientNameInput.value.trim() : 'PATIENT';
    const idValue = idNumberInput && idNumberInput.value ? idNumberInput.value.trim() : 'ID';
    return sanitizeFilename(`${nameValue} ${fileDate} ${idValue}`) || 'PATIENT';
  };

  const generatePDF = useCallback(() => {
    const templateId = activeTemplate === 'invoice' ? 'invoice-container' : 'form-container';
    const element = document.getElementById(templateId);
    if (!element || !window.html2pdf) {
      return;
    }

    const opt = {
      margin: 0,
      filename: `${buildFilename(element)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(element).save();
  }, [activeTemplate]);

  const waitForImages = (root) => {
    if (!root) {
      return Promise.resolve();
    }
    const images = Array.from(root.querySelectorAll('img')).filter((img) => img.src);
    const waits = images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      if (img.decode) {
        return img.decode().catch(() => undefined);
      }
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });
    return Promise.all(waits);
  };

  const handlePrint = useCallback(async () => {
    const referralElement = document.getElementById('form-container');
    const invoiceElement = document.getElementById('invoice-container');
    const printContainers = ['form-container', 'invoice-container']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    await Promise.all(printContainers.map(waitForImages));
    const previousTitle = document.title;
    let filename = 'PATIENT';
    if (referralElement) {
      filename = buildFilename(referralElement, false);
    } else if (invoiceElement) {
      filename = buildFilename(invoiceElement, true);
    }
    document.title = filename;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);
    window.print();
  }, [activeTemplate]);

  useEffect(() => {
    const setPrintTitle = () => {
      const referralElement = document.getElementById('form-container');
      const invoiceElement = document.getElementById('invoice-container');
      let filename = 'PATIENT';
      if (referralElement) {
        filename = buildFilename(referralElement, false);
      } else if (invoiceElement) {
        filename = buildFilename(invoiceElement, true);
      }
      document.title = filename;
    };
    window.addEventListener('beforeprint', setPrintTitle);
    return () => window.removeEventListener('beforeprint', setPrintTitle);
  }, [activeTemplate]);

  const processStickerFile = (file, mode = 'referral') => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (mode === 'invoice') {
        setInvoiceStickerCropSrc(event.target.result);
        setInvoiceStickerCropZoom(1);
        setInvoiceStickerCropX(0);
        setInvoiceStickerCropY(0);
        return;
      }
      setStickerCropSrc(event.target.result);
      setStickerCropZoom(1);
      setStickerCropX(0);
      setStickerCropY(0);
    };
    reader.readAsDataURL(file);
  };

  const handleStickerUpload = (event, mode = 'referral') => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      processStickerFile(file, mode);
    }
  };

  const captureSticker = (mode = 'referral') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) {
        processStickerFile(file, mode);
      }
    };
    input.click();
  };

  const applyStickerCrop = (mode = 'referral') => {
    const cropSource = mode === 'invoice' ? invoiceStickerCropSrc : stickerCropSrc;
    if (!cropSource) {
      return;
    }
    const img = new Image();
    img.onload = () => {
      const targetWidth = mode === 'invoice' ? 380 : 400;
      const targetHeight = mode === 'invoice' ? 250 : 250;
      const zoom = Math.max(1, mode === 'invoice' ? invoiceStickerCropZoom : stickerCropZoom);
      const baseScale = Math.min(targetWidth / img.width, targetHeight / img.height);
      const scale = baseScale * zoom;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const maxOffsetX = Math.max(0, (drawWidth - targetWidth) / 2);
      const maxOffsetY = Math.max(0, (drawHeight - targetHeight) / 2);
      const offsetX = ((mode === 'invoice' ? invoiceStickerCropX : stickerCropX) / 100) * maxOffsetX;
      const offsetY = ((mode === 'invoice' ? invoiceStickerCropY : stickerCropY) / 100) * maxOffsetY;
      const dx = (targetWidth - drawWidth) / 2 + offsetX;
      const dy = (targetHeight - drawHeight) / 2 + offsetY;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      if (mode === 'invoice') {
        setInvoiceStickerImage(canvas.toDataURL('image/png'));
        setInvoiceStickerCropSrc(null);
        return;
      }
      setStickerImage(canvas.toDataURL('image/png'));
      setStickerCropSrc(null);
    };
    img.src = cropSource;
  };

  const cancelStickerCrop = (mode = 'referral') => {
    if (mode === 'invoice') {
      setInvoiceStickerCropSrc(null);
      return;
    }
    setStickerCropSrc(null);
  };

  const setTodayDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const input = document.querySelector('input[name="referralDate"]');
    if (input) {
      input.value = `${day}- ${month}- ${year}`;
      const container = document.getElementById('form-container');
      if (container) {
        const fields = container.querySelectorAll('input, textarea');
        const values = Array.from(fields)
          .filter((field) => field.type !== 'file')
          .map((field) => field.value);
        localStorage.setItem('patson_referral_data', JSON.stringify(values));
      }
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
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
      setDoctorSignatureImage(canvas.toDataURL('image/png'));
      setDoctorSigCropSrc(null);
    };
    img.src = doctorSigCropSrc;
  };

  const cancelDoctorSignatureCrop = () => {
    setDoctorSigCropSrc(null);
  };

  const invoiceTotal = invoiceAmounts.reduce((sum, value) => {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? sum : sum + parsed;
  }, 0);

  const handleInvoiceAmountChange = (index, value) => {
    setInvoiceAmounts((prev) => {
      const next = [...prev];
      next[index] = value;
      localStorage.setItem('patson_invoice_amounts', JSON.stringify(next));
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
      input.value = `${day}- ${month}- ${year}`;
      const container = document.getElementById('invoice-container');
      if (container) {
        const fields = container.querySelectorAll('input, textarea');
        const values = Array.from(fields)
          .filter((field) => field.type !== 'file')
          .map((field) => field.value);
        localStorage.setItem('patson_invoice_data', JSON.stringify(values));
      }
    }
  };

  useEffect(() => {
    const containerId = activeTemplate === 'invoice' ? 'invoice-container' : 'form-container';
    const storageKey =
      activeTemplate === 'invoice' ? 'patson_invoice_data' : 'patson_referral_data';
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    const fields = Array.from(container.querySelectorAll('input, textarea')).filter(
      (field) => field.type !== 'file'
    );
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    fields.forEach((field, index) => {
      if (saved[index] !== undefined) {
        field.value = saved[index];
      } else {
        field.value = '';
      }
    });
    if (activeTemplate === 'invoice') {
      const savedAmounts = JSON.parse(localStorage.getItem('patson_invoice_amounts') || '[]');
      setInvoiceAmounts(savedAmounts.length ? savedAmounts : INVOICE_ROWS.map(() => ''));
    }
    const handleSave = () => {
      const values = fields.map((field) => field.value);
      localStorage.setItem(storageKey, JSON.stringify(values));
    };
    fields.forEach((field) => field.addEventListener('input', handleSave));
    return () => {
      fields.forEach((field) => field.removeEventListener('input', handleSave));
    };
  }, [activeTemplate]);

  const clearReferralData = () => {
    const container = document.getElementById('form-container');
    if (container) {
      container.querySelectorAll('input').forEach((input) => {
        if (input.type !== 'file') {
          input.value = '';
        }
      });
      container.querySelectorAll('textarea').forEach((textarea) => {
        textarea.value = '';
      });
    }
    setStickerImage(null);
    setStickerCropSrc(null);
    setInvoiceStickerImage(null);
    setInvoiceStickerCropSrc(null);
    setDoctorSignatureImage(null);
    setDoctorSigCropSrc(null);
    localStorage.removeItem('patson_referral_data');
  };

  const clearInvoiceData = () => {
    const container = document.getElementById('invoice-container');
    if (container) {
      container.querySelectorAll('input').forEach((input) => {
        if (input.type !== 'file') {
          input.value = '';
        }
      });
      container.querySelectorAll('textarea').forEach((textarea) => {
        textarea.value = '';
      });
    }
    setInvoiceAmounts(INVOICE_ROWS.map(() => ''));
    setInvoiceStickerImage(null);
    setInvoiceStickerCropSrc(null);
    localStorage.removeItem('patson_invoice_data');
    localStorage.removeItem('patson_invoice_amounts');
  };

  return (
    <>
      <style>
        {`
          :root {
            --form-width: 800px;
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
            width: var(--form-width);
            min-height: 1050px;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            position: relative;
            box-sizing: border-box;
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

          .short-field-row {
            width: 300px;
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
            right: 45px;
            top: 270px;
            width: 400px;
            font-size: 10px;
            color: #444;
            height: 310px;
          }

          .sticker-frame {
            width: 400px;
            height: 250px;
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
            top: 80px;
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
            top: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            border: none;
            background: #000;
            color: #fff;
            font-size: 10px;
            cursor: pointer;
            z-index: 2;
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
            overflow: visible;
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
            top: -14px;
            right: -14px;
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
            background-color: #fff;
            color: #000;
            border: 1px solid #000;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: none;
          }

          button:hover {
            background-color: #f2f2f2;
          }

          .clear-button {
            font-size: 16px;
            padding: 12px 25px;
          }

          .bottom-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
          }

          .invoice-container {
            font-size: 12px;
            text-transform: uppercase;
          }

          .invoice-header .header-cell.normal-case {
            text-transform: none;
          }

          .invoice-date-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .invoice-date-row.short-line {
            width: 300px;
            max-width: 300px;
          }

          .invoice-date-row.short-line .invoice-line-input.short {
            flex: 1 1 auto;
            max-width: none;
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

          .invoice-line-input.medium {
            flex: 0 0 66%;
            max-width: 66%;
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
            margin: 4px 0 4px;
            text-decoration: underline;
          }

          .invoice-details-section {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            column-gap: 24px;
            align-items: start;
            margin-bottom: 4px;
          }

          .invoice-details-fields {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 300px;
          }

          .invoice-detail-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 4px;
          }

          .invoice-detail-row.short-line {
            width: 300px;
            max-width: 300px;
          }

          .invoice-detail-row.short-line .invoice-line-input.short {
            flex: 1 1 auto;
            max-width: none;
          }

          .invoice-sticker-box {
            position: absolute;
            right: 35px;
            top: 225px;
            width: 380px;
            height: 310px;
            align-self: start;
          }

          .invoice-icd-row {
            margin-top: 0;
          }

          .invoice-sticker-box .sticker-frame {
            width: 380px;
            height: 250px;
          }
          
          .template-hidden {
            display: none;
          }

          .invoice-sticker-box .sticker-controls {
            position: absolute;
            top: 90px;
            left: 0;
            right: 0;
            margin-top: 0;
          }

          .invoice-table {
            margin-top: 4px;
            border-top: none;
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

          .invoice-total-label {
            grid-column: 1 / 5;
            justify-self: end;
            padding-right: 8px;
          }

          .invoice-total-amount {
            grid-column: 5 / 6;
          }

          .invoice-total-row input {
            width: 100%;
            border: none;
            border-bottom: 1px dotted #444;
            background: transparent;
            font-size: 11px;
            text-align: center;
            padding: 1px 2px;
          }

          @media screen and (max-width: 900px) {
            body {
              padding: 12px;
              align-items: center;
              overflow-x: hidden;
            }

            #form-container,
            #invoice-container {
              width: var(--form-width);
              min-height: 1050px;
              padding: 40px;
              transform: scale(clamp(0.35, calc((100vw - 24px) / var(--form-width)), 0.9));
              transform-origin: top center;
              margin: 0 auto;
              left: auto;
              right: auto;
            }

            .controls {
              position: static;
              top: auto;
              width: 100%;
            }

            .template-switch {
              flex-wrap: wrap;
              justify-content: center;
            }

            .controls button,
            .bottom-actions button {
              width: 100%;
            }

            .bottom-actions {
              flex-direction: column;
            }

            .invoice-table {
              overflow-x: auto;
            }

            .invoice-table-header,
            .invoice-table-row,
            .invoice-total-row {
              min-width: 540px;
            }
          }

          /* Hide inputs for PDF conversion but keep text */
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            html {
              width: 210mm;
              height: auto;
              margin: 0;
              padding: 0;
            }
            body {
              width: 210mm !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              display: block !important;
              background: white !important;
            }
            /* Reset any wrapper containers */
            body > div,
            body > div > div {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              transform: none !important;
            }
            .controls,
            .template-switch,
            .clear-button,
            .print-hide,
            .bottom-actions {
              display: none !important;
            }
            #form-container,
            #invoice-container {
              box-shadow: none !important;
              width: 210mm !important;
              max-width: 210mm !important;
              min-width: 210mm !important;
              height: 297mm !important;
              padding: 8mm !important;
              margin: 0 !important;
              transform: scale(0.95) !important;
              transform-origin: top left !important;
              position: relative !important;
              left: 0 !important;
              right: 0 !important;
              page-break-inside: avoid !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            #form-container {
              transform: scale(0.88) !important;
              overflow: visible !important;
            }
            #form-container {
              page-break-after: always !important;
            }
            #invoice-container {
              page-break-before: always !important;
            }
            /* Ensure all internal content fits */
            #form-container *,
            #invoice-container * {
              max-width: 100% !important;
              overflow-wrap: break-word !important;
              word-wrap: break-word !important;
            }
            /* Ensure grid columns don't overflow */
            .header-grid,
            .header-top {
              max-width: 100% !important;
              width: 100% !important;
            }
            .sticker-controls,
            .signature-controls,
            .today-button,
            .sticker-remove {
              display: none !important;
            }
            .clear-button {
              display: none !important;
            }
            .print-hide {
              display: none !important;
            }
            .template-switch {
              display: none;
            }
            .template-hidden {
              display: block !important;
            }
            #invoice-container {
              page-break-before: always !important;
            }
            /* Prevent page breaks */
            .sticker-box,
            .procedure-container,
            .bottom-sections,
            .invoice-table,
            .invoice-total-row {
              page-break-inside: avoid !important;
            }
            /* Ensure no horizontal overflow */
            html, body {
              overflow-x: hidden !important;
            }
            /* Final print overrides to force fit */
            #form-container {
              transform: none !important;
              zoom: 0.85 !important;
              height: 297mm !important;
              overflow: visible !important;
            }
            #form-container .sticker-box {
              transform: scale(1.08) !important;
              transform-origin: top left !important;
            }
            #invoice-container {
              transform: none !important;
              zoom: 0.95 !important;
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
        <button type="button" onClick={handlePrint} style={{ marginLeft: '10px' }}>
          Print
        </button>
        <button
          type="button"
          className="clear-button"
          style={{ marginLeft: '10px' }}
          onClick={activeTemplate === 'invoice' ? clearInvoiceData : clearReferralData}
        >
          Clear All
        </button>
      </div>

      <div id="form-container" key="referral" className={activeTemplate === 'referral' ? '' : 'template-hidden'}>
        <form autoComplete="off">
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

        <div className="row short-field-row">
          <span className="field-label">Patient Name:</span>
          <input type="text" name="patientName" />
        </div>

        <div className="row short-field-row">
          <span className="field-label">ID Number:</span>
          <input type="text" name="idNumber" />
        </div>

        <div className="row short-field-row">
          <span className="field-label">Authorisation No.:</span>
          <input type="text" />
        </div>

        <div className="row short-field-row">
          <span className="field-label">Dependant Code:</span>
          <input type="text" />
        </div>

        <div className="row short-field-row">
          <span className="field-label">Cell/Contact Number:</span>
          <input type="text" />
        </div>

        <div className="row">
          <div style={{ width: '370px', display: 'flex', alignItems: 'flex-end' }}>
          <span className="field-label">E-Mail Address:</span>
          <input type="email" />
          </div>
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
          <div className="sticker-frame">
            {stickerImage ? (
              <>
                <img src={stickerImage} alt="Patient sticker" className="sticker-preview" />
              </>
            ) : (
              <div className="sticker-preview" aria-label="Sticker placeholder" />
            )}
          </div>
          {stickerImage && (
            <button
              type="button"
              onClick={() => setStickerImage(null)}
              className="sticker-remove print:hidden"
            >
              x
            </button>
          )}
          {!stickerImage && (
            <div className="sticker-controls print:hidden">
              <label className="sticker-button">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleStickerUpload(event, 'referral')}
                  hidden
                />
              </label>
              <button type="button" className="sticker-button" onClick={() => captureSticker('referral')}>
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
                <button type="button" onClick={() => cancelStickerCrop('referral')}>
                  Cancel
                </button>
                <button type="button" onClick={() => applyStickerCrop('referral')}>
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
        <div className="bottom-actions print-hide">
          <button type="button" onClick={handlePrint}>
            Print
          </button>
          <button type="button" className="clear-button" onClick={clearReferralData}>
            Clear All
          </button>
        </div>
        </form>
      </div>
      <div id="invoice-container" className={`invoice-container ${activeTemplate === 'invoice' ? '' : 'template-hidden'}`} key="invoice">
          <form autoComplete="off">
          <div className="header-box invoice-header">
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
              <div className="header-cell normal-case">14 Windermere Court</div>
              <div className="header-cell header-center-text">DIP RAD (EHC, LSK/ZM)</div>
              <div className="header-cell header-contact normal-case">Cell: 0814663557</div>
              <div className="header-cell normal-case">15 St James Road</div>
              <div className="header-cell header-center-text">HPCSA: DR0054070</div>
              <div className="header-cell header-contact">0652808581</div>
              <div className="header-cell">BELGRAVIA 5201</div>
              <div className="header-cell header-center-text">PN: 39000 3900061</div>
              <div className="header-cell header-right-text"></div>
              <div className="header-cell">EAST LONDON</div>
              <div className="header-cell"></div>
              <div className="header-cell header-contact normal-case">
                Email: machona.machila@gmail.com
              </div>
            </div>
          </div>

          <div className="invoice-date-row short-line">
            <span className="invoice-label">DATE</span>
            <input type="text" name="invoiceDate" className="invoice-line-input short" />
            <button type="button" className="today-button" onClick={setInvoiceTodayDate}>
              Today
            </button>
          </div>

          <div className="invoice-section-title">PATIENT DETAILS</div>

          <div className="invoice-details-section">
            <div className="invoice-details-fields">
              <div className="invoice-detail-row short-line">
                <span className="invoice-label">NAME</span>
                <input type="text" name="invoicePatientName" className="invoice-line-input short" />
              </div>
              <div className="invoice-detail-row short-line">
                <span className="invoice-label">ACCOUNT NUMBER</span>
                <input type="text" name="invoiceAccountNumber" className="invoice-line-input short" />
              </div>
              <div className="invoice-detail-row short-line">
                <span className="invoice-label">AUTHORISATION</span>
                <input type="text" className="invoice-line-input short" />
              </div>
              <div className="invoice-detail-row short-line">
                <span className="invoice-label">TIME</span>
                <input type="text" className="invoice-line-input short" />
              </div>
            </div>
            <div className="sticker-box invoice-sticker-box">
              <div className="sticker-frame">
                {invoiceStickerImage ? (
                  <>
                    <img src={invoiceStickerImage} alt="Patient sticker" className="sticker-preview" />
                  </>
                ) : (
                  <div className="sticker-preview" aria-label="Sticker placeholder" />
                )}
              </div>
              {invoiceStickerImage && (
                <button
                  type="button"
                  onClick={() => setInvoiceStickerImage(null)}
                  className="sticker-remove print:hidden"
                >
                  x
                </button>
              )}
              {!invoiceStickerImage && (
                <div className="sticker-controls print:hidden">
                  <label className="sticker-button">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleStickerUpload(event, 'invoice')}
                      hidden
                    />
                  </label>
                  <button type="button" className="sticker-button" onClick={() => captureSticker('invoice')}>
                    Photo
                  </button>
                </div>
              )}
            </div>
          </div>
          {invoiceStickerCropSrc && (
            <div className="sticker-modal">
              <div className="sticker-modal-content">
                <div
                  className="sticker-crop-frame"
                  style={{
                    backgroundImage: `url(${invoiceStickerCropSrc})`,
                    backgroundSize: `${invoiceStickerCropZoom * 100}%`,
                    backgroundPosition: `${50 + invoiceStickerCropX / 2}% ${50 + invoiceStickerCropY / 2}%`,
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
                      value={invoiceStickerCropZoom}
                      onChange={(e) => setInvoiceStickerCropZoom(parseFloat(e.target.value))}
                    />
                  </label>
                  <label>
                    Horizontal
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={invoiceStickerCropX}
                      onChange={(e) => setInvoiceStickerCropX(parseInt(e.target.value, 10))}
                    />
                  </label>
                  <label>
                    Vertical
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={invoiceStickerCropY}
                      onChange={(e) => setInvoiceStickerCropY(parseInt(e.target.value, 10))}
                    />
                  </label>
                </div>
                <div className="sticker-crop-actions">
                  <button type="button" onClick={() => cancelStickerCrop('invoice')}>
                    Cancel
                  </button>
                  <button type="button" onClick={() => applyStickerCrop('invoice')}>
                    Use Sticker
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="invoice-detail-row invoice-icd-row">
            <span className="invoice-label">ICD 10 CODES:</span>
            <input type="text" className="invoice-line-input short" />
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-label">PROCEDURE</span>
            <input type="text" className="invoice-line-input" />
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
            <div className="invoice-total-label">TOTAL AMOUNT:</div>
            <div className="invoice-total-amount">
              <input type="text" value={invoiceTotal ? invoiceTotal.toFixed(2) : ''} readOnly />
            </div>
          </div>

          <div className="bottom-actions print-hide">
            <button type="button" onClick={handlePrint}>
              Print
            </button>
            <button type="button" className="clear-button" onClick={clearInvoiceData}>
              Clear All
            </button>
          </div>
          </form>
        </div>
    </>
  );
};

export default PatsonMachilaTemplate;
