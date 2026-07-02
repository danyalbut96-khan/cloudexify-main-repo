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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
    paddingBottom: 4,
    alignSelf: 'center',
  },
  date: {
    marginBottom: 15,
    fontSize: 9,
    color: '#475569',
  },
  refNumber: {
    marginBottom: 20,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
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
  signatureContainer: {
    marginTop: 40,
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
});

interface ExperienceCertificateProps {
  intern: Intern;
  companySettings: CompanySettings;
  adminName: string;
  signatureUrl?: string | null;
  completionDate: string;
  performanceGrade: 'Excellent' | 'Very Good' | 'Good';
  skillsGained: string; // comma separated list
}

export const ExperienceCertificatePDF: React.FC<ExperienceCertificateProps> = ({
  intern,
  companySettings,
  adminName,
  signatureUrl,
  completionDate,
  performanceGrade,
  skillsGained,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startDate = new Date(new Date(completionDate).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.logoPlaceholder}>{companySettings.company_name}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companySettings.company_name}</Text>
            <Text style={styles.companyMeta}>{companySettings.company_address}</Text>
            <Text style={styles.companyMeta}>{companySettings.company_website} | {companySettings.company_email}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Internship Experience Certificate</Text>

        {/* Ref & Date */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.refNumber}>Ref No: CX-EXP-{intern.registration_number.replace('CX-INT-', '')}</Text>
          <Text style={styles.date}>Date: {currentDate}</Text>
        </View>

        {/* Certificate Body */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>
            This is to certify that <Text style={styles.bold}>{intern.full_name}</Text> has successfully completed an internship program at <Text style={styles.bold}>{companySettings.company_name}</Text> as a <Text style={styles.bold}>{intern.domain} Intern</Text>.
          </Text>
          <Text style={styles.paragraph}>
            The duration of the internship was two months, starting from <Text style={styles.bold}>{formatDate(startDate)}</Text> to <Text style={styles.bold}>{formatDate(completionDate)}</Text>. This internship was carried out remotely under the mentorship of our senior engineering team.
          </Text>
          <Text style={styles.paragraph}>
            During this tenure, <Text style={styles.bold}>{intern.full_name}</Text> contributed to software development activities and gained hands-on expertise in various technologies, including <Text style={styles.bold}>{skillsGained || 'Git, GitHub, and Agile methodologies'}</Text>. They successfully completed all milestone projects, exhibiting strong technical capability and logic implementation skills.
          </Text>
          <Text style={styles.paragraph}>
            We grade their performance and work conduct during the internship as <Text style={styles.bold}>{performanceGrade}</Text>. We found them to be self-motivated, proactive, and quick to learn new technical concepts.
          </Text>
          <Text style={styles.paragraph}>
            We appreciate their valuable contributions to our projects and wish them the absolute best in their future academic and professional endeavors.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          {signatureUrl ? (
            <Image style={styles.signatureImage} src={signatureUrl} />
          ) : (
            <View style={{ height: 40 }} />
          )}
          <View style={styles.signatureLine}>
            <Text style={styles.bold}>{adminName}</Text>
            <Text style={styles.signerTitle}>Managing Director / Founder</Text>
            <Text style={styles.signerTitle}>{companySettings.company_name}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>CloudExify Software Development</Text>
          <Text>Certificate ID: {intern.registration_number}</Text>
        </View>
      </Page>
    </Document>
  );
};
export default ExperienceCertificatePDF;
