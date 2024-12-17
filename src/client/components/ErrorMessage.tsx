import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md border border-red-200">
      {message}
    </div>
  );
};

export default ErrorMessage; 