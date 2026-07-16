import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../global.css';
import { OptionsApp } from '../../options/OptionsApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <OptionsApp />
    </React.StrictMode>
  );
}
