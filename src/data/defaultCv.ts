import type { CvData, CvHeader, CvVersion, EducationSection } from '../types/cv'

/**
 * Seed content for both versions, transcribed from the original Canva resume
 * and from an interview about the work behind each entry.
 *
 * Ids are literals rather than generated so React keys and persisted state stay
 * stable across reloads. Ids repeat between versions, which is harmless: only
 * one version is rendered and measured at a time.
 *
 * Header and education are built by factories rather than shared consts. Store
 * updates are all immutable, so sharing would in fact be safe -- but the safety
 * would rest on an invariant nothing enforces, and versions are meant to be
 * independent documents.
 */
const header = (): CvHeader => ({
  name: 'Chananuwat Chaysri',
  contacts: [
    {
      id: 'c-email',
      label: 'Email',
      value: 'chananuwat.c@hotmail.com',
      href: 'mailto:chananuwat.c@hotmail.com',
      column: 'left',
    },
    { id: 'c-location', label: 'Location', value: 'Bangkok, Thailand', column: 'left' },
    {
      id: 'c-linkedin',
      label: 'Linkedin',
      value: 'linkedin.com/in/chananuwat-chaysri',
      href: 'https://linkedin.com/in/chananuwat-chaysri',
      column: 'right',
    },
    {
      id: 'c-github',
      label: 'Github',
      value: 'chanasia',
      href: 'https://github.com/chanasia',
      column: 'right',
    },
  ],
})

const education = (): EducationSection => ({
  id: 's-education',
  kind: 'education',
  title: 'Education',
  visible: true,
  entries: [
    {
      id: 'ed-rmutp',
      degree: "Bachelor's Degree, Rajamangala University of Technology Phra Nakhon",
      dateRange: '2021 - 2025',
      lines: ['Bachelor of Science (Data Science and Information Technology)', 'GPAX: 3.75'],
    },
  ],
})

// ---------------------------------------------------------------------------
// Full Stack Developer -- the default, and the content the app shipped with.
// ---------------------------------------------------------------------------

const fullStackCv: CvData = {
  header: header(),
  sections: [
    {
      id: 's-experience',
      kind: 'experience',
      title: 'Experience',
      visible: true,
      companies: [
        {
          id: 'co-yipintsoi',
          name: 'Yip In Tsoi & Co., Ltd.',
          roles: [
            {
              id: 'r-yit-java',
              title: 'Programmer / Java Developer',
              dateRange: 'Oct 2025 - Nov 2026',
              bullets: [
                {
                  id: 'b-yit-1',
                  text: 'Built Intelligent Search (INS): full-text search over both structured database records and unstructured PDFs/images read by a local Typhoon OCR model, with indexing configured from a UI. Spring Boot 4 / Java 21, Angular 21, Python, RabbitMQ, Meilisearch',
                },
                {
                  id: 'b-yit-2',
                  text: 'Designed the authentication service for ADFS and ThaiD (national digital ID) OIDC: JWT sessions with refresh-token rotation and deny-by-default RBAC',
                },
                {
                  id: 'b-yit-3',
                  text: 'Turned requirements from SA/BA/PM and customers into system design, ER diagrams and database schemas, then implemented and released to production',
                },
                {
                  id: 'b-yit-4',
                  text: 'Built the CI/CD pipeline the team deploys with, making releases simpler and repeatable',
                },
                {
                  id: 'b-yit-5',
                  text: 'Maintained and debugged existing systems, and built the integrations between them',
                },
              ],
            },
          ],
        },
        {
          id: 'co-humanica',
          name: 'Humanica Public Company Limited',
          roles: [
            {
              id: 'r-humanica-devops',
              title: 'DevOps (Parttime)',
              dateRange: 'Nov 2024 - Feb 2025',
              bullets: [
                {
                  id: 'b-hd-1',
                  text: 'Built the Application Publishing Control with React TypeScript, Ant-d and Golang',
                },
                {
                  id: 'b-hd-2',
                  text: 'Integrated SonarQube into Jenkins and scripted auto-creation of projects per repository branch',
                },
                {
                  id: 'b-hd-3',
                  text: 'Implemented Keycloak SSO for DevSecOps tools and Application Publishing Control',
                },
                {
                  id: 'b-hd-4',
                  text: 'Built a shared microservice pipeline: configure centrally, update every repository at once',
                },
              ],
            },
            {
              id: 'r-humanica-intern',
              title: 'Full-stacks developer (Cybersecurity Internship)',
              dateRange: 'Apr 2024 - Oct 2024',
              summary:
                'A Questionnaire Management System (QMS) that speeds up compliance review by clustering similar questions and recommending standardized answers to reuse across products.',
              bullets: [
                { id: 'b-hi-1', text: 'Built QMS with a Next.js frontend and Python backend' },
                {
                  id: 'b-hi-2',
                  text: 'Implemented SBERT similarity search reaching 70% average accuracy, validated by the Compliance team lead over 47 test questions',
                },
                {
                  id: 'b-hi-3',
                  text: 'Built standardized answers for both generic and product-specific responses',
                },
                {
                  id: 'b-hi-4',
                  text: 'Deployed as a Docker image to the cloud provider registry',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 's-skills',
      kind: 'skills',
      title: 'Additional Skills',
      visible: true,
      lines: [
        {
          id: 'sk-languages',
          label: 'Languages',
          value: 'TypeScript, JavaScript, Python, Golang, SQL, Java, C#',
        },
        {
          id: 'sk-frontend',
          label: 'Frontend',
          value: 'React, Next.js, Angular, Ant Design, PrimeNG, MUI, TailwindCSS, Zustand, Redux',
        },
        {
          id: 'sk-backend',
          label: 'Backend Frameworks',
          value: 'Spring Boot, .NET Core, Nest.js, FastAPI, Flask',
        },
        {
          id: 'sk-database',
          label: 'Database',
          value: 'SQL Server, PostgreSQL, MySQL, Redis, MinIO, Meilisearch',
        },
        {
          id: 'sk-devops',
          label: 'DevOps',
          value: 'GitLab, Github, Jenkins, Docker, Kubernetes, Helm Chart, RabbitMQ',
        },
        {
          id: 'sk-security',
          label: 'Security',
          value: 'Keycloak, OAuth2 / OIDC, JWT, SonarQube, OWASP ZAP, DefectDojo',
        },
        {
          id: 'sk-infra',
          label: 'Infrastructure',
          value: 'Windows server, IIS, Nginx, Ubuntu, Huawei Cloud, LDAP',
        },
      ],
    },
    education(),
  ],
}

export const FULL_STACK_VERSION_ID = 'v-fullstack'
/** Seeded AI Engineer version, since removed; kept only so the store migration can drop it. */
export const AI_VERSION_ID = 'v-ai-engineer'

export const defaultVersions = (): CvVersion[] => [
  { id: FULL_STACK_VERSION_ID, name: 'Full Stack Developer', data: fullStackCv },
]
