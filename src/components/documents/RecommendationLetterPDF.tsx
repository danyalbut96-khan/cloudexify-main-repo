/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Intern, CompanySettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 55,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.6,
    color: '#334155',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 15,
    marginBottom: 25,
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
  date: {
    marginBottom: 15,
    fontSize: 9,
    color: '#475569',
  },
  salutation: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
    marginTop: 10,
  },
  body: {
    marginBottom: 35,
    textAlign: 'justify',
  },
  paragraph: {
    marginBottom: 15,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  closing: {
    marginTop: 20,
    marginBottom: 40,
  },
  signatureContainer: {
    width: '45%',
  },
  signatureImage: {
    width: 100,
    height: 40,
    marginBottom: 5,
    objectFit: 'contain',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    paddingTop: 5,
  },
  signerTitle: {
    fontSize: 8,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 55,
    right: 55,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94A3B8',
  },
  // FIX 7: Verification footer
  verificationFooter: {
    position: 'absolute',
    bottom: 14,
    left: 55,
    right: 55,
    fontSize: 6,
    color: '#CBD5E1',
    textAlign: 'center',
  },
});

interface RecommendationLetterProps {
  intern: Intern;
  companySettings: CompanySettings;
  adminName: string;
  adminDesignation?: string | null;
  signatureUrl?: string | null;
  completionDate: string;
  customText?: string;
  logoBase64?: string | null;
}

export const RecommendationLetterPDF: React.FC<RecommendationLetterProps> = ({
  intern,
  companySettings,
  adminName,
  adminDesignation,
  signatureUrl,
  completionDate,
  customText,
  logoBase64,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startDate = new Date(new Date(completionDate).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const logoSrc = companySettings.company_logo_url || logoBase64 || null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header — FIX 9: logo on left */}
        <View style={styles.headerContainer}>
          <View>
            {logoSrc ? (
              <Image style={{ maxHeight: 40, maxWidth: 120, objectFit: 'contain' }} src={logoSrc} />
            ) : (
              <Text style={styles.logoPlaceholder}>{companySettings.company_name}</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companySettings.company_name}</Text>
            <Text style={styles.companyMeta}>{companySettings.company_address}</Text>
            <Text style={styles.companyMeta}>{companySettings.company_website} | {companySettings.company_email}</Text>
          </View>
        </View>

        {/* Date */}
        <Text style={styles.date}>Date: {currentDate}</Text>

        {/* Salutation */}
        <Text style={styles.salutation}>TO WHOM IT MAY CONCERN</Text>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>
            It is my pleasure to write this letter of recommendation for <Text style={styles.bold}>{intern.full_name}</Text>, who recently completed a 2-month internship as a <Text style={styles.bold}>{intern.domain} Intern</Text> at <Text style={styles.bold}>{companySettings.company_name}</Text>. The internship took place from <Text style={styles.bold}>{formatDate(startDate)}</Text> to <Text style={styles.bold}>{formatDate(completionDate)}</Text>.
          </Text>
          
          {customText ? (
            <Text style={styles.paragraph}>{customText}</Text>
          ) : (
            <>
              <Text style={styles.paragraph}>
                During this tenure, <Text style={styles.bold}>{intern.full_name}</Text> demonstrated an exceptional work ethic and a deep understanding of software engineering concepts. They were actively involved in analyzing application requirements, implementing modular features, and cooperating with peer engineers on remote projects.
              </Text>
              <Text style={styles.paragraph}>
                They consistently proved to be highly analytical and details-oriented, resolving programming challenges with structured, clean logic. Their ability to quickly adapt to our stack and understand complex features was commendable. Beyond their technical skills, they have strong communication skills and collaborate effectively as a team player.
              </Text>
              <Text style={styles.paragraph}>
                We believe <Text style={styles.bold}>{intern.full_name}</Text> has great potential as a developer and will be a valuable asset to any technical team. I recommend them without reservation and wish them all the success in their career.
              </Text>
            </>
          )}
        </View>

        {/* Closing */}
        <Text style={{ marginBottom: 20 }}>Sincerely,</Text>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          {signatureUrl ? (
            <Image style={styles.signatureImage} src={signatureUrl} />
          ) : (
            <View style={{ height: 40 }} />
          )}
          <View style={styles.signatureLine}>
            <Text style={styles.bold}>{adminName}</Text>
            <Text style={styles.signerTitle}>{adminDesignation || 'Managing Director / Founder'}</Text>
            <Text style={styles.signerTitle}>{companySettings.company_name}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>CloudExify Software Development</Text>
          <Text>Verification ID: {intern.registration_number}</Text>
        </View>

        {/* FIX 7: Verification footer */}
        <Text style={styles.verificationFooter}>
          This document can be verified at cloudexify.com/verify/{intern.registration_number}
        </Text>
      </Page>
    </Document>
  );
};
export default RecommendationLetterPDF;
