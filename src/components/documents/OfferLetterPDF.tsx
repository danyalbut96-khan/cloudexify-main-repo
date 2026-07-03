/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Intern, CompanySettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#334155',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 20,
  },
  companyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  companyMeta: {
    fontSize: 8,
    color: '#64748B',
  },
  logoPlaceholder: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    marginBottom: 10,
    fontSize: 8.5,
    color: '#475569',
  },
  recipient: {
    marginBottom: 15,
  },
  recipientName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  recipientDetails: {
    fontSize: 8.5,
    color: '#475569',
  },
  body: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  paragraph: {
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  termsTable: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 6,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 6,
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
    marginTop: 15,
    marginBottom: 30,
  }, signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 15,
    marginBottom: 8,
  },

  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },

  signatureImage: {
    width: 110,
    height: 45,
    marginBottom: 8,
    objectFit: 'contain',
  },

  signatureLine: {
    width: '90%',
    borderTopWidth: 1,
    borderTopColor: '#64748B',
    paddingTop: 8,
    alignItems: 'center',
  },

  signerTitle: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 45,
    right: 45,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  footerLeft: {
    width: '75%',
  },

  footerRight: {
    width: '22%',
    alignItems: 'flex-end',
  },

  footerText: {
    fontSize: 7,
    color: '#475569',
    lineHeight: 1.3,
  },

  footerTextBold: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 1.3,
  },

  footerSmall: {
    fontSize: 6.5,
    color: '#94A3B8',
    marginTop: 2,
  },

  internLabel: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 4,
  },

  internName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
  },

  internLine: {
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#64748B',
    marginBottom: 8,
  },

  dateLine: {
    width: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#64748B',
    marginTop: 2,
  },

  qrCode: {
    width: 42,
    height: 42,
    marginBottom: 2,
  },

  verifyText: {
    fontSize: 5.5,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
  },
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
  const cWebsite = companySettings.company_website || 'cloudexify.site';
  const cEmail = companySettings.company_email || 'hello@cloudexify.site';

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
          {intern.city && <Text style={styles.recipientDetails}></Text>}
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
        <Text style={styles.closing}>Sincerely,</Text>

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
          <View style={styles.footerLeft}>
            <Text style={styles.footerTextBold}>
              {cWebsite.replace('https://', '').replace('http://', '')} | {cEmail}
            </Text>
            {companySettings.company_phone && (
              <Text style={styles.footerText}>WhatsApp: {companySettings.company_phone}</Text>
            )}
            <Text style={[styles.footerText, { color: '#2563EB' }]}>
              Verify: admin.cloudexify.site/verify/{offerLetterNumber}
            </Text>
            <Text style={styles.footerTextBold}>
              Document ID: {offerLetterNumber}
            </Text>
            <Text style={styles.footerSmall}>© 2026 {cName}. All rights reserved.</Text>
          </View>
          <View style={styles.footerRight}>
            {qrCodeBase64 && <Image style={styles.qrCode} src={qrCodeBase64} />}
            <Text style={styles.verifyText}>SCAN TO VERIFY</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
export default OfferLetterPDF;
