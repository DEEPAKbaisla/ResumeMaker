import React from "react";
import logo from "../../assets/logo.svg"

const Footer = () => {
  return (
    <>
      <footer className="flex flex-col items-center border-t border-slate-200 bg-slate-50 text-slate-900 pt-20 pb-10 px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="w-full max-w-7xl flex flex-wrap justify-between gap-12 md:gap-20 mb-16">
          
          <div className="flex flex-col gap-6 max-w-xs">
            <a href="#" className="flex items-center gap-2">
              <img src={logo} alt="logo" className="h-8 w-auto" />
              <span className="font-bold text-xl tracking-tight text-slate-800">ResumeMaker</span>
            </a>
            <p className="text-slate-600 text-sm leading-relaxed">
              Making every customer feel valued—no matter the size of your audience. Build your dream career with us.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-600 hover:-translate-y-1 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-600 hover:-translate-y-1 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-600 hover:-translate-y-1 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path><path d="m10 15 5-3-5-3z"></path></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-16 lg:gap-24">
            <div>
              <p className="text-slate-900 font-semibold mb-4">Product</p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="/" className="hover:text-green-600 transition-colors">Home</a></li>
                <li><a href="/" className="hover:text-green-600 transition-colors">Services</a></li>
                <li><a href="/" className="hover:text-green-600 transition-colors">Pricing</a></li>
                <li><a href="/" className="hover:text-green-600 transition-colors">Affiliate</a></li>
              </ul>
            </div>
            <div>
              <p className="text-slate-900 font-semibold mb-4">Resources</p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="/" className="hover:text-green-600 transition-colors">Company</a></li>
                <li><a href="/" className="hover:text-green-600 transition-colors">Blogs</a></li>
                <li><a href="/" className="hover:text-green-600 transition-colors">Community</a></li>
                <li>
                  <a href="/" className="hover:text-green-600 transition-colors flex items-center gap-2">
                    Careers
                    <span className="text-[10px] font-bold tracking-wider text-green-800 bg-green-200 rounded-full px-2 py-0.5">HIRING</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-slate-900 font-semibold mb-4">Legal</p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="/" className="hover:text-green-600 transition-colors">Privacy</a></li>
                <li><a href="/" className="hover:text-green-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ResumeMaker Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
