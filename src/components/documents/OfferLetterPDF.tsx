/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Intern, CompanySettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Register standard fonts if needed, but Helvetica is default
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 70,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logoPlaceholder: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  companyInfo: {
    alignItems: 'flex-end',
    maxWidth: '50%',
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  companyMeta: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'right',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  date: {
    marginBottom: 15,
    fontSize: 10,
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
  recipientCity: {
    fontSize: 10,
    color: '#475569',
  },
  body: {
    marginBottom: 15,
    textAlign: 'justify',
  },
  paragraph: {
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  // Internship Details Table
  tableContainer: {
    marginVertical: 15,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableHeader: {
    backgroundColor: '#3B82F6', // Blue header
    padding: 8,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowStriped: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
  },
  tableLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#2563EB', // Blue labels
    fontSize: 9,
  },
  tableValue: {
    width: '70%',
    color: '#334155',
    fontSize: 9,
  },
  // Terms & Conditions Box
  termsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
    flex: 1,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: '#475569',
  },
  acceptanceText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#475569',
    marginBottom: 20,
    textAlign: 'justify',
  },
  closing: {
    marginBottom: 30,
  },
  // Signatures
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureBox: {
    width: '45%',
  },
  signatureImage: {
    height: 40,
    objectFit: 'contain',
    marginBottom: 5,
  },
  signatureLineEmpty: {
    height: 45, // Space for physical signature if no image
  },
  signatureDivider: {
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: 5,
    marginTop: 5,
  },
  signerName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 1,
  },
  signerTitle: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 1,
  },
  companyLink: {
    fontSize: 8,
    color: '#2563EB',
    marginTop: 3,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#3B82F6', // Blue top border for footer
    paddingTop: 10,
  },
  footerLeft: {
    width: '75%',
  },
  footerLine: {
    fontSize: 8,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  footerText: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 2,
  },
  footerLink: {
    fontSize: 8,
    color: '#2563EB',
    marginBottom: 2,
  },
  footerRight: {
    width: '25%',
    alignItems: 'flex-end',
  },
  qrCode: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  scanText: {
    fontSize: 6,
    color: '#3B82F6',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  // Format joining date and calculate end date (+2 months)
  const startDateObj = new Date(joiningDate);
  const formattedStartDate = startDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const endDateObj = new Date(startDateObj);
  endDateObj.setMonth(endDateObj.getMonth() + 2);
  // Subtract 1 day to make it exactly 2 months (e.g., July 1 to Aug 31)
  endDateObj.setDate(endDateObj.getDate() - 1);
  const formattedEndDate = endDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const logoSrc = companySettings.company_logo_url || logoBase64 || null;
  const cName = companySettings.company_name || '[Update in Settings]';
  const cAddress = companySettings.company_address || '[Update in Settings]';
  const cWebsite = companySettings.company_website || '[Update in Settings]';
  const cEmail = companySettings.company_email || '[Update in Settings]';
  const cPhone = companySettings.company_phone || '[Update in Settings]';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: Logo Left, Info Right */}
        <View style={styles.headerContainer}>
          <View>
            {logoSrc ? (
              <Image style={{ maxHeight: 35, maxWidth: 150, objectFit: 'contain' }} src={logoSrc} />
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
        <Text style={styles.title}>INTERNSHIP OFFER LETTER</Text>

        {/* Date */}
        <Text style={styles.date}>Date: {currentDate}</Text>

        {/* Recipient */}
        <View style={styles.recipient}>
          <Text style={styles.recipientName}>[{intern.full_name}]</Text>
          {intern.city && <Text style={styles.recipientCity}>{intern.city}</Text>}
        </View>

        {/* Body Intro */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>
            Dear [{intern.full_name}],
          </Text>
          <Text style={styles.paragraph}>
            We are pleased to offer you an internship position as a <Text style={styles.boldText}>[{intern.domain}] Intern</Text> at {cName}. We were highly impressed by your academic record and technical skill level.
          </Text>
          <Text style={styles.paragraph}>
            This internship is designed to give you hands-on experience in software development and industry best practices. Below are the key details and terms of your internship:
          </Text>
        </View>

        {/* Internship Details Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>INTERNSHIP DETAILS</Text>
          </View>
          <View style={styles.tableRowStriped}>
            <Text style={styles.tableLabel}>Program</Text>
            <Text style={styles.tableValue}>{intern.domain} Internship Program 2026</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Duration</Text>
            <Text style={styles.tableValue}><Text style={styles.boldText}>{formattedStartDate}</Text> to <Text style={styles.boldText}>{formattedEndDate}</Text> (2 Months)</Text>
          </View>
          <View style={styles.tableRowStriped}>
            <Text style={styles.tableLabel}>Mode</Text>
            <Text style={styles.tableValue}>Remote</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Projects</Text>
            <Text style={styles.tableValue}>4 real world projects</Text>
          </View>
          <View style={styles.tableRowStriped}>
            <Text style={styles.tableLabel}>Compensation</Text>
            <Text style={styles.tableValue}>Unpaid — Certificate + Experience</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Reg. No</Text>
            <View style={{ borderWidth: 1, borderColor: '#93C5FD', padding: 2, paddingHorizontal: 4, borderRadius: 2 }}>
              <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>[{intern.registration_number}]</Text>
            </View>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>This internship is unpaid and remote-based.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>Intern must complete all 4 assigned projects to receive certificate.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{cName} reserves the right to terminate internship for misconduct.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>By accepting this offer, intern agrees to {cName}&apos;s code of conduct and policies.</Text>
          </View>
        </View>

        {/* Acceptance Paragraph */}
        <Text style={styles.acceptanceText}>
          By accepting this offer letter, you confirm your commitment to the {cName} Summer Internship Program 2026 and agree to abide by all terms and conditions stated herein.
        </Text>

        <Text style={styles.closing}>Sincerely,</Text>

        {/* Signatures Container */}
        <View style={styles.signatureContainer}>
          {/* Left Side: Admin */}
          <View style={styles.signatureBox}>
            {signatureUrl ? (
              <Image style={styles.signatureImage} src={signatureUrl} />
            ) : (
              <View style={styles.signatureLineEmpty} />
            )}
            <View style={styles.signatureDivider}>
              <Text style={styles.signerName}>{adminName}</Text>
              <Text style={styles.signerTitle}>{adminDesignation}</Text>
              <Text style={styles.companyLink}>{cName} 🌐 ✍️</Text>
            </View>
          </View>

          {/* Right Side: Intern */}
          <View style={styles.signatureBox}>
            <View style={styles.signatureLineEmpty} />
            <View style={styles.signatureDivider}>
              <Text style={styles.signerTitle}>Intern Signature</Text>
              <Text style={styles.signerName}>[{intern.full_name}]</Text>
              <Text style={styles.signerTitle}>Date: ____________________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Footer Left */}
          <View style={styles.footerLeft}>
            <Text style={styles.footerLine}>{cWebsite.replace('https://', '').replace('http://', '')} | {cEmail}</Text>
            <Text style={styles.footerText}>WhatsApp: {cPhone}</Text>
            <Text style={styles.footerLink}>Verify: offerletter.cloudexify.site/verify</Text>
            <Text style={styles.footerLine}>Document ID: {offerLetterNumber}</Text>
            <Text style={styles.footerText}>© 2026 {cName}. All rights reserved.</Text>
          </View>

          {/* Footer Right: QR Code */}
          <View style={styles.footerRight}>
            {qrCodeBase64 ? (
              <Image style={styles.qrCode} src={qrCodeBase64} />
            ) : (
              <View style={[styles.qrCode, { backgroundColor: '#E2E8F0' }]} />
            )}
            <Text style={styles.scanText}>SCAN TO VERIFY</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
export default OfferLetterPDF;
