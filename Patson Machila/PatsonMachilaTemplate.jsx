import { useCallback, useState } from 'react';
import headerLogo from './src/assets/header-logo.png';

const PatsonMachilaTemplate = () => {
  const [stickerImage, setStickerImage] = useState(null);
  const [doctorSignatureImage, setDoctorSignatureImage] = useState(null);

  const generatePDF = useCallback(() => {
    const element = document.getElementById('form-container');
    if (!element || !window.html2pdf) {
      return;
    }

    const opt = {
      margin: 0,
      filename: 'Intraoperative_Fluoroscopy_Referral.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(element).save();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const processStickerFile = (file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = 300;
        const targetHeight = 200;
        const targetRatio = targetWidth / targetHeight;
        const imageRatio = img.width / img.height;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;

        if (imageRatio > targetRatio) {
          sh = img.height;
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
        } else {
          sw = img.width;
          sh = sw / targetRatio;
          sy = (img.height - sh) / 2;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        setStickerImage(canvas.toDataURL('image/png'));
      };
      img.src = event.target.result;
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

  const handleDoctorSignatureUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setDoctorSignatureImage(e.target.result);
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
        setDoctorSignatureImage(e.target.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
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
          #form-container {
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
            margin-top: -14px;
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
            right: 150px;
            top: 360px;
            width: 180px;
            font-size: 10px;
            color: #444;
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
          }

          .signature-left {
            justify-self: start;
          }

          .signature-right {
            justify-self: end;
            align-items: center;
            text-align: center;
          }

          .signature-area {
            height: 40px;
            margin-bottom: 6px;
            width: 100%;
            overflow: hidden;
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
            margin-bottom: 2px;
            margin-top: 0;
            position: relative;
            top: 40px;
            line-height: normal;
            color: #0b1b3b;
            display: block;
            align-self: center;
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

          /* Hide inputs for PDF conversion but keep text */
          @media print {
            .controls {
              display: none;
            }
          }
        `}
      </style>

      <div className="controls">
        <button type="button" onClick={generatePDF}>
          Create PDF Document
        </button>
        <button type="button" onClick={handlePrint} style={{ marginLeft: '10px' }}>
          Print
        </button>
      </div>

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
            <div className="header-cell header-right-text">Cell: 0814663557</div>
            <div className="header-cell">15 St James Road</div>
            <div className="header-cell header-center-text">HPCSA: DR0054070</div>
            <div className="header-cell header-right-text">0652808581</div>
            <div className="header-cell">BELGRAVIA 5201</div>
            <div className="header-cell header-center-text">PN: 39000 3900061</div>
            <div className="header-cell header-right-text"></div>
            <div className="header-cell">EAST LONDON</div>
            <div className="header-cell"></div>
            <div className="header-cell header-right-text">Email: machona.machila@gmail.com</div>
          </div>
        </div>

        <h3 className="title">Referral for Intraoperative Fluoroscopy</h3>

        <div className="row" style={{ width: '300px' }}>
          <span className="field-label">Date:</span>
          <input type="text" placeholder="" />
        </div>

        <div className="row">
          <span className="field-label">Patient Name:</span>
          <input type="text" />
        </div>

        <div className="row" style={{ width: '300px' }}>
          <span className="field-label">ID Number:</span>
          <input type="text" />
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
          <div className="sticker-controls print:hidden">
            <label className="sticker-button">
              Upload
              <input type="file" accept="image/*" onChange={handleStickerUpload} hidden />
            </label>
            <button type="button" className="sticker-button" onClick={captureSticker}>
              Photo
            </button>
          </div>
        </div>

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
                  <img
                    src={doctorSignatureImage}
                    alt="Doctor signature"
                    className="signature-image"
                  />
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
            <div className="signature-controls print:hidden">
              <label className="signature-button">
                Upload
                <input type="file" accept="image/*" onChange={handleDoctorSignatureUpload} hidden />
              </label>
              <button type="button" className="signature-button" onClick={captureDoctorSignature}>
                Photo
              </button>
            </div>
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
      </div>
    </>
  );
};

export default PatsonMachilaTemplate;
