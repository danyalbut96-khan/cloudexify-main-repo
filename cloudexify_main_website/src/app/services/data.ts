export const servicesData = {
  'web-development': {
    title: 'Web Development',
    heroSubtitle: 'Custom, scalable, and high-performance web applications tailored to your business needs.',
    overview: 'In today\'s digital landscape, your website is your most powerful asset. We build modern, responsive, and blazing-fast web applications using the latest technologies like Next.js and React. Our focus is on delivering exceptional user experiences backed by robust, scalable architecture.',
    features: [
      'Custom Next.js Applications',
      'React Component Architecture',
      'Responsive & Mobile-First Design',
      'Performance Optimization',
      'SEO-Friendly Structure',
      'Modern UI/UX Design',
      'Database Integration',
      'Scalable Architecture'
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    process: [
      { title: 'Discovery & Requirements', desc: 'Understanding your goals and defining the project scope.' },
      { title: 'Design & Wireframing', desc: 'Creating intuitive UI/UX mockups and prototypes.' },
      { title: 'Frontend Development', desc: 'Building responsive interfaces with React and Tailwind.' },
      { title: 'Backend Development', desc: 'Connecting databases, APIs, and business logic.' },
      { title: 'Testing & QA', desc: 'Rigorous testing for functionality, performance, and security.' },
      { title: 'Deployment & Launch', desc: 'Smooth deployment to production and post-launch support.' }
    ],
    useCases: [
      { title: 'E-commerce platforms', icon: '🛒', desc: 'High-conversion online stores.' },
      { title: 'SaaS dashboards', icon: '📊', desc: 'Complex administrative interfaces.' },
      { title: 'Corporate websites', icon: '🏢', desc: 'Professional brand presences.' },
      { title: 'Web portals', icon: '🌐', desc: 'Secure member and client portals.' }
    ],
    examples: [
      { name: 'E-commerce Platform', desc: 'A headless commerce solution serving 10k+ daily users.', tech: 'Next.js, Stripe, Supabase' },
      { name: 'SaaS Dashboard', desc: 'B2B analytics dashboard with real-time data visualization.', tech: 'React, Tailwind, Node.js' }
    ],
    faqs: [
      { q: 'How long does a typical web project take?', a: 'Depending on complexity, between 4 to 12 weeks.' },
      { q: 'Do you provide post-launch support?', a: 'Yes, we offer ongoing maintenance and support packages.' },
      { q: 'Is SEO included?', a: 'Yes, all our Next.js applications are built with technical SEO best practices.' }
    ],
    pricing: 'Starting from $5,000',
    relatedServiceIds: ['full-stack-development', 'api-development', 'saas-development']
  },
  'mobile-app-development': {
    title: 'Mobile App Development',
    heroSubtitle: 'Engaging, high-performance mobile experiences for iOS and Android.',
    overview: 'We design and develop mobile applications that your users will love. Using React Native and Expo, we build cross-platform apps that feel truly native, reducing development time and cost while maintaining the highest quality standards.',
    features: [
      'Cross-Platform Development',
      'React Native & Expo',
      'Native Performance',
      'Push Notifications',
      'Offline Functionality',
      'App Store Optimization',
      'Payment Integration',
      'Real-Time Synchronization'
    ],
    techStack: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'Stripe'],
    process: [
      { title: 'Requirements Gathering', desc: 'Defining the app features and target audience.' },
      { title: 'UI/UX Design', desc: 'Designing native-feeling mobile interfaces.' },
      { title: 'App Development', desc: 'Building the app using React Native.' },
      { title: 'Testing & QA', desc: 'Testing across various screen sizes and OS versions.' },
      { title: 'App Store Submission', desc: 'Publishing to Apple App Store and Google Play.' },
      { title: 'Launch & Support', desc: 'Post-launch monitoring and updates.' }
    ],
    useCases: [
      { title: 'E-commerce shopping', icon: '🛍️', desc: 'Mobile retail experiences.' },
      { title: 'On-demand services', icon: '🚗', desc: 'Real-time booking and tracking.' },
      { title: 'Health & Fitness', icon: '❤️', desc: 'Workout and wellness trackers.' },
      { title: 'Social networking', icon: '💬', desc: 'Community and chat platforms.' }
    ],
    examples: [
      { name: 'Fitness Tracker', desc: 'A cross-platform app for tracking daily workouts with offline support.', tech: 'React Native, SQLite' },
      { name: 'Delivery App', desc: 'Real-time driver tracking and ordering system.', tech: 'Expo, Firebase, Maps API' }
    ],
    faqs: [
      { q: 'Do you develop for both iOS and Android?', a: 'Yes, we use React Native to deploy to both platforms from a single codebase.' },
      { q: 'Can you help publish to the App Stores?', a: 'Absolutely, we handle the entire submission process for Apple and Google.' },
      { q: 'How do you handle app updates?', a: 'We use Over-The-Air (OTA) updates where possible to bypass store reviews for minor fixes.' }
    ],
    pricing: 'Starting from $8,000',
    relatedServiceIds: ['api-development', 'cloud-devops']
  },
  'ai-solutions': {
    title: 'AI Solutions',
    heroSubtitle: 'Leverage artificial intelligence to automate workflows and unlock new capabilities.',
    overview: 'Transform your business with cutting-edge AI solutions. We integrate powerful machine learning models and large language models (LLMs) to create intelligent systems that can understand data, automate tasks, and provide unprecedented insights.',
    features: [
      'AI Agent Development',
      'Chatbots & Virtual Assistants',
      'Machine Learning Integration',
      'NLP Solutions',
      'Computer Vision',
      'Predictive Analytics',
      'Process Automation',
      'Intelligent Analytics'
    ],
    techStack: ['Claude API', 'OpenAI', 'LangChain', 'TensorFlow', 'Python'],
    process: [
      { title: 'Problem Definition', desc: 'Finding where AI can add the most value to your business.' },
      { title: 'Model Selection', desc: 'Choosing the right models and fine-tuning if necessary.' },
      { title: 'Development', desc: 'Building the AI integration layers.' },
      { title: 'Training & Optimization', desc: 'Validating accuracy and safety of AI outputs.' },
      { title: 'Integration', desc: 'Connecting the AI engine to your existing systems.' },
      { title: 'Monitoring & Maintenance', desc: 'Tracking AI performance and improving over time.' }
    ],
    useCases: [
      { title: 'Customer support', icon: '🎧', desc: 'Automated 24/7 intelligent agents.' },
      { title: 'Content generation', icon: '✍️', desc: 'Automated writing and image creation.' },
      { title: 'Data analysis', icon: '📈', desc: 'Extracting insights from unstructured data.' },
      { title: 'Process automation', icon: '⚙️', desc: 'Automating repetitive manual tasks.' }
    ],
    examples: [
      { name: 'Support AI Agent', desc: 'Resolved 60% of tier-1 support tickets automatically.', tech: 'OpenAI, Node.js, Zendesk API' },
      { name: 'Document Parser', desc: 'Extracted structured data from thousands of PDFs.', tech: 'Python, Claude API, OCR' }
    ],
    faqs: [
      { q: 'Is my data secure when using AI APIs?', a: 'Yes, we use enterprise API tiers that guarantee zero data retention for model training.' },
      { q: 'Which AI models do you use?', a: 'We are model-agnostic, choosing the best fit (Claude, GPT-4, Llama) for your specific use case.' },
      { q: 'Can the AI learn from my custom data?', a: 'Yes, we use Retrieval-Augmented Generation (RAG) to ground the AI in your company knowledge base.' }
    ],
    pricing: 'Starting from $6,000',
    relatedServiceIds: ['saas-development', 'full-stack-development']
  },
  'saas-development': {
    title: 'SaaS Development',
    heroSubtitle: 'Complete software-as-a-service solutions from concept to recurring revenue.',
    overview: 'Building a successful SaaS requires more than just good code; it requires rock-solid architecture, seamless billing, and excellent user management. We build secure, scalable, and feature-rich SaaS platforms that are ready to handle thousands of concurrent users.',
    features: [
      'Multi-tenant Architecture',
      'User Authentication',
      'Payment Processing',
      'Subscription Management',
      'Admin Dashboard',
      'Analytics Integration',
      'Security & Compliance',
      'Scalable Infrastructure'
    ],
    techStack: ['Next.js', 'Supabase', 'Stripe', 'AWS', 'Docker'],
    process: [
      { title: 'Planning & Architecture', desc: 'Defining the MVP and designing for scalability.' },
      { title: 'Database Design', desc: 'Structuring secure, multi-tenant databases.' },
      { title: 'Frontend Development', desc: 'Building intuitive user dashboards.' },
      { title: 'Backend Development', desc: 'Developing core business logic and APIs.' },
      { title: 'Payment Integration', desc: 'Implementing Stripe for recurring billing.' },
      { title: 'Testing & Deployment', desc: 'Rigorous QA and cloud launch.' }
    ],
    useCases: [
      { title: 'B2B productivity tools', icon: '💼', desc: 'Workflow optimization platforms.' },
      { title: 'Marketing automation', icon: '🎯', desc: 'Campaign and CRM tools.' },
      { title: 'HR software', icon: '👥', desc: 'Recruiting and employee management.' },
      { title: 'Analytics dashboards', icon: '📊', desc: 'Financial and data reporting.' }
    ],
    examples: [
      { name: 'Marketing SaaS', desc: 'A platform handling 1M+ emails daily with Stripe billing.', tech: 'Next.js, AWS, Stripe' },
      { name: 'HR Platform', desc: 'Multi-tenant system managing payroll and leave.', tech: 'React, Node.js, Supabase' }
    ],
    faqs: [
      { q: 'Do you integrate payment gateways?', a: 'Yes, we heavily utilize Stripe for complex subscription and usage-based billing models.' },
      { q: 'How do you ensure tenant data isolation?', a: 'We use Row Level Security (RLS) in Supabase/PostgreSQL to guarantee strict data boundaries.' },
      { q: 'Can the SaaS scale to millions of users?', a: 'Yes, our cloud-native architectures are designed to auto-scale infinitely.' }
    ],
    pricing: 'Starting from $15,000',
    relatedServiceIds: ['web-development', 'cloud-devops']
  },
  'full-stack-development': {
    title: 'Full-Stack Development',
    heroSubtitle: 'End-to-end software solutions handling both the client-side and server-side complexities.',
    overview: 'Need a complete digital product built from scratch? Our full-stack development team handles everything from the database architecture to the pixel-perfect user interface. We ensure that all layers of your application communicate seamlessly and securely.',
    features: [
      'Frontend Development',
      'Backend Development',
      'Database Design',
      'API Development',
      'DevOps & Deployment',
      'System Architecture',
      'Security Implementation',
      'Performance Optimization'
    ],
    techStack: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    process: [
      { title: 'Requirements & Planning', desc: 'Mapping out the entire tech stack and data flow.' },
      { title: 'Architecture Design', desc: 'Structuring data and system components.' },
      { title: 'Frontend Development', desc: 'Creating the interactive user interface.' },
      { title: 'Backend Development', desc: 'Building robust communication layers.' },
      { title: 'Integration & Testing', desc: 'Ensuring front and back ends work flawlessly together.' },
      { title: 'Deployment', desc: 'Deploying the full stack to cloud infrastructure.' }
    ],
    useCases: [
      { title: 'Complex web applications', icon: '💻', desc: 'Heavy business logic systems.' },
      { title: 'Custom ERP systems', icon: '🏭', desc: 'Internal company management tools.' },
      { title: 'Marketplace platforms', icon: '🏪', desc: 'Multi-vendor e-commerce.' },
      { title: 'Social networks', icon: '🌐', desc: 'High-interaction community sites.' }
    ],
    examples: [
      { name: 'B2B Marketplace', desc: 'A complex multi-vendor platform with escrow payments.', tech: 'Next.js, Node.js, PostgreSQL' },
      { name: 'Logistics ERP', desc: 'Custom enterprise tool managing fleets and inventory.', tech: 'React, Express, AWS' }
    ],
    faqs: [
      { q: 'Do you handle the database design?', a: 'Yes, we architect highly optimized relational (SQL) or NoSQL databases based on your needs.' },
      { q: 'Will I own the source code?', a: 'Absolutely. Upon project completion and payment, 100% of the IP and code belongs to you.' },
      { q: 'What happens if we need to scale later?', a: 'Our architectures use decoupled components (like separate APIs and Frontends) to allow easy vertical and horizontal scaling.' }
    ],
    pricing: 'Starting from $10,000',
    relatedServiceIds: ['api-development', 'web-development']
  },
  'cloud-devops': {
    title: 'Cloud Architecture & DevOps',
    heroSubtitle: 'Scalable infrastructure, automated deployments, and maximum uptime.',
    overview: 'Ensure your applications are highly available, secure, and ready to scale. We design robust cloud architectures and implement automated DevOps pipelines to streamline your development lifecycle and reduce operational overhead.',
    features: [
      'Cloud Architecture Design',
      'CI/CD Pipelines',
      'Infrastructure as Code',
      'Containerization',
      'Server Management',
      'Security & Monitoring',
      'Auto-scaling',
      'Cost Optimization'
    ],
    techStack: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    process: [
      { title: 'Assessment & Planning', desc: 'Reviewing current setups and identifying bottlenecks.' },
      { title: 'Infrastructure Design', desc: 'Designing a scalable, fault-tolerant cloud environment.' },
      { title: 'Implementation', desc: 'Provisioning servers and databases.' },
      { title: 'CI/CD Setup', desc: 'Creating automated deployment workflows.' },
      { title: 'Monitoring & Optimization', desc: 'Setting up dashboards and alerting systems.' },
      { title: 'Training & Handoff', desc: 'Ensuring your team can manage the infrastructure.' }
    ],
    useCases: [
      { title: 'High-traffic applications', icon: '🚀', desc: 'Auto-scaling environments.' },
      { title: 'Microservices', icon: '🧩', desc: 'Complex container orchestration.' },
      { title: 'Automated testing', icon: '⚙️', desc: 'Continuous integration pipelines.' },
      { title: 'Cost optimization', icon: '💰', desc: 'Reducing bloated cloud bills.' }
    ],
    examples: [
      { name: 'AWS Migration', desc: 'Moved a legacy monolithic app to scalable AWS microservices.', tech: 'AWS ECS, Terraform' },
      { name: 'CI/CD Pipeline', desc: 'Reduced deployment times from hours to minutes.', tech: 'GitHub Actions, Docker' }
    ],
    faqs: [
      { q: 'Which cloud providers do you work with?', a: 'We primarily work with AWS, Vercel, and Supabase, but also handle Google Cloud and Azure.' },
      { q: 'Can you lower our AWS bill?', a: 'Yes, we perform architectural audits that often reduce cloud hosting costs by 30-50%.' },
      { q: 'Do you offer 24/7 monitoring?', a: 'We set up automated alerting (PagerDuty, Slack) so your team is instantly notified of any anomalies.' }
    ],
    pricing: 'Starting from $3,000',
    relatedServiceIds: ['saas-development', 'full-stack-development']
  },
  'api-development': {
    title: 'API Development',
    heroSubtitle: 'Robust, secure, and high-performance APIs to connect your digital ecosystem.',
    overview: 'Data is the lifeblood of modern software. We build custom APIs that allow your applications to communicate efficiently, securely, and reliably. Whether you need RESTful services or a flexible GraphQL architecture, we deliver APIs built for scale.',
    features: [
      'RESTful API Design',
      'GraphQL APIs',
      'API Security',
      'Rate Limiting',
      'Documentation',
      'Webhook Integration',
      'Versioning Strategy',
      'Performance Optimization'
    ],
    techStack: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Redis'],
    process: [
      { title: 'Specification & Design', desc: 'Creating OpenAPI/Swagger specifications.' },
      { title: 'API Development', desc: 'Writing the core business logic and data access layers.' },
      { title: 'Documentation', desc: 'Generating developer-friendly API docs.' },
      { title: 'Testing & Security', desc: 'Load testing and adding authentication layers.' },
      { title: 'Deployment', desc: 'Pushing to scalable edge or serverless environments.' },
      { title: 'Monitoring & Optimization', desc: 'Tracking latency and optimizing slow queries.' }
    ],
    useCases: [
      { title: 'Mobile app backends', icon: '📱', desc: 'Powering iOS and Android apps.' },
      { title: 'B2B integrations', icon: '🤝', desc: 'Connecting distinct corporate systems.' },
      { title: 'Public APIs', icon: '🌍', desc: 'Developer ecosystems and SaaS integrations.' },
      { title: 'Payment gateways', icon: '💳', desc: 'Secure transactional endpoints.' }
    ],
    examples: [
      { name: 'Public GraphQL API', desc: 'A developer API serving millions of requests daily.', tech: 'GraphQL, Node.js, Redis' },
      { name: 'Payment Webhooks', desc: 'Secure, resilient webhook receivers for Stripe.', tech: 'Express, Serverless' }
    ],
    faqs: [
      { q: 'REST or GraphQL?', a: 'It depends on your needs. REST is great for standard resource access, while GraphQL excels in complex, data-heavy UIs.' },
      { q: 'How do you secure APIs?', a: 'We use JWTs, OAuth2, API Keys, Rate Limiting, and strict CORS policies.' },
      { q: 'Do you provide API documentation?', a: 'Yes, we provide interactive Swagger/OpenAPI documentation for all REST endpoints.' }
    ],
    pricing: 'Starting from $4,000',
    relatedServiceIds: ['mobile-app-development', 'full-stack-development']
  },
  'technical-consultation': {
    title: 'Technical Consultation',
    heroSubtitle: 'Expert guidance to navigate complex technology decisions and accelerate growth.',
    overview: 'Make the right technology choices from day one. Our technical consulting services help startups and enterprises evaluate tools, design scalable architectures, and establish engineering best practices to avoid costly mistakes down the road.',
    features: [
      'Architecture Review',
      'Technology Selection',
      'Best Practices Guidance',
      'Code Review & Optimization',
      'Security Audit',
      'Performance Analysis',
      'Team Training',
      'Roadmap Planning'
    ],
    techStack: ['Architecture Design', 'System Audits', 'Agile Methodologies', 'Cloud Strategy', 'Security Best Practices'],
    process: [
      { title: 'Initial Consultation', desc: 'Understanding your business goals and challenges.' },
      { title: 'Assessment & Analysis', desc: 'Deep dive into your codebase or architecture plans.' },
      { title: 'Recommendations', desc: 'Formulating a detailed, actionable technical strategy.' },
      { title: 'Implementation Support', desc: 'Guiding your team through the proposed changes.' },
      { title: 'Team Training', desc: 'Upskilling your developers on modern practices.' },
      { title: 'Ongoing Guidance', desc: 'Regular check-ins and Fractional CTO services.' }
    ],
    useCases: [
      { title: 'MVP planning', icon: '🚀', desc: 'Ensuring startups build on the right stack.' },
      { title: 'Scaling strategies', icon: '📈', desc: 'Helping growing apps handle traffic spikes.' },
      { title: 'Legacy modernization', icon: '🔄', desc: 'Planning safe transitions from old tech.' },
      { title: 'Technical due diligence', icon: '🔍', desc: 'Auditing code for investors or acquisitions.' }
    ],
    examples: [
      { name: 'Startup MVP Architecture', desc: 'Designed a cost-effective, scalable stack that saved $50k in initial dev costs.', tech: 'Consultation' },
      { name: 'Performance Audit', desc: 'Identified database bottlenecks that sped up load times by 400%.', tech: 'Code Review, DB Analysis' }
    ],
    faqs: [
      { q: 'Do you offer Fractional CTO services?', a: 'Yes, we can act as your part-time technical leadership.' },
      { q: 'Will you review our existing code?', a: 'Absolutely. We conduct thorough security, performance, and best-practice audits.' },
      { q: 'How is consulting billed?', a: 'We offer hourly rates, project-based flat fees, or monthly retainers depending on engagement depth.' }
    ],
    pricing: 'Starting from $1,000 / week',
    relatedServiceIds: ['cloud-devops', 'web-development']
  }
};
