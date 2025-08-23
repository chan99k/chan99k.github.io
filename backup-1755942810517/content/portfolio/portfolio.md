---
personalInfo:
  name: 'Chan99K'
  title: 'Software Developer'
  email: 'your-email@example.com'
  github: 'https://github.com/chan99k'
  summary: 'Passionate software developer with experience in web development and backend systems.'

experience:
  - id: 'exp1'
    company: 'Tech Company'
    position: 'Software Developer'
    period: '2022 - Present'
    description: 'Developing web applications and backend systems'
    technologies: ['Java', 'Spring Boot', 'React', 'TypeScript']

projects:
  - id: 'project1'
    title: 'Personal Website'
    description: 'A modern personal website built with Next.js'
    period: '2024'
    teamSize: 1
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS']
    githubUrl: 'https://github.com/chan99k/chan99k.github.io'
    problems:
      - id: 'problem1'
        title: 'Static Site Generation with Dynamic Content'
        problem: 'Need to generate static pages while supporting dynamic content loading and MDX processing'
        solution: 'Implemented a hybrid approach using Next.js static generation with dynamic imports for MDX content, enabling fast static delivery with rich interactive components'
        technologies: ['Next.js', 'MDX', 'TypeScript']
        projectId: 'project1'
        slug: 'static-site-dynamic-content'
        blogPostSlug: 'hello-world'
        isDetailedInBlog: true
        excerpt: 'Solving the challenge of combining static site performance with dynamic content capabilities'
      - id: 'problem2'
        title: 'Responsive Design System Implementation'
        problem: 'Creating a consistent design system that works across all device sizes while maintaining performance'
        solution: 'Built a component-based design system using Tailwind CSS with custom design tokens and responsive utilities'
        technologies: ['Tailwind CSS', 'React', 'TypeScript']
        projectId: 'project1'
        slug: 'responsive-design-system'
        isDetailedInBlog: false
        excerpt: 'Implementing a scalable design system for consistent UI across all devices'
  - id: 'project2'
    title: 'E-commerce Platform'
    description: 'Full-stack e-commerce solution with payment integration'
    period: '2023'
    teamSize: 3
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe']
    githubUrl: 'https://github.com/chan99k/ecommerce-platform'
    problems:
      - id: 'problem3'
        title: 'Payment Processing Security'
        problem: 'Implementing secure payment processing while maintaining good user experience'
        solution: 'Integrated Stripe with proper webhook handling and implemented PCI-compliant payment flows'
        technologies: ['Stripe', 'Node.js', 'Express', 'PostgreSQL']
        projectId: 'project2'
        slug: 'payment-processing-security'
        isDetailedInBlog: false
        excerpt: 'Securing payment flows while maintaining seamless user experience'

certifications:
  - id: 'cert1'
    name: 'AWS Certified Developer'
    issuer: 'Amazon Web Services'
    date: '2023'

education:
  - id: 'edu1'
    institution: 'University'
    degree: "Bachelor's Degree"
    field: 'Computer Science'
    period: '2018 - 2022'
---

# Portfolio

This is the main portfolio content file. The frontmatter above contains all the structured data for the portfolio, while this markdown content can contain additional information about the portfolio.
