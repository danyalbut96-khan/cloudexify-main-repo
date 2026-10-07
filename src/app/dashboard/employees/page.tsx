import React from 'react';

export const metadata = {
  title: 'Employee Management | CloudExify',
  description: 'Manage employees for CloudExify.',
};

export default function EmployeesPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Employee Management</h1>
          <p className="text-slate-400 mt-1">
            View and manage all your employees from one place.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
          + Add New Employee
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center mt-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No Employees Found</h3>
        <p className="text-slate-400 max-w-sm mx-auto mb-6">
          You haven't added any employees yet. Click the button above to add your first employee to the system.
        </p>
      </div>
    </div>
  );
}
