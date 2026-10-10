export interface TeamMember {
  id: number;
  name: string;
  initials: string;
  role: string;
  designation: string;
  location: string;
  phone: string;
  email: string;
  bio: string;
  skills: string[];
  certifications?: string[];
  image: string;
  imageAlt: string;
  roleBadgeColor: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Muhammad Majid Khan',
    initials: 'MK',
    role: 'Co-Founder & CEO',
    designation: 'Chief Executive Officer',
    location: 'Islamabad, Pakistan',
    phone: '+92 341 1949277',
    email: 'ceo@cloudexify.site',
    bio: 'Full-stack developer and visionary founder of Cloudexify. Specializes in Next.js, React, React Native, and full-stack development. Leads the technical direction, product development, and overall company strategy.',
    skills: [
      'Next.js / React',
      'TypeScript',
      'React Native',
      'Node.js',
      'Supabase',
      'AI Integration',
      'Leadership',
    ],
    certifications: ['AI Agents — Simplilearn, 2026', 'No-Code AI Agent Building — Simplilearn, 2026'],
    image: '/images/team/team-member-1-majid-khan.png',
    imageAlt: 'Muhammad Majid Khan — Co-Founder and CEO of Cloudexify',
    roleBadgeColor: '#00ff88',
  },
  {
    id: 2,
    name: 'Shayan Abbas',
    initials: 'SA',
    role: 'Co-Founder & Chairman',
    designation: 'Chairman & Strategic Lead',
    location: 'Islamabad, Pakistan',
    phone: '+92 325 3956539',
    email: 'chairman@cloudexify.site',
    bio: 'Strategic leader and co-founder providing high-level business direction for Cloudexify. Focuses on long-term vision, business growth, market expansion, and stakeholder relationships.',
    skills: [
      'Strategic Planning',
      'Business Development',
      'Leadership',
      'Market Analysis',
      'Stakeholder Mgmt',
      'Team Building',
    ],
    image: '/images/team/team-member-2-shayan-abbas.png',
    imageAlt: 'Shayan Abbas — Co-Founder and Chairman of Cloudexify',
    roleBadgeColor: '#00d4ff',
  },
  {
    id: 3,
    name: 'Mustafa Hussain',
    initials: 'MH',
    role: 'Co-Founder & COO',
    designation: 'Chief Operating Officer',
    location: 'Islamabad, Pakistan',
    phone: '+92 340 0488902',
    email: 'coo@cloudexify.site',
    bio: 'Operations expert and co-founder managing day-to-day operations at Cloudexify. Oversees project delivery, team coordination, and client relationships to ensure operational excellence.',
    skills: [
      'Operations Mgmt',
      'Project Mgmt',
      'Client Relations',
      'Team Coordination',
      'Process Optimization',
      'Quality Assurance',
    ],
    image: '/images/team/team-member-3-mustafa-hussain.png',
    imageAlt: 'Mustafa Hussain — Co-Founder and COO of Cloudexify',
    roleBadgeColor: '#ff8800',
  },
];
