import React from 'react';
import { Check, CreditCard, User, FileText } from 'lucide-react';

interface BookingStepIndicatorProps {
  currentStep: number;
}

const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Informations', icon: <User className="w-4 h-4" /> },
    { number: 2, label: 'Paiement', icon: <CreditCard className="w-4 h-4" /> },
    { number: 3, label: 'Confirmation', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${currentStep > step.number 
                  ? 'bg-green-100 text-green-600 border-2 border-green-600' 
                  : currentStep === step.number
                  ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white border-2 border-indigo-600'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                }
              `}>
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`
                text-sm font-medium
                ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BookingStepIndicator;