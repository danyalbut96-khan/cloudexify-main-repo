/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice, CompanySettings } from '@/lib/types';
import { formatDate, formatPKR } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    paddingBottom: 15,
  },
  logoPlaceholder: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5,
  },
  companyDetails: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  invoiceMeta: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'right',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailColumn: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 8,
  },
  detailText: {
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    padding: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
    alignItems: 'center',
  },
  colDesc: { width: '55%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  summaryBox: {
    width: '35%',
    borderTopWidth: 1.5,
    borderTopColor: '#0F172A',
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
    marginTop: 4,
  },
  signatureSection: {
    marginTop: 20,
    width: '40%',
  },
  signatureImage: {
    width: 100,
    height: 35,
    marginBottom: 5,
    objectFit: 'contain',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    paddingTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
  },
});

interface InvoiceProps {
  invoice: any;
  companySettings: CompanySettings;
  adminName: string;
  signatureUrl?: string | null;
}

export const InvoicePDF: React.FC<InvoiceProps> = ({
  invoice,
  companySettings,
  adminName,
  signatureUrl,
}) => {
  const subtotal = invoice.line_items.reduce((sum: number, item: any) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoPlaceholder}>{companySettings.company_name}</Text>
            <Text style={styles.detailText}>{companySettings.company_address}</Text>
            <Text style={styles.detailText}>{companySettings.company_website}</Text>
            <Text style={styles.detailText}>{companySettings.company_email}</Text>
          </View>
          <View style={styles.companyDetails}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceMeta}><Text style={styles.bold}>Invoice No:</Text> {invoice.invoice_number}</Text>
            <Text style={styles.invoiceMeta}><Text style={styles.bold}>Date:</Text> {formatDate(invoice.generated_date)}</Text>
            <Text style={styles.invoiceMeta}><Text style={styles.bold}>Status:</Text> {invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Client & Project Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailColumn}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={[styles.detailText, styles.bold]}>{invoice.client_name}</Text>
            <Text style={styles.detailText}>Email: {invoice.client_email}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.sectionTitle}>Project Reference</Text>
            <Text style={[styles.detailText, styles.bold]}>{invoice.project_name}</Text>
            <Text style={styles.detailText}>Account Executive: {invoice.generated_by}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Item Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total (PKR)</Text>
          </View>

          {invoice.line_items.map((item: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPKR(item.unitPrice).replace('Rs.', '')}</Text>
              <Text style={styles.colTotal}>{formatPKR(item.quantity * item.unitPrice).replace('Rs.', '')}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>Subtotal:</Text>
              <Text>{formatPKR(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Sales Tax ({invoice.tax_percentage || 0}%):</Text>
              <Text>{formatPKR(subtotal * (Number(invoice.tax_percentage || 0) / 100))}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.bold}>Total PKR:</Text>
              <Text style={styles.bold}>{formatPKR(Number(invoice.amount_pkr))}</Text>
            </View>
          </View>
        </View>

        {/* Payment & Bank Details */}
        <View style={{ marginBottom: 25, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 }}>
          <Text style={[styles.bold, { fontSize: 8, marginBottom: 4 }]}>PAYMENT & TRANSFER DETAILS</Text>
          <Text style={{ fontSize: 7, color: '#64748B', marginBottom: 2 }}><Text style={styles.bold}>Terms:</Text> {invoice.payment_terms || 'Net 30'}</Text>
          {companySettings.bank_details && 
            companySettings.bank_details.split('\n').map((line: string, i: number) => (
              <Text key={i} style={{ fontSize: 7, color: '#64748B' }}>{line}</Text>
            ))
          }
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          {signatureUrl ? (
            <Image style={styles.signatureImage} src={signatureUrl} />
          ) : (
            <View style={{ height: 35 }} />
          )}
          <View style={styles.signatureLine}>
            <Text style={styles.bold}>{adminName}</Text>
            <Text style={{ fontSize: 7, color: '#64748B' }}>Authorized By ({invoice.generated_by})</Text>
            <Text style={{ fontSize: 7, color: '#64748B' }}>{companySettings.company_name}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your business. For billing queries, email {companySettings.company_email}</Text>
      </Page>
    </Document>
  );
};
export default InvoicePDF;
