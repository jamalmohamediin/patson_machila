import React, { useState } from 'react';
import FluoroscopyRequestForm from './forms/FluoroscopyRequestForm/FluoroscopyRequestForm';
import RadiographerInvoiceForm from './forms/RadiographerInvoiceForm/RadiographerInvoiceForm';
import WilliamNtleleTemplate from '../../WilliamNtleleTemplate';

const MedicalFormsContainer = () => {
  const [currentTab, setCurrentTab] = useState('fluoroscopy');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <ul className="flex flex-wrap justify-center gap-4 mb-6">
        <li
          onClick={() => setCurrentTab('fluoroscopy')}
          className={currentTab === 'fluoroscopy' ? 'text-indigo-500 font-bold cursor-pointer' : 'hover:text-indigo-500 cursor-pointer'}
        >
          Fluoroscopy Request Form
        </li>
        <li
          onClick={() => setCurrentTab('invoice')}
          className={currentTab === 'invoice' ? 'text-indigo-500 font-bold cursor-pointer' : 'hover:text-indigo-500 cursor-pointer'}
        >
          Radiographer Invoice Form
        </li>
        <li
          onClick={() => setCurrentTab('patson')}
          className={currentTab === 'patson' ? 'text-indigo-500 font-bold cursor-pointer' : 'hover:text-indigo-500 cursor-pointer'}
        >
          Patson Machila Referral Form
        </li>
      </ul>

      {/* Tab Content */}
      {currentTab === 'fluoroscopy' && <FluoroscopyRequestForm />}
      {currentTab === 'invoice' && <RadiographerInvoiceForm />}
      {currentTab === 'patson' && <WilliamNtleleTemplate />}
    </div>
  );
};

export default MedicalFormsContainer;
