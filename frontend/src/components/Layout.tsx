import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AIChatBot from './AIChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <AIChatBot />
    </div>
  );
};

export default Layout;


