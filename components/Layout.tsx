import React from 'react';
import { Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-50 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-950">Fann <span className="text-emerald-600 font-light">Studio</span></span>
          </div>
          <div className="hidden sm:block text-xs text-emerald-600/70 font-medium">
            POWERED BY GEMINI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 py-8 mt-auto bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Fann Creative Studio. All AI generated content.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;