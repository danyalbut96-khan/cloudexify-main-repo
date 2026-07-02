/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Proposal, CompanySettings } from '@/lib/types';
import { formatDate, formatPKR } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.6,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0F172A',
    paddingBottom: 15,
    marginBottom: 25,
  },
  logoPlaceholder: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  companyDetails: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaRowLast: {
    flexDirection: 'row',
  },
  metaLabel: {
    width: '25%',
    fontWeight: 'bold',
    color: '#0F172A',
  },
  metaValue: {
    width: '75%',
    color: '#475569',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 2,
  },
  textBlock: {
    textAlign: 'justify',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    marginLeft: 15,
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 10,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  bulletText: {
    width: '95%',
  },
  priceBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    padding: 12,
    marginTop: 15,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  priceVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBox: {
    width: '45%',
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
    paddingTop: 5,
  },
  signerTitle: {
    fontSize: 7.5,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 45,
    right: 45,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    fontSize: 7,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

interface ProposalProps {
  proposal: any;
  companySettings: any;
  adminName: string;
  adminDesignation?: string | null;
  signatureUrl?: string | null;
  logoBase64?: string | null;
}

export const ProposalPDF: React.FC<ProposalProps> = ({
  proposal,
  companySettings,
  adminName,
  adminDesignation,
  signatureUrl,
  logoBase64,
}) => {
  const logoSrc = companySettings.company_logo_url || logoBase64 || null;
  let scopePoints: string[] = [];
  try {
    if (proposal.scope_of_work && proposal.scope_of_work.startsWith('[')) {
      scopePoints = JSON.parse(proposal.scope_of_work);
    } else {
      scopePoints = proposal.scope_of_work
        ? proposal.scope_of_work.split('\n').filter((p: string) => p.trim() !== '')
        : [];
    }
  } catch {
    scopePoints = proposal.scope_of_work
      ? proposal.scope_of_work.split('\n').filter((p: string) => p.trim() !== '')
      : [];
  }

  let timelineTable: any[] = [];
  let isJsonTimeline = false;
  try {
    if (proposal.timeline && proposal.timeline.startsWith('[')) {
      timelineTable = JSON.parse(proposal.timeline);
      isJsonTimeline = true;
    }
  } catch {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {logoSrc ? (
              <Image style={{ maxHeight: 40, maxWidth: 120, objectFit: 'contain', marginBottom: 5 }} src={logoSrc} />
            ) : (
              <Text style={styles.logoPlaceholder}>{companySettings.company_name}</Text>
            )}
            <Text style={{ fontSize: 7, color: '#64748B' }}>{companySettings.company_website}</Text>
          </View>
          <View style={styles.companyDetails}>
            <Text style={{ fontWeight: 'bold' }}>PROJECT PROPOSAL</Text>
            <Text style={{ fontSize: 8, color: '#64748B' }}>Sent: {formatDate(proposal.sent_date)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{proposal.proposal_title}</Text>

        {/* Client Meta Grid */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Prepared For:</Text>
            <Text style={styles.metaValue}>{proposal.client_name} ({proposal.client_email})</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Prepared By:</Text>
            <Text style={styles.metaValue}>{adminName} ({proposal.sent_by})</Text>
          </View>
          <View style={styles.metaRowLast}>
            <Text style={styles.metaLabel}>Status:</Text>
            <Text style={styles.metaValue}>{proposal.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Section: Description */}
        <Text style={styles.sectionTitle}>1. Project Description</Text>
        <Text style={styles.textBlock}>
          {proposal.description || 'No project description was provided. This proposal details the services and technical scope required for building high-quality software solutions.'}
        </Text>

        {/* Section: Scope of Work */}
        <Text style={styles.sectionTitle}>2. Scope of Work</Text>
        {scopePoints.length > 0 ? (
          scopePoints.map((point, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{point.replace(/^[•\-*\d.]+\s*/, '')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.textBlock}>The scope of work is tailored based on detailed project requirements gathering.</Text>
        )}

        {/* Section: Timeline */}
        <Text style={styles.sectionTitle}>3. Implementation Timeline</Text>
        {isJsonTimeline ? (
          <View style={{ marginTop: 5, marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#0F172A', padding: 5, color: '#FFFFFF', fontWeight: 'bold', fontSize: 8 }}>
              <Text style={{ width: '40%' }}>Phase Name</Text>
              <Text style={{ width: '25%', textAlign: 'center' }}>Duration</Text>
              <Text style={{ width: '35%', textAlign: 'right' }}>Key Deliverable</Text>
            </View>
            {timelineTable.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 6, fontSize: 8 }}>
                <Text style={{ width: '40%' }}>{item.phase}</Text>
                <Text style={{ width: '25%', textAlign: 'center' }}>{item.duration}</Text>
                <Text style={{ width: '35%', textAlign: 'right' }}>{item.deliverable}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.textBlock}>
            The estimated delivery timeframe for this project is <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{proposal.timeline || 'TBD'}</Text>.
          </Text>
        )}

        {/* Section: Why CloudExify */}
        <Text style={styles.sectionTitle}>4. Why CloudExify</Text>
        <Text style={styles.textBlock}>
          {proposal.why_cloudexify || 'CloudExify is a Pakistan-based software development company specializing in premium web apps, mobile apps, SaaS, and AI-powered solutions. We ship clean, secure, production-level code.'}
        </Text>

        {/* Section: Pricing */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Estimated Project Cost:</Text>
          <Text style={styles.priceVal}>{formatPKR(proposal.estimated_cost)}</Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            {signatureUrl ? (
              <Image style={styles.signatureImage} src={signatureUrl} />
            ) : (
              <View style={{ height: 35 }} />
            )}
            <View style={styles.signatureLine}>
              <Text style={{ fontWeight: 'bold' }}>{adminName}</Text>
              <Text style={styles.signerTitle}>{adminDesignation || 'Managing Director / Founder'}</Text>
              <Text style={styles.signerTitle}>{companySettings.company_name}</Text>
            </View>
          </View>

          <View style={styles.signatureBox}>
            <View style={{ height: 35 }} />
            <View style={styles.signatureLine}>
              <Text style={{ fontWeight: 'bold' }}>Client Representative</Text>
              <Text style={styles.signerTitle}>Acknowledge & Accepted</Text>
              <Text style={styles.signerTitle}>Date: _______________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>This proposal is valid for 30 days from the date of issue. CloudExify © 2025.</Text>
      </Page>
    </Document>
  );
};
export default ProposalPDF;
