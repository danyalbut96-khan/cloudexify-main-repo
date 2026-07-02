/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Intern, CompanySettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
    marginBottom: 30,
  },
  companyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  companyMeta: {
    fontSize: 8,
    color: '#64748B',
  },
  logoPlaceholder: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    marginBottom: 15,
    fontSize: 9,
    color: '#475569',
  },
  recipient: {
    marginBottom: 20,
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  recipientDetails: {
    fontSize: 9,
    color: '#475569',
  },
  body: {
    marginBottom: 25,
    textAlign: 'justify',
  },
  paragraph: {
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  termsTable: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 8,
  },
  tableLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tableValue: {
    width: '70%',
    color: '#475569',
  },
  closing: {
    marginTop: 20,
    marginBottom: 40,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 100,
    height: 40,
    marginBottom: 5,
    objectFit: 'contain',
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    marginTop: 10,
    paddingTop: 5,
    alignItems: 'center',
  },
  signerTitle: {
    fontSize: 8,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94A3B8',
  },
  qrCode: {
    width: 45,
    height: 45,
    marginBottom: 2,
  }
});

interface OfferLetterProps {
  intern: Intern;
  companySettings: CompanySettings;
  adminName: string;
  adminDesignation?: string | null;
  signatureUrl?: string | null;
  joiningDate: string;
  logoBase64?: string | null;
  offerLetterNumber: string;
  qrCodeBase64?: string | null;
}

export const OfferLetterPDF: React.FC<OfferLetterProps> = ({
  intern,
  companySettings,
  adminName,
  adminDesignation,
  signatureUrl,
  joiningDate,
  logoBase64,
  offerLetterNumber,
  qrCodeBase64,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const logoSrc = companySettings.company_logo_url || logoBase64 || null;
  const cName = companySettings.company_name || 'CloudExify';
  const cAddress = companySettings.company_address || 'Address Not Set';
  const cWebsite = companySettings.company_website || 'cloudexify.com';
  const cEmail = companySettings.company_email || 'admin@cloudexify.com';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            {logoSrc ? (
              <Image style={{ maxHeight: 40, maxWidth: 120, objectFit: 'contain' }} src={logoSrc} />
            ) : (
              <Text style={styles.logoPlaceholder}>{cName}</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{cName}</Text>
            <Text style={styles.companyMeta}>{cAddress}</Text>
            <Text style={styles.companyMeta}>{cWebsite} | {cEmail}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Internship Offer Letter</Text>

        {/* Date */}
        <Text style={styles.date}>Date: {currentDate}</Text>

        {/* Recipient */}
        <View style={styles.recipient}>
          <Text style={styles.recipientName}>{intern.full_name}</Text>
          {intern.city && <Text style={styles.recipientDetails}>{intern.city}</Text>}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>
            Dear <Text style={styles.boldText}>{intern.full_name}</Text>,
          </Text>
          <Text style={styles.paragraph}>
            We are pleased to offer you an internship position as a <Text style={styles.boldText}>{intern.domain} Intern</Text> at <Text style={styles.boldText}>{cName}</Text>.
            We were highly impressed by your academic record and technical skill level.
          </Text>
          <Text style={styles.paragraph}>
            This internship is designed to give you hands-on experience in software development and industry best practices. Below are the key details and terms of your internship:
          </Text>

          {/* Terms Table */}
          <View style={styles.termsTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Role</Text>
              <Text style={styles.tableValue}>{intern.domain} Intern</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Start Date</Text>
              <Text style={styles.tableValue}>{formatDate(joiningDate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Duration</Text>
              <Text style={styles.tableValue}>2 Months (Remote)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Compensation</Text>
              <Text style={styles.tableValue}>Unpaid Internship</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableLabel}>Requirement</Text>
              <Text style={styles.tableValue}>Successful project completion & code review for Certification.</Text>
            </View>
          </View>

          <Text style={styles.paragraph}>
            By accepting this offer, you agree to maintain the absolute confidentiality of all intellectual property, source code, and client details that you may have access to during this internship.
          </Text>
          <Text style={styles.paragraph}>
            We look forward to working with you and hope this internship serves as a foundation for a successful software engineering career.
          </Text>
        </View>

        {/* Closing */}
        <Text>Sincerely,</Text>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            {signatureUrl ? (
              <Image style={styles.signatureImage} src={signatureUrl} />
            ) : (
              <View style={{ height: 40 }} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.boldText}>{adminName}</Text>
              <Text style={styles.signerTitle}>{adminDesignation || 'Authorized Signatory'}</Text>
              <Text style={styles.signerTitle}>{cName}</Text>
            </View>
          </View>

          <View style={styles.signatureBox}>
            <View style={{ height: 40 }} />
            <View style={styles.signatureLine}>
              <Text style={styles.boldText}>Intern Signature</Text>
              <Text style={styles.signerTitle}>Acknowledge & Accepted</Text>
              <Text style={styles.signerTitle}>Date: _______________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text>{cName} Internship Program 2026</Text>
            <Text>Document ID: {offerLetterNumber}</Text>
            <Text>Verify at: {cWebsite.replace('https://', '')}/verify</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {qrCodeBase64 && <Image style={styles.qrCode} src={qrCodeBase64} />}
          </View>
        </View>
      </Page>
    </Document>
  );
};
export default OfferLetterPDF;
