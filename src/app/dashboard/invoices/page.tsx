'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Download, Trash2, CreditCard, Calendar, User, Receipt, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatPKR, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Invoice Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [lineItems, setLineItems] = useState<any[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [status, setStatus] = useState('unpaid');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to load invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err: any) {
      toast.error(err.message || 'Error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleLineItemChange = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx][field] = value;
    setLineItems(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !projectName) {
      toast.error('Please complete all client and project details.');
      return;
    }

    const invalidLines = lineItems.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidLines) {
      toast.error('Please ensure all line items have description, positive quantity and unit price.');
      return;
    }

    setIsSubmitting(true);
    const invoiceToast = toast.loading('Generating invoice...');
    
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          project_name: projectName,
          line_items: lineItems,
          amount_pkr: calculateTotal(),
          status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save invoice');

      toast.success(`Invoice ${data.invoice_number} generated!`, { id: invoiceToast });
      
      // Auto-trigger PDF download
      handleDownload(data.id, data.invoice_number);

      // Reset Form and close modal
      setClientName('');
      setClientEmail('');
      setProjectName('');
      setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setIsOpen(false);
      
      // Refresh list
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Error saving invoice', { id: invoiceToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (id: string, num: string) => {
    const downloadToast = toast.loading(`Downloading Invoice PDF...`);
    try {
      const response = await fetch(`/api/documents/invoice?invoiceId=${id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${num}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Invoice downloaded successfully!', { id: downloadToast });
    } catch (err: any) {
      toast.error(err.message || 'Download failed', { id: downloadToast });
    }
  };

  return (
    <PageWrapper
      title="Invoices Management"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-1.5 shadow-md shadow-blue-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </Button>
      }
    >
      {/* Invoices List Grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Invoice No</th>
                  <th className="px-6 py-3.5">Client Name</th>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Amount (PKR)</th>
                  <th className="px-6 py-3.5">Generated By</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-950">{inv.client_name}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{inv.project_name}</td>
                    <td className="px-6 py-4 font-bold text-slate-950">{formatPKR(inv.amount_pkr)}</td>
                    <td className="px-6 py-4 text-slate-400 truncate max-w-[120px]">{inv.generated_by}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(inv.generated_date)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(inv.id, inv.invoice_number)}
                        className="text-blue-600 hover:bg-blue-50/50 py-1 px-2.5 rounded-lg h-7 font-bold text-xs"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}

                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No invoices have been generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Generator Modal Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Generate New Invoice"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Swift Logistics Pakistan"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Client Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Client Email</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="billing@swiftlogistics.pk"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Project Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Project Reference</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. SaaS CRM Custom Portal development"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Line Items section */}
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Line Items</h4>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center space-x-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                  {/* Desc */}
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Item description..."
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      className="block w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  {/* Qty */}
                  <div className="w-16">
                    <input
                      type="number"
                      required
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="block w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  {/* Unit price */}
                  <div className="w-28">
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Price"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="block w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 text-right focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  {/* Delete btn */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-slate-100 pt-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Invoice Status</label>
              <div className="flex items-center space-x-4 mt-1">
                <label className="inline-flex items-center text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="unpaid"
                    checked={status === 'unpaid'}
                    onChange={() => setStatus('unpaid')}
                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="ml-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Unpaid</span>
                </label>
                <label className="inline-flex items-center text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="paid"
                    checked={status === 'paid'}
                    onChange={() => setStatus('paid')}
                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="ml-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
                </label>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Subtotal Amount</p>
              <p className="text-xl font-black text-slate-900">{formatPKR(calculateTotal())}</p>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Generate Invoice PDF
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
