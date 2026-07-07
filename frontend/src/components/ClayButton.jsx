import React from 'react';
import './ClayButton.css';

const ClayButton = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  return (
    <button 
      type={type} 
      className={`clay-btn clay-btn-${variant} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ClayButton;
