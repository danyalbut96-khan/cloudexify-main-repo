import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldAlert, LogIn, Briefcase, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Project Submission Guidelines | Cloudexify',
  description: 'Learn how to submit your internship projects at Cloudexify.',
};

export default function SubmitProjectGuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans">
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Submission</span> Guidelines
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Follow these simple steps to securely submit your internship projects and track your progress through our automated system.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <div className="space-y-12">
              
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <LogIn className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Step 1: Login to your Portal</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Access your secure intern dashboard by logging in with the email address and registration number you received in your offer letter.
                  </p>
                  <Link href="/login" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Go to Login Page <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Step 2: Access Project Submission</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Once logged into your Dashboard, look for the <strong>&quot;Project Submission&quot;</strong> tab in the sidebar navigation menu on the left side of your screen.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Step 3: Fill the Submission Form</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Submit your projects one by one. Make sure you select the correct Project Number from the dropdown and provide a valid public GitHub repository URL.
                  </p>
                  <ul className="space-y-2 text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ensure your repository is set to <strong>Public</strong>.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verify your Project Title and Description.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Double check the Project Number before submitting.</li>
                  </ul>
                </div>
              </div>

            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6">
                <ShieldAlert className="w-6 h-6 text-blue-400 mr-3" />
                <span className="text-blue-100 font-medium">Your data is secured and mapped to your registration ID.</span>
              </div>
              
              <Link 
                href="/login"
                className="block w-full sm:w-auto sm:inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
              >
                Login to Submit Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
