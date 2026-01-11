
import React from 'react';
import { useReactToPrint } from 'react-to-print';
import PatsonMachilaTemplate from './PatsonMachilaTemplate';

const WilliamNtleleTemplate = () => {
  const [activeTab, setActiveTab] = React.useState('fluoroscopy'); // 'fluoroscopy', 'invoice', or 'patson'
  // Use null to start with no image and allow uploads
  const [officialStamp, setOfficialStamp] = React.useState(null);
  
  // Fluoroscopy form state
  const [patientStickerImage, setPatientStickerImage] = React.useState(null);
  const [doctorSignatureImage, setDoctorSignatureImage] = React.useState(null);
  const [fluoroscopyData, setFluoroscopyData] = React.useState({
    patient: '',
    date: '',
    icdCodes: '',
    clinicalMotivation: '',
    procedurePerformed: '',
    cArm: false,
    fixedUnit: false,
    doctorNameSignature: '',
    medicalAid: '',
    number: '',
    authNo: ''
  });
  
  // Invoice form state
  const [patientDetails, setPatientDetails] = React.useState({
    accountNo: '',
    name: '',
    diagnosis: '',
    hospitalised: '',
    authorizationNo: ''
  });
  const [tariffType, setTariffType] = React.useState('NPRL');
  const [otherTariff, setOtherTariff] = React.useState('');
  const [quantities, setQuantities] = React.useState({
    '39127': '', '39179': '', '3607': '', '39107': '', '39125': '', 
    '39037': '', '39001': '', '3601': '', '39167': '', '39003': '', 
    '39027': '', '39017': '', '39137': '', '39111': '', '39039': '', 
    '39187': '', '39199': '', '3602': '', '39169': '', '39185': '', '39300': ''
  });
  const [amounts, setAmounts] = React.useState({
    '39127': '', '39179': '', '3607': '', '39107': '', '39125': '', 
    '39037': '', '39001': '', '3601': '', '39167': '', '39003': '', 
    '39027': '', '39017': '', '39137': '', '39111': '', '39039': '', 
    '39187': '', '39199': '', '3602': '', '39169': '', '39185': '', '39300': ''
  });
  
  const formRef = React.useRef(null);
  
  const handlePrint = useReactToPrint({
    content: () => formRef.current,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFluoroscopyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePatientStickerUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setPatientStickerImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePatientSticker = () => {
    // Create a file input that accepts camera input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use the rear camera on mobile devices
    
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          setPatientStickerImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleDoctorSignatureUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setDoctorSignatureImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureDoctorSignature = () => {
    // Create a file input that accepts camera input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use the rear camera on mobile devices
    
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          setDoctorSignatureImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleOfficialStampUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setOfficialStamp(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleQuantityChange = (code, value) => {
    setQuantities(prev => ({
      ...prev,
      [code]: value
    }));
  };
  
  const handleAmountChange = (code, value) => {
    setAmounts(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const calculateTotal = () => {
    return Object.values(amounts).reduce((total, amount) => {
      const parsedAmount = parseFloat(amount);
      return isNaN(parsedAmount) ? total : total + parsedAmount;
    }, 0).toFixed(2);
  };

  return (
    <div className="max-w-5xl p-4 mx-auto">
      {/* Navigation Tabs - Hidden when printing */}
      <div className="flex mb-4 border-b border-black print:hidden">
        <button 
          className={`py-2 px-4 font-bold ${activeTab === 'fluoroscopy' 
            ? 'bg-black text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
          onClick={() => setActiveTab('fluoroscopy')}
        >
          Fluoroscopy Request Form
        </button>
        <button 
          className={`py-2 px-4 font-bold ml-2 ${activeTab === 'invoice' 
            ? 'bg-black text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
          onClick={() => setActiveTab('invoice')}
        >
          Radiographer Invoice
        </button>
        <button 
          className={`py-2 px-4 font-bold ml-2 ${activeTab === 'patson' 
            ? 'bg-black text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
          onClick={() => setActiveTab('patson')}
        >
          Patson Machila Referral
        </button>
        <div className="flex-grow"></div>
        {activeTab !== 'patson' && (
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 font-bold text-white bg-black hover:bg-gray-800"
          >
            Print / Export to PDF
          </button>
        )}
      </div>

      {/* Form Container */}
      {activeTab === 'patson' ? (
        <PatsonMachilaTemplate />
      ) : (
        <div ref={formRef} className="p-6 bg-white border border-black">
        {/* Unified Header for both forms */}
        <div className="pb-3 mb-4 border-b-2 border-black">
          <h1 className="text-4xl font-black tracking-wider text-center">WILLIAM NTLELE</h1>
          <h2 className="mb-2 text-2xl font-black tracking-wide text-center">DIAGNOSTIC RADIOGRAPHER</h2>
          <div className="flex justify-between text-sm">
            <div className="text-left">
              <p className="text-xs font-normal">1 Kaden Close</p>
              <p className="text-xs font-normal">Western Place,</p>
              <p className="text-xs font-normal">Selborne, East London</p>
              <p className="text-xs font-normal">P.O. Box 15127</p>
              <p className="text-xs font-normal">Selborne,</p>
              <p className="text-xs font-normal">5205</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-normal">N.Dip.Diag.Rad.RBA</p>
              <p className="text-xs font-normal">HPCSA Number DR 0047970</p>
              <p className="text-xs font-normal">Practice Number 3901033</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end text-xs font-normal">
                <svg className="w-3 h-3 mr-1 text-black" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a.84.84 0 0 0-.31-.05c-.26 0-.51.1-.71.29l-2.2 2.2a15.88 15.88 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                </svg>
                043 748 3389
              </p>
              <p className="flex items-center justify-end text-xs font-normal">
                <svg className="w-3 h-3 mr-1 text-black" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                </svg>
                079 925 0856
              </p>
              <p className="flex items-center justify-end text-xs font-normal">
                <svg className="w-3 h-3 mr-1 text-black" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                </svg>
                086 656 4160
              </p>
              <p className="text-xs font-normal">reception@medicalsa.co.za</p>
            </div>
          </div>
        </div>
        
        {/* Form Title - Changes based on active tab */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold tracking-wide">
            {activeTab === 'fluoroscopy' 
              ? 'REQUEST FOR INTRA OPERATIVE FLUOROSCOPY' 
              : 'PRO FORMA INVOICE'}
          </h2>
        </div>

        {/* Fluoroscopy Form Content */}
        {activeTab === 'fluoroscopy' && (
          <div className="border border-black">
            {/* First Row */}
            <div className="grid grid-cols-3 border-b border-black">
              <div className="p-2 border-r border-black">
                <label className="block text-sm font-bold uppercase">PATIENT</label>
                <input
                  type="text"
                  name="patient"
                  value={fluoroscopyData.patient}
                  onChange={handleInputChange}
                  className="block w-full p-1 mt-1 text-sm border border-black"
                />
              </div>
              <div className="p-2 border-r border-black">
                {/* Middle column - intentionally left blank as in the original form */}
              </div>
              <div className="p-2">
                <label className="block text-sm font-bold uppercase">MEDICAL AID</label>
                <input
                  type="text"
                  name="medicalAid"
                  value={fluoroscopyData.medicalAid}
                  onChange={handleInputChange}
                  className="block w-full p-1 mt-1 text-sm border border-black"
                />
              </div>
            </div>
            
            {/* Second Row */}
            <div className="grid grid-cols-3 border-b border-black">
              <div className="p-2 border-r border-black">
                <label className="block text-sm font-bold uppercase">DATE</label>
                <div className="flex items-center">
                  <input
                    type="date"
                    name="date"
                    value={fluoroscopyData.date}
                    onChange={handleInputChange}
                    className="block w-full p-1 mt-1 text-sm border border-black"
                  />
                  <button 
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setFluoroscopyData(prev => ({...prev, date: today}));
                    }}
                    className="px-2 py-1 ml-2 text-sm bg-gray-200 rounded hover:bg-gray-300 print:hidden"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div className="p-2 border-r border-black">
                {/* Middle column - intentionally left blank as in the original form */}
              </div>
              <div className="p-2">
                <label className="block text-sm font-bold uppercase">NUMBER</label>
                <input
                  type="text"
                  name="number"
                  value={fluoroscopyData.number}
                  onChange={handleInputChange}
                  className="block w-full p-1 mt-1 text-sm border border-black"
                />
              </div>
            </div>
            
            {/* Third Row */}
            <div className="grid grid-cols-3 border-b border-black">
              <div className="p-2 border-r border-black">
                <label className="block text-sm font-bold uppercase">ICD 10 CODES</label>
                <input
                  type="text"
                  name="icdCodes"
                  value={fluoroscopyData.icdCodes}
                  onChange={handleInputChange}
                  className="block w-full p-1 mt-1 text-sm border border-black"
                />
              </div>
              <div className="p-2 border-r border-black">
                {/* Middle column - intentionally left blank as in the original form */}
              </div>
              <div className="p-2">
                <label className="block text-sm font-bold uppercase">AUTH NO.</label>
                <input
                  type="text"
                  name="authNo"
                  value={fluoroscopyData.authNo}
                  onChange={handleInputChange}
                  className="block w-full p-1 mt-1 text-sm border border-black"
                />
              </div>
            </div>
            
            {/* Fourth Row */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <label className="block text-sm font-bold uppercase">CLINICAL MOTIVATION</label>
                <textarea
                  name="clinicalMotivation"
                  value={fluoroscopyData.clinicalMotivation}
                  onChange={handleInputChange}
                  rows="5"
                  className="block w-full p-1 mt-1 text-sm border border-black"
                ></textarea>
                
                {/* Enhanced Patient Sticker Area */}
                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold text-center text-black uppercase">PATIENT STICKER</p>
                  {patientStickerImage ? (
                    <div className="relative h-32 p-2 border border-black">
                      <img 
                        src={patientStickerImage} 
                        alt="Patient Sticker" 
                        className="object-contain max-w-full max-h-full mx-auto"
                      />
                      <button
                        onClick={() => setPatientStickerImage(null)}
                        className="absolute flex items-center justify-center w-5 h-5 text-white bg-black top-1 right-1 print:hidden"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="h-40 p-2 border border-black print:h-32">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center flex-1 text-center print:hidden">
                          <div>
                            <p className="mb-2 text-sm text-black">Upload patient sticker</p>
                            <div className="flex justify-center space-x-2">
                              <label className="px-3 py-1 text-sm text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                <span>Upload File</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handlePatientStickerUpload} 
                                  className="hidden" 
                                />
                              </label>
                              <button
                                onClick={capturePatientSticker}
                                className="px-3 py-1 text-sm text-black bg-gray-200 rounded hover:bg-gray-300"
                              >
                                Take Photo
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-center text-gray-500 print:hidden">
                          Accepts images, PDFs, or photos from camera
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2">
                <label className="block text-sm font-bold uppercase">PROCEDURE PERFORMED:</label>
                <textarea
                  name="procedurePerformed"
                  value={fluoroscopyData.procedurePerformed}
                  onChange={handleInputChange}
                  rows="5"
                  className="block w-full p-1 mt-1 text-sm border border-black"
                ></textarea>
                
                {/* C-ARM and FIXED UNIT checkboxes */}
                <div className="grid grid-cols-2 gap-2 pt-2 mt-4 border-t border-black">
                  <div className="p-2 border border-black">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="cArm"
                        checked={fluoroscopyData.cArm}
                        onChange={handleInputChange}
                        className="mr-2 border-black"
                      />
                      <span className="text-sm font-bold uppercase">C-ARM</span>
                    </label>
                  </div>
                  <div className="p-2 border border-black">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="fixedUnit"
                        checked={fluoroscopyData.fixedUnit}
                        onChange={handleInputChange}
                        className="mr-2 border-black"
                      />
                      <span className="text-sm font-bold uppercase">FIXED UNIT</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Doctor's Name and Signature */}
            <div className="p-2">
              <label className="block text-sm font-bold uppercase">DOCTOR'S NAME AND SIGNATURE:</label>
              <div className="relative border border-black">
                {doctorSignatureImage ? (
                  <div className="relative h-24 p-2">
                    <img
                      src={doctorSignatureImage}
                      alt="Doctor Signature"
                      className="object-contain max-w-full max-h-full mx-auto"
                    />
                    <button
                      onClick={() => setDoctorSignatureImage(null)}
                      className="absolute flex items-center justify-center w-5 h-5 text-white bg-black top-1 right-1 print:hidden"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      name="doctorNameSignature"
                      value={fluoroscopyData.doctorNameSignature}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full p-1 text-sm border-0"
                      placeholder="Type signature here..."
                    ></textarea>
                    <div className="absolute bottom-1 right-1 flex space-x-1 print:hidden">
                      <label className="px-2 py-0.5 text-xs text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDoctorSignatureUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={captureDoctorSignature}
                        className="px-2 py-0.5 text-xs text-black bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
        
        {/* Invoice Form Content */}
        {activeTab === 'invoice' && (
          <div>
            {/* Invoice Details */}
            <div className="pb-2 mb-4 border-b border-black">
              <div className="flex flex-col mb-2">
                <label className="font-bold">PRO FORMA INVOICE NO :</label>
                <input type="text" className="p-1 border-b border-black focus:outline-none" />
              </div>
              <div className="flex flex-col mb-2">
                <label className="font-bold">DATE</label>
                <div className="flex items-center">
                  <input 
                    type="date" 
                    className="p-1 border-b border-black focus:outline-none" 
                  />
                  <button 
                    onClick={() => {
                      const dateInputs = document.querySelectorAll('input[type="date"]');
                      const today = new Date().toISOString().split('T')[0];
                      dateInputs.forEach(input => { input.value = today; });
                    }}
                    className="px-2 py-1 ml-2 text-sm bg-gray-200 rounded hover:bg-gray-300 print:hidden"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="pb-2 mb-4 border-b border-black">
              <h3 className="font-bold">PATIENT DETAILS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col mb-2">
                  <div className="flex">
                    <label className="w-32">ACCOUNT NO.</label>
                    <span className="mx-2">:</span>
                    <input 
                      type="text" 
                      value={patientDetails.accountNo}
                      onChange={(e) => setPatientDetails({...patientDetails, accountNo: e.target.value})}
                      className="flex-1 border-b border-black focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex flex-col mb-2">
                  <div className="flex">
                    <label className="w-32">NAME</label>
                    <span className="mx-2">:</span>
                    <input 
                      type="text" 
                      value={patientDetails.name}
                      onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                      className="flex-1 border-b border-black focus:outline-none" 
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col col-span-2 mb-2">
                  <div className="flex">
                    <label className="w-32">TARIFF USED</label>
                    <span className="mx-2">:</span>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="tariff" 
                        id="nprl" 
                        value="NPRL"
                        checked={tariffType === 'NPRL'}
                        onChange={() => setTariffType('NPRL')}
                        className="mr-1" 
                      />
                      <label htmlFor="nprl" className="mr-4">(NPRL)(COID)</label>
                      
                      <input 
                        type="radio" 
                        name="tariff" 
                        id="other" 
                        value="OTHER"
                        checked={tariffType === 'OTHER'}
                        onChange={() => setTariffType('OTHER')}
                        className="mr-1" 
                      />
                      <label htmlFor="other" className="mr-4">OR SPECIFY OTHER TARIFF</label>
                      <span className="mx-2">:</span>
                      <input 
                        type="text" 
                        value={otherTariff}
                        onChange={(e) => setOtherTariff(e.target.value)}
                        disabled={tariffType !== 'OTHER'}
                        className="flex-1 border-b border-black focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col col-span-2 mb-2">
                  <div className="flex">
                    <label className="w-32">DIAGNOSIS</label>
                    <span className="mx-2">:</span>
                    <input 
                      type="text" 
                      value={patientDetails.diagnosis}
                      onChange={(e) => setPatientDetails({...patientDetails, diagnosis: e.target.value})}
                      className="flex-1 border-b border-black focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex flex-col mb-2">
                  <div className="flex">
                    <label className="w-32">HOSPITALISED (Y/N)</label>
                    <span className="mx-2">:</span>
                    <input 
                      type="text" 
                      value={patientDetails.hospitalised}
                      onChange={(e) => setPatientDetails({...patientDetails, hospitalised: e.target.value})}
                      className="flex-1 border-b border-black focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex flex-col mb-2">
                  <div className="flex">
                    <label className="w-32">AUTHORISATION #</label>
                    <span className="mx-2">:</span>
                    <input 
                      type="text" 
                      value={patientDetails.authorizationNo}
                      onChange={(e) => setPatientDetails({...patientDetails, authorizationNo: e.target.value})}
                      className="flex-1 border-b border-black focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="pb-2 mb-4 border-b border-black">
              <div className="grid grid-cols-12 pb-1 font-bold text-center border-b border-black">
                <div className="col-span-4 pl-2 text-left">TRANSACTION DESCRIPTION</div>
                <div className="col-span-2">NAPPI/TARRIFF</div>
                <div className="col-span-2">%</div>
                <div className="col-span-2">QUANTITY</div>
                <div className="col-span-2">AMOUNT</div>
              </div>
              
              {/* Table Rows */}
              {[
                { desc: 'ACUTE ABDOMEN', code: '39127', percentages: '100 75 50 25' },
                { desc: 'ATTENDANCE AT OPERATION', code: '39179', percentages: '100 75 50 25' },
                { desc: 'ATTENDANCE AT OPERATION', code: '3607', percentages: '100 75 50 25' },
                { desc: 'CHEST(ITEM 167 INCLUDED)', code: '39107', percentages: '100 75 50 25' },
                { desc: 'CONTROL FILMS ABDOMEN', code: '39125', percentages: '100 75 50 25' },
                { desc: 'DISCOGRAPHY', code: '39037', percentages: '100 75 50 25' },
                { desc: 'FINGER,TOE', code: '39001', percentages: '100 75 50 25' },
                { desc: 'FLUOROSCPY:PER HALF HOUR', code: '3601', percentages: '100 75 50 25' },
                { desc: 'FLUOROSCOPY:PER HALF HOUR', code: '39167', percentages: '100 75 50 25' },
                { desc: 'LIMB PER REGION', code: '39003', percentages: '100 75 50 25' },
                { desc: 'PELVIS(SACRO-ILIAC OR HIP)', code: '39027', percentages: '100 75 50 25' },
                { desc: 'PER REGION,E.G.CERVICAL', code: '39017', percentages: '100 75 50 25' },
                { desc: 'RETROGRADE PYELOGRAM', code: '39137', percentages: '100 75 50 25' },
                { desc: 'RIBS', code: '39111', percentages: '100 75 50 25' },
                { desc: 'SKULL STUDIES', code: '39039', percentages: '100 75 50 25' },
                { desc: 'THEATRE INVESTIGATION', code: '39187', percentages: '100 75 50 25' },
                { desc: 'VASCULAR STUDY', code: '39199', percentages: '100 75 50 25' },
                { desc: 'WHERE A C-ARM PORTABLE X-RAY USED', code: '3602', percentages: '100 75 50 25' },
                { desc: 'WHERE A C-ARM PORTABLE X-RAY USED', code: '39169', percentages: '100 75 50 25' },
                { desc: 'WHERE A PORTABLE X-RAY UNIT USED', code: '39185', percentages: '100 75 50 25' },
                { desc: 'X-RAY FILMS', code: '39300', percentages: '100 75 50 25' },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 py-1 text-sm border-b border-black">
                  <div className="col-span-4 font-medium text-left">{item.desc}</div>
                  <div className="col-span-2 text-center">{item.code}</div>
                  <div className="col-span-2 text-center">{item.percentages}</div>
                  <div className="col-span-2 text-center">
                    <input 
                      type="text" 
                      value={quantities[item.code]}
                      onChange={(e) => handleQuantityChange(item.code, e.target.value)}
                      className="w-full text-center border-b border-black focus:outline-none" 
                    />
                  </div>
                  <div className="col-span-2 text-center">
                    <input 
                      type="text" 
                      value={amounts[item.code]}
                      onChange={(e) => handleAmountChange(item.code, e.target.value)}
                      className="w-full text-center border-b border-black focus:outline-none" 
                    />
                  </div>
                </div>
              ))}
              
              {/* Empty Rows for Additional Items */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="grid grid-cols-12 py-1 text-sm border-b border-black">
                  <div className="col-span-4 text-left">
                    <input type="text" className="w-full border-b border-black focus:outline-none" />
                  </div>
                  <div className="col-span-2 text-center">
                    <input type="text" className="w-full text-center border-b border-black focus:outline-none" />
                  </div>
                  <div className="col-span-2 text-center">
                    <input type="text" className="w-full text-center border-b border-black focus:outline-none" />
                  </div>
                  <div className="col-span-2 text-center">
                    <input type="text" className="w-full text-center border-b border-black focus:outline-none" />
                  </div>
                  <div className="col-span-2 text-center">
                    <input type="text" className="w-full text-center border-b border-black focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-end pb-4 mb-4">
              <div className="mr-4 font-bold">TOTAL AMOUNT</div>
              <div className="w-40 p-1 text-right border-b-2 border-black">
                <input 
                  type="text" 
                  className="w-full font-bold text-right focus:outline-none" 
                  value={calculateTotal()}
                  readOnly 
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Official Stamp Upload Section - Common to both forms */}
        <div className="pt-4 mt-6 border-t border-black">
          {officialStamp ? (
            <div className="relative h-32 max-w-xs p-4 mx-auto border border-black">
              <img 
                src={officialStamp} 
                alt="Official Stamp" 
                className="object-contain max-w-full max-h-full mx-auto"
              />
              <button
                onClick={() => setOfficialStamp(null)}
                className="absolute flex items-center justify-center w-5 h-5 text-white bg-black top-1 right-1 print:hidden"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer print:hidden">
              <div className="flex items-center justify-center h-32 max-w-xs p-4 mx-auto text-center border border-black">
                <div>
                  <p className="text-sm text-black">Upload Official Stamp</p>
                  <p className="text-xs text-black">(Will be permanently saved)</p>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleOfficialStampUpload} 
                className="hidden" 
              />
            </label>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default WilliamNtleleTemplate;
