import { TimelineSection } from '@/components/portfolio';
import { PortfolioData } from '@/types';

const demoData: PortfolioData = {
  personalInfo: {
    name: 'Demo Developer',
    title: 'Software Engineer',
    email: 'demo@example.com',
    github: 'https://github.com/demo',
    summary: 'Demo portfolio for timeline testing'
  },
  experience: [
    {
      id: 'exp1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      period: '2022 - Present',
      description: 'Leading development team and architecting solutions',
      technologies: ['React', 'TypeScript', 'Node.js', 'AWS']
    },
    {
      id: 'exp2',
      company: 'StartupCo',
      position: 'Full Stack Developer',
      period: '2020 - 2022',
      description: 'Built web applications from scratch',
      technologies: ['Vue.js', 'Python', 'PostgreSQL']
    }
  ],
  projects: [
    {
      id: 'proj1',
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution',
      period: '2023',
      teamSize: 4,
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      problems: [
        {
          id: 'prob1',
          title: 'Payment Processing',
          problem: 'Secure payment handling',
          solution: 'Implemented Stripe integration',
          technologies: ['Stripe', 'Node.js'],
          projectId: 'proj1',
          slug: 'payment-processing',
          isDetailedInBlog: false
        }
      ]
    },
    {
      id: 'proj2',
      title: 'Analytics Dashboard',
      description: 'Real-time analytics platform',
      period: '2022',
      teamSize: 2,
      techStack: ['Vue.js', 'D3.js', 'Python', 'Redis'],
      problems: []
    }
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2023'
    }
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Tech University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      period: '2016 - 2020'
    }
  ]
};

export default function TimelineDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Interactive Timeline Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Demonstration of the interactive portfolio timeline components
        </p>
      </div>
      
      <TimelineSection data={demoData} />
    </div>
  );
}