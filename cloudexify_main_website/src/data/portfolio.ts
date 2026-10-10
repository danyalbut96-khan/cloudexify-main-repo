export interface PortfolioProject {
  id: number;
  title: string;
  slug: string;
  liveLink: string;
  techStack: string[];
  description: string;
  category: string;
  categoryGroup: string;
  status: string;
  image: string;
  imageAlt: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 1,
    title: 'AI-Powered SaaS Platform with 42+ Tools',
    slug: 'ai-tools-saas',
    liveLink: 'https://multi-tool-system.vercel.app/',
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI API'],
    description:
      'Built a complete SaaS platform featuring 42+ productivity tools including image editing, PDF manipulation, AI writing assistance, code formatting, and developer utilities. Features a single-page React application with clean dark UI, smooth animations, and optimized user experience.',
    category: 'SaaS Platform',
    categoryGroup: 'SaaS / Web Apps',
    status: 'Live',
    image: '/images/portfolio/project-1-ai-tools-saas.png.png',
    imageAlt:
      'AI-Powered SaaS dashboard showing 42+ productivity tool cards in a dark-themed grid layout with green and cyan accents',
  },
  {
    id: 2,
    title: 'Professional Landing Page for Digital Creator',
    slug: 'digital-creator-landing',
    liveLink: 'https://sarwaan.vercel.app/',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    description:
      'Clean, high-converting landing page designed for a digital content creator. Features modern animations, optimized layout with clear CTAs, mobile-first responsive design, and fast loading speeds. Includes hero section with animations, portfolio showcase, and contact section.',
    category: 'Landing Page',
    categoryGroup: 'Business Websites',
    status: 'Live',
    image: '/images/portfolio/project-2-digital-creator.png.png',
    imageAlt:
      'Professional digital creator landing page with modern hero section, animations, and clear call-to-action buttons',
  },
  {
    id: 3,
    title: 'Beauty Salon Business Website',
    slug: 'makeup-studio-website',
    liveLink: 'https://ayanoormakeupstudio.vercel.app/',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    description:
      'Complete multi-page business website for a beauty salon (Ayanoor Makeup Studio). Includes service listings, image gallery showcasing previous work, online booking/inquiry section, and contact form. SEO-optimized with professional layout designed to attract beauty service clients.',
    category: 'Business Website',
    categoryGroup: 'Business Websites',
    status: 'Live',
    image: '/images/portfolio/project-3-makeup-studio.png.png',
    imageAlt:
      'Beauty salon website homepage with elegant design, service cards, and gallery showcase for Ayanoor Makeup Studio',
  },
  {
    id: 4,
    title: 'Gym & Fitness Center Website',
    slug: 'fitness-gym-website',
    liveLink: 'https://royalfitnesgym.vercel.app/',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    description:
      'Modern fitness center website for Royal Fitness Gym. Features comprehensive service sections with class offerings, pricing plans for different memberships, trainer profile cards, membership comparison table, and WhatsApp contact integration for lead generation.',
    category: 'Business Website',
    categoryGroup: 'Business Websites',
    status: 'Live',
    image: '/images/portfolio/project-4-royal-fitness.png.png',
    imageAlt:
      'Royal Fitness Gym website showing services section with pricing plans, trainer profiles, and energetic fitness design',
  },
  {
    id: 5,
    title: 'AI-Powered Medicine Information System',
    slug: 'medi-finder-ai',
    liveLink: 'https://medi-finder-ai.vercel.app/',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Claude AI API'],
    description:
      'Intelligent medicine information and alternative drug finder system. Users can search for any medication and receive AI-powered information including alternative drug options, side effects, dosage info, drug interactions, and cost comparison.',
    category: 'Healthcare / AI',
    categoryGroup: 'Healthcare',
    status: 'Live',
    image: '/images/portfolio/project-5-medi-finder.png.png',
    imageAlt:
      'AI-powered medicine information system interface with search functionality and structured medical data display',
  },
  {
    id: 6,
    title: 'Masjid Management System',
    slug: 'masjid-management-system',
    liveLink: 'https://masjid-lilac.vercel.app/',
    techStack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL'],
    description:
      'Comprehensive masjid management platform for administrative control and community engagement. Features donation tracking, prayer timing display, donor database, community announcements, event scheduling, and admin dashboard.',
    category: 'Management System',
    categoryGroup: 'Management Systems',
    status: 'Live',
    image: '/images/portfolio/project-6-masjid-management.png.png',
    imageAlt:
      'Masjid management dashboard showing prayer times, donation tracking, and community announcements interface',
  },
];

export const categoryFilters = [
  'All Projects',
  'SaaS / Web Apps',
  'Business Websites',
  'Healthcare',
  'Management Systems',
];
