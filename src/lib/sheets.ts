import * as XLSX from 'xlsx';

// Standard mapping mapping spreadsheets columns to Database keys
const columnMappings: Record<string, string[]> = {
  full_name: ['full name', 'name', 'fullname', 'intern name', 'employee name'],
  email: ['email', 'email address', 'emailaddress', 'mail'],
  whatsapp: ['whatsapp', 'phone', 'phone number', 'phonenumber', 'mobile', 'whatsapp number'],
  gender: ['gender', 'sex'],
  university: ['university', 'college', 'school', 'uni'],
  semester: ['semester', 'sem', 'current semester'],
  domain: ['domain', 'track', 'internship track', 'internship domain'],
  skill_level: ['skill level', 'skill', 'skilllevel', 'experience level'],
  available_hours: ['available hours', 'hours', 'availablehours', 'weekly hours'],
  referral_source: ['referral source', 'referral', 'source', 'how did you find us']
};

// Normalized key finder helper
function mapHeaderToKey(header: string): string | null {
  const cleanHeader = header.toLowerCase().trim().replace(/[\s\-_]/g, '');
  for (const [key, aliases] of Object.entries(columnMappings)) {
    if (aliases.some(alias => alias.toLowerCase().replace(/[\s\-_]/g, '') === cleanHeader)) {
      return key;
    }
  }
  return null;
}

export interface ParsedSheetRow {
  full_name?: string;
  email?: string;
  whatsapp?: string;
  gender?: string;
  university?: string;
  semester?: number;
  domain?: string;
  skill_level?: string;
  available_hours?: number;
  referral_source?: string;
  [key: string]: any;
}

export async function fetchAndParseSheet(url: string): Promise<ParsedSheetRow[]> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch sheet content (HTTP ${res.status})`);
    }

    const csvText = await res.text();
    if (!csvText || csvText.trim().length === 0) {
      return [];
    }

    // Parse CSV safely using XLSX parsing engine
    const workbook = XLSX.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });

    if (rawJson.length < 2) {
      return []; // Empty sheet or header only
    }

    const headers = rawJson[0] as string[];
    const rows = rawJson.slice(1) as any[][];

    // Map columns
    const keyIndexes: Record<string, number> = {};
    headers.forEach((header, index) => {
      const mappedKey = mapHeaderToKey(header);
      if (mappedKey) {
        keyIndexes[mappedKey] = index;
      }
    });

    // Translate rows to mapped objects
    const result: ParsedSheetRow[] = [];
    rows.forEach((row) => {
      // Skip empty rows
      if (row.length === 0 || row.every(val => val === null || val === undefined || val === '')) {
        return;
      }

      const item: ParsedSheetRow = {};
      for (const [key, index] of Object.entries(keyIndexes)) {
        const val = row[index];
        if (val !== undefined && val !== null && val !== '') {
          if (key === 'semester' || key === 'available_hours') {
            item[key] = parseInt(val, 10) || undefined;
          } else {
            item[key] = String(val).trim();
          }
        }
      }

      if (item.email && item.full_name) {
        result.push(item);
      }
    });

    return result;
  } catch (error: any) {
    console.error('Error fetching/parsing spreadsheet:', error);
    throw new Error(`Google Sheet integration error: ${error.message || error}`);
  }
}
