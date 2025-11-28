import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1>Universal Data Format Converter</h1>
        <p className="layout-subtitle">Convert between JSON, YAML, XML, and CSV</p>
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};
