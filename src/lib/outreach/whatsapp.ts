import { getStoredCredential } from '../ai/openrouter';

export async function sendOutreachWhatsApp({
  to,
  businessName,
  personalizationDetail,
  text
}: {
  to: string;
  businessName?: string;
  personalizationDetail?: string;
  text?: string;
}) {
  const creds = await getStoredCredential('gupshup');
  if (!creds || !creds.apiKey || !creds.sourceNumber) {
    throw new Error('Gupshup WhatsApp API credentials are not configured in settings.');
  }

  const { apiKey, sourceNumber, appName = 'CloudExify', templateId = 'cloudexify_followup' } = creds;

  // Clean the destination phone number (remove any non-digits, ensure country code)
  let cleanNumber = to.replace(/\D/g, '');
  // Default to Pakistan country code (92) if start is 03...
  if (cleanNumber.startsWith('03') && cleanNumber.length === 11) {
    cleanNumber = '92' + cleanNumber.substring(1);
  }

  let messagePayload: any = {};
  if (text) {
    messagePayload = {
      type: 'text',
      text: text
    };
  } else {
    messagePayload = {
      type: 'template',
      template: {
        id: templateId,
        params: [businessName || '', (personalizationDetail || '').slice(0, 100)] // Standard limits for parameters
      }
    };
  }

  const formBody = new URLSearchParams();
  formBody.append('channel', 'whatsapp');
  formBody.append('source', sourceNumber);
  formBody.append('destination', cleanNumber);
  formBody.append('src.name', appName);
  formBody.append('message', JSON.stringify(messagePayload));

  const response = await fetch('https://api.gupshup.io/sm/api/v1/msg', {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': apiKey
    },
    body: formBody
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send WhatsApp message via Gupshup: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  // Gupshup returns status: 'submitted' and messageId
  if (data.status !== 'submitted' && data.status !== 'success') {
    throw new Error(`Gupshup rejected message: ${JSON.stringify(data)}`);
  }

  return data.messageId || 'whatsapp-sent-success';
}
