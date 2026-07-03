/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Intern, CompanySettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  borderContainer: {
    borderWidth: 8,
    borderColor: '#0F172A',
    height: '100%',
    padding: 30,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: '#D4AF37', // Gold accent
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
    pointerEvents: 'none',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 6,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 25,
  },
  mainHeader: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
  },
  certText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 15,
  },
  internName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563EB',
    paddingBottom: 4,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 1.8,
    maxWidth: '85%',
    marginBottom: 30,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
    alignItems: 'flex-end',
  },
  metaBox: {
    alignItems: 'center',
    width: '30%',
  },
  signatureImage: {
    width: 100,
    height: 35,
    marginBottom: 5,
    objectFit: 'contain',
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    paddingTop: 5,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 7,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  metaVal: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  certId: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    fontSize: 7,
    color: '#94A3B8',
  },
  companyWebsite: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    fontSize: 7,
    color: '#94A3B8',
  },
  // QR code section — bottom right corner
  qrSection: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    alignItems: 'center',
  },
  qrImage: {
    width: 50,
    height: 50,
  },
  qrLabel: {
    fontSize: 5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  qrUrl: {
    fontSize: 4,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // Verification footer
  verificationFooter: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    fontSize: 6,
    color: '#9ab3d0ff',
    textAlign: 'center',
  },
});

interface CertificateProps {
  intern: Intern;
  companySettings: CompanySettings;
  adminName: string;
  adminDesignation?: string | null;
  signatureUrl?: string | null;
  completionDate: string;
  logoBase64?: string | null;
  qrCodeBase64?: string | null;
}

export const CertificatePDF: React.FC<CertificateProps> = ({
  intern,
  companySettings,
  adminName,
  adminDesignation,
  signatureUrl,
  completionDate,
  logoBase64,
  qrCodeBase64,
}) => {
  const logoSrc = companySettings.company_logo_url || logoBase64 || null;
  const verificationUrl = `https://admin.cloudexify.site/verify/${intern.registration_number}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderContainer}>
          <View style={styles.innerBorder} />

          {/* Logo / Branding — FIX 9: centered at top, max 160px wide */}
          {logoSrc ? (
            <Image style={{ maxHeight: 50, maxWidth: 160, objectFit: 'contain', marginBottom: 2 }} src={logoSrc} />
          ) : (
            <Text style={styles.logo}>{companySettings.company_name.toUpperCase()}</Text>
          )}
          <Text style={styles.subtitle}>Software Development Company</Text>

          {/* Certificate Title */}
          <Text style={styles.mainHeader}>Certificate of Completion</Text>
          <Text style={styles.certText}>This is proudly presented to</Text>

          {/* Intern Name */}
          <Text style={styles.internName}>{intern.full_name}</Text>

          {/* Body Description */}
          <Text style={styles.descriptionText}>
            for successfully completing a 2-month remote internship program from{' '}
            <Text style={styles.bold}>
              {formatDate(new Date(new Date(completionDate).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString())}
            </Text>{' '}
            to <Text style={styles.bold}>{formatDate(completionDate)}</Text> as a{' '}
            <Text style={styles.bold}>{intern.domain} Intern</Text> at{' '}
            {companySettings.company_name}. During this period, the intern demonstrated exceptional
            dedication, diligence, and technical aptitude in building production-ready features.
          </Text>

          {/* Footer Metadata & Signatures */}
          <View style={styles.metaContainer}>
            <View style={styles.metaBox}>
              <Text style={styles.metaVal}>{formatDate(completionDate)}</Text>
              <View style={styles.signatureLine}>
                <Text style={styles.metaLabel}>Date of Issue</Text>
              </View>
            </View>

            <View style={styles.metaBox}>
              {/* Gold Seal */}
              <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#FFFDF0', alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
                <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#D4AF37' }}>CX</Text>
                <Text style={{ fontSize: 4, color: '#D4AF37' }}>SEAL</Text>
              </View>
              <Text style={{ fontSize: 7, color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase' }}>Verified</Text>
            </View>

            <View style={styles.metaBox}>
              {signatureUrl ? (
                <Image style={styles.signatureImage} src={signatureUrl} />
              ) : (
                <View style={{ height: 35 }} />
              )}
              <View style={styles.signatureLine}>
                <Text style={styles.metaVal}>{adminName}</Text>
                <Text style={styles.metaLabel}>{adminDesignation || 'Authorized Signature'}</Text>
              </View>
            </View>
          </View>

          {/* Certificate ID — bottom left */}
          <Text style={styles.certId}>Certificate ID: {intern.registration_number}</Text>

          {/* FIX 6: QR Code — bottom right */}
          {qrCodeBase64 && (
            <View style={styles.qrSection}>
              <Image style={styles.qrImage} src={qrCodeBase64} />
              <Text style={styles.qrLabel}>Scan to verify certificate</Text>
              <Text style={styles.qrUrl}>{verificationUrl}</Text>
            </View>
          )}

          {/* Company website — bottom right (pushed left when QR exists) */}
          {!qrCodeBase64 && (
            <Text style={styles.companyWebsite}>{companySettings.company_website}</Text>
          )}

          {/* FIX 7: Verification footer */}
          <Text style={styles.verificationFooter}>
            This document can be verified at admin.cloudexify.site/verify/{intern.registration_number}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
export default CertificatePDF;
