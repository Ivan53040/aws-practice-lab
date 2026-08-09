export interface RevisionTopic {
  id: string
  title: string
  summary: string
  points: string[]
  keyTerms: string[]
  examTip: string
}

export interface RevisionDomain {
  id: number
  title: string
  weight: number
  topics: RevisionTopic[]
}

export interface RevisionGuide {
  certCode: string
  verified: string
  sourceUrl: string
  domains: RevisionDomain[]
}

export const REVISION_GUIDES: Partial<Record<string, RevisionGuide>> = {
  'clf-c02': {
    certCode: 'clf-c02',
    verified: '2026-08-09',
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html',
    domains: [
      {
        id: 1,
        title: 'Cloud Concepts',
        weight: 24,
        topics: [
          {
            id: '1.1',
            title: 'Define the benefits of the AWS Cloud',
            summary: 'Know why organizations choose AWS and how cloud characteristics improve speed, reach, resilience, and cost control.',
            points: [
              'Pay-as-you-go pricing replaces large upfront purchases with usage-based spending.',
              'Agility means teams can provision resources quickly, experiment, and release faster.',
              'Elasticity adds or removes resources as demand changes. Scalability increases capacity to support growth.',
              'Multiple Availability Zones and Regions can improve availability, fault tolerance, and disaster recovery.',
              'The AWS global footprint helps applications reach users with lower latency and supports geographic expansion.',
              'Managed services reduce undifferentiated work such as hardware maintenance, patching, and some backups.',
            ],
            keyTerms: ['Pay as you go', 'Agility', 'Elasticity', 'Scalability', 'High availability', 'Global reach'],
            examTip: 'When the question focuses on changing demand, think elasticity. When it focuses on long-term growth, think scalability.',
          },
          {
            id: '1.2',
            title: 'Identify design principles of the AWS Cloud',
            summary: 'Recognize the six AWS Well-Architected pillars and the design choices associated with each pillar.',
            points: [
              'Operational Excellence covers running, observing, and continually improving workloads.',
              'Security covers identity, traceability, data protection, infrastructure protection, and incident preparation.',
              'Reliability covers recovery, distributed design, capacity management, and automatic healing.',
              'Performance Efficiency covers selecting and evolving efficient compute, storage, database, and network resources.',
              'Cost Optimization covers eliminating waste, matching supply to demand, and measuring expenditure.',
              'Sustainability covers reducing the environmental impact of running cloud workloads.',
              'Common cloud design principles include automating changes, testing recovery, using loosely coupled components, and avoiding single points of failure.',
            ],
            keyTerms: ['AWS Well-Architected Framework', 'Six pillars', 'Design for failure', 'Automation', 'Loose coupling'],
            examTip: 'Map the main concern in the scenario to the pillar before choosing a service or action.',
          },
          {
            id: '1.3',
            title: 'Understand the benefits of and strategies for migration to the AWS Cloud',
            summary: 'Understand how organizations prepare for cloud adoption and choose a suitable migration path for each workload.',
            points: [
              'AWS Cloud Adoption Framework perspectives are Business, People, Governance, Platform, Security, and Operations.',
              'A migration business case should connect technical change to risk reduction, efficiency, revenue, and business outcomes.',
              'Common migration strategies include retire, retain, rehost, relocate, repurchase, replatform, and refactor.',
              'AWS Application Migration Service supports server migration, while AWS Database Migration Service supports database migration with minimal downtime.',
              'AWS Snow Family devices help transfer large data sets when network transfer is too slow or impractical.',
              'Discovery, dependency mapping, testing, cutover planning, and validation reduce migration risk.',
            ],
            keyTerms: ['AWS CAF', 'Migration strategies', 'AWS MGN', 'AWS DMS', 'AWS Snow Family'],
            examTip: 'Rehost means move with minimal change. Replatform makes limited cloud optimizations. Refactor changes the architecture significantly.',
          },
          {
            id: '1.4',
            title: 'Understand concepts of cloud economics',
            summary: 'Know how cloud spending differs from on-premises spending and which practices reduce total cost.',
            points: [
              'On-premises environments usually require capital expenditure for hardware and facilities. Cloud services shift more spending to variable operating expenditure.',
              'Total cost of ownership includes hardware, software, facilities, power, cooling, staffing, maintenance, and downtime risk.',
              'AWS economies of scale help lower variable prices as aggregate platform usage grows.',
              'Rightsizing matches resource size and type to actual workload needs instead of paying for idle capacity.',
              'Automation can reduce repetitive operational work and the cost of human error.',
              'Software licensing can use included licenses or Bring Your Own License, subject to vendor and service rules.',
            ],
            keyTerms: ['Capital expenditure', 'Operating expenditure', 'TCO', 'Rightsizing', 'Economies of scale', 'BYOL'],
            examTip: 'Include indirect facility and staffing costs when comparing cloud cost with an on-premises data center.',
          },
        ],
      },
      {
        id: 2,
        title: 'Security & Compliance',
        weight: 30,
        topics: [
          {
            id: '2.1',
            title: 'Understand the AWS shared responsibility model',
            summary: 'Separate AWS responsibility for security of the cloud from customer responsibility for security in the cloud.',
            points: [
              'AWS protects the facilities, physical hardware, networking, and virtualization layer that run AWS services.',
              'Customers protect their data, identities, permissions, configurations, and applications.',
              'With Amazon EC2, the customer manages the guest operating system, patches, installed software, and security group configuration.',
              'With Amazon RDS, AWS manages more of the database platform and operating system, while the customer still manages data, access, and database configuration.',
              'With AWS Lambda, AWS manages the servers and runtime infrastructure, while the customer manages code, data, permissions, and configuration.',
              'Some controls are shared, including awareness, training, and configuration management responsibilities at different layers.',
            ],
            keyTerms: ['Security of the cloud', 'Security in the cloud', 'Customer data', 'Managed services', 'Shared controls'],
            examTip: 'The more managed the service is, the more infrastructure work AWS performs, but the customer always owns data and access decisions.',
          },
          {
            id: '2.2',
            title: 'Understand AWS Cloud security, governance, and compliance concepts',
            summary: 'Know the main AWS services for evidence, audit, monitoring, threat detection, compliance, and encryption.',
            points: [
              'AWS Artifact provides AWS compliance reports and selected agreements on demand.',
              'AWS CloudTrail records account activity and API calls. Amazon CloudWatch collects metrics, logs, dashboards, and alarms.',
              'AWS Config records resource configuration changes and evaluates resources against rules.',
              'AWS Audit Manager automates evidence collection, while AWS Security Hub centralizes supported security findings.',
              'Amazon GuardDuty detects suspicious activity. Amazon Inspector finds supported workload vulnerabilities.',
              'Encryption at rest protects stored data. Encryption in transit commonly uses TLS. AWS KMS manages encryption keys.',
              'Compliance requirements can vary by industry, geography, data type, and the AWS service being used.',
            ],
            keyTerms: ['AWS Artifact', 'CloudTrail', 'CloudWatch', 'AWS Config', 'Audit Manager', 'Security Hub', 'AWS KMS'],
            examTip: 'CloudTrail answers who made an API call. CloudWatch answers what the workload is doing. Config answers how a resource configuration changed.',
          },
          {
            id: '2.3',
            title: 'Identify AWS access management capabilities',
            summary: 'Understand identities, authentication, authorization, federation, and safe credential practices.',
            points: [
              'Protect the root user with multi-factor authentication, do not create root access keys, and use root only for tasks that require it.',
              'IAM users represent individual identities, groups collect users, and roles provide temporary credentials to trusted principals.',
              'IAM policies define allowed or denied actions, resources, and conditions. Explicit deny overrides allow.',
              'Least privilege grants only the permissions required for the task and should be refined over time.',
              'IAM Identity Center provides centralized workforce access to multiple AWS accounts and applications.',
              'Federation lets users authenticate through an external identity provider instead of creating separate long-lived IAM users.',
              'Use AWS Secrets Manager or Systems Manager Parameter Store for suitable secrets instead of embedding credentials in code.',
            ],
            keyTerms: ['IAM', 'Root user', 'MFA', 'Least privilege', 'IAM role', 'Federation', 'IAM Identity Center'],
            examTip: 'Choose a role and temporary credentials for applications or cross-account access. Avoid long-lived access keys whenever possible.',
          },
          {
            id: '2.4',
            title: 'Identify components and resources for security',
            summary: 'Distinguish AWS security services by the type of threat, control, or information they provide.',
            points: [
              'AWS WAF filters web requests using rules. AWS Shield provides managed protection against distributed denial of service attacks.',
              'AWS Firewall Manager centrally manages firewall and related security policies across accounts and resources.',
              'Amazon GuardDuty detects threats from supported telemetry, while Amazon Inspector assesses supported workloads for vulnerabilities.',
              'AWS Security Hub aggregates and prioritizes findings from supported security services.',
              'AWS Trusted Advisor checks supported areas such as cost, performance, security, resilience, and service limits.',
              'AWS Marketplace includes third-party security products that can complement native AWS services.',
              'Official security information is available through AWS documentation, the AWS Security Blog, security bulletins, and AWS re:Post or Knowledge Center resources.',
            ],
            keyTerms: ['AWS WAF', 'AWS Shield', 'Firewall Manager', 'GuardDuty', 'Inspector', 'Security Hub', 'Trusted Advisor'],
            examTip: 'WAF is for application-layer web requests. Shield is for DDoS protection. GuardDuty is for threat detection.',
          },
        ],
      },
      {
        id: 3,
        title: 'Cloud Technology & Services',
        weight: 34,
        topics: [
          {
            id: '3.1',
            title: 'Define methods of deploying and operating in the AWS Cloud',
            summary: 'Know the main ways to access, provision, and operate AWS resources and the common deployment models.',
            points: [
              'The AWS Management Console provides browser-based administration.',
              'The AWS CLI, SDKs, and service APIs support programmatic and automated access.',
              'Infrastructure as code makes environments repeatable, versionable, and reviewable. AWS CloudFormation is the core AWS service for this approach.',
              'One-time console actions can be appropriate for exploration, while repeatable production changes benefit from automation.',
              'Cloud deployment runs workloads in a cloud environment. Hybrid deployment connects cloud and on-premises resources.',
              'Permissions for every access method are still evaluated through AWS identity and resource policies.',
            ],
            keyTerms: ['Management Console', 'AWS CLI', 'AWS SDK', 'API', 'Infrastructure as code', 'CloudFormation', 'Hybrid cloud'],
            examTip: 'If a process must be repeatable across environments, prefer infrastructure as code over manual console steps.',
          },
          {
            id: '3.2',
            title: 'Define the AWS global infrastructure',
            summary: 'Understand Regions, Availability Zones, edge locations, and how geography affects resilience, latency, and compliance.',
            points: [
              'A Region is a separate geographic area containing multiple isolated Availability Zones.',
              'An Availability Zone contains one or more data centers with independent power, networking, and connectivity.',
              'Deploying across multiple Availability Zones improves high availability and reduces single points of failure.',
              'Multiple Regions can support disaster recovery, business continuity, low latency, and data residency requirements.',
              'Edge locations place content and selected services closer to users. Amazon CloudFront uses edge locations for content delivery.',
              'Region choice can depend on service availability, latency, compliance, and cost.',
            ],
            keyTerms: ['Region', 'Availability Zone', 'Edge location', 'Multi-AZ', 'Multi-Region', 'Data residency'],
            examTip: 'Use multiple Availability Zones for high availability inside one Region. Use multiple Regions for geographic resilience or residency needs.',
          },
          {
            id: '3.3',
            title: 'Identify AWS compute services',
            summary: 'Match virtual machines, containers, serverless compute, scaling, and load balancing to common use cases.',
            points: [
              'Amazon EC2 provides resizable virtual machines and gives customers operating system control.',
              'General purpose, compute optimized, memory optimized, storage optimized, and accelerated instance families target different workload profiles.',
              'EC2 Auto Scaling adjusts instance capacity, while Elastic Load Balancing distributes traffic across healthy targets.',
              'AWS Lambda runs event-driven code without server management and charges based on requests and execution resources.',
              'Amazon ECS orchestrates containers using AWS-native controls. Amazon EKS provides managed Kubernetes.',
              'AWS Fargate supplies serverless compute capacity for supported ECS and EKS container workloads.',
              'AWS Batch plans and runs batch computing jobs using suitable compute resources.',
            ],
            keyTerms: ['Amazon EC2', 'EC2 Auto Scaling', 'Elastic Load Balancing', 'AWS Lambda', 'Amazon ECS', 'Amazon EKS', 'AWS Fargate'],
            examTip: 'Choose Lambda for event-driven functions, Fargate for serverless containers, and EC2 when operating system control is required.',
          },
          {
            id: '3.4',
            title: 'Identify AWS database services',
            summary: 'Recognize relational, key-value, in-memory, and migration services and the value of managed databases.',
            points: [
              'Amazon RDS manages common relational database engines, including backups, patching, and selected high-availability features.',
              'Amazon Aurora is a cloud-optimized relational database compatible with MySQL and PostgreSQL.',
              'Amazon DynamoDB is a serverless NoSQL key-value and document database designed for scalable low-latency access.',
              'Amazon ElastiCache provides managed in-memory caches using supported engines.',
              'Running a database on EC2 gives more operating system control but also gives the customer more operational responsibility.',
              'AWS Database Migration Service moves data between supported sources and targets. AWS Schema Conversion Tool helps convert database schemas.',
            ],
            keyTerms: ['Amazon RDS', 'Amazon Aurora', 'Amazon DynamoDB', 'Amazon ElastiCache', 'AWS DMS', 'AWS SCT'],
            examTip: 'Start by identifying the data model: relational, key-value or document, or in-memory cache.',
          },
          {
            id: '3.5',
            title: 'Identify AWS network services',
            summary: 'Understand VPC building blocks, traffic controls, DNS, and private connectivity to AWS.',
            points: [
              'Amazon VPC creates a logically isolated network with IP ranges, subnets, route tables, and gateways.',
              'Public subnets have a route to an internet gateway. Private subnets do not directly expose resources to the internet.',
              'Security groups are stateful resource-level controls. Network ACLs are stateless subnet-level controls.',
              'Amazon Route 53 provides managed DNS, domain registration, routing policies, and health checks.',
              'AWS Site-to-Site VPN provides encrypted connectivity over the internet.',
              'AWS Direct Connect provides a dedicated private network connection from a location to AWS.',
              'VPC endpoints provide private access from a VPC to supported services without traversing the public internet.',
            ],
            keyTerms: ['Amazon VPC', 'Subnet', 'Internet gateway', 'Security group', 'Network ACL', 'Route 53', 'VPN', 'Direct Connect'],
            examTip: 'Security groups remember connection state. Network ACLs require explicit rules for both traffic directions.',
          },
          {
            id: '3.6',
            title: 'Identify AWS storage services',
            summary: 'Distinguish object, block, file, hybrid, archival, and backup storage options.',
            points: [
              'Amazon S3 is regional object storage for objects stored in buckets. It is not a block disk or traditional file system.',
              'S3 storage classes trade access cost, retrieval behavior, and minimum storage duration for lower storage price.',
              'S3 lifecycle rules can transition or expire objects automatically.',
              'Amazon EBS provides persistent block volumes for EC2. Instance store is temporary block storage tied to the host.',
              'Amazon EFS provides managed elastic file storage for Linux workloads. Amazon FSx provides managed file systems for specific workloads and protocols.',
              'AWS Storage Gateway connects on-premises environments to AWS storage through hybrid gateway modes.',
              'AWS Backup centrally manages backup plans and retention for supported AWS resources.',
            ],
            keyTerms: ['Amazon S3', 'S3 storage classes', 'Lifecycle policy', 'Amazon EBS', 'Instance store', 'Amazon EFS', 'Amazon FSx', 'AWS Backup'],
            examTip: 'Object storage is S3, EC2 block storage is EBS, and shared Linux file storage is EFS.',
          },
          {
            id: '3.7',
            title: 'Identify AWS AI/ML and analytics services',
            summary: 'Match common managed AI, machine learning, streaming, preparation, query, and visualization services to their purpose.',
            points: [
              'Amazon SageMaker AI provides managed capabilities to build, train, and deploy machine learning models.',
              'Amazon Lex builds conversational interfaces. Amazon Kendra provides intelligent enterprise search.',
              'Amazon Rekognition analyzes images and video, while Amazon Comprehend extracts insights from text.',
              'Amazon Athena runs SQL queries directly against supported data in Amazon S3.',
              'Amazon Kinesis handles real-time streaming data. AWS Glue provides data integration, ETL, and a data catalog.',
              'Amazon QuickSight provides business intelligence dashboards and visualizations.',
              'Amazon Redshift is a managed data warehouse, while Amazon EMR runs managed big-data frameworks.',
            ],
            keyTerms: ['SageMaker AI', 'Amazon Lex', 'Amazon Kendra', 'Amazon Athena', 'Amazon Kinesis', 'AWS Glue', 'Amazon QuickSight', 'Amazon Redshift'],
            examTip: 'Look for the task verb: query S3 with Athena, stream with Kinesis, transform with Glue, visualize with QuickSight.',
          },
          {
            id: '3.8',
            title: 'Identify services from other in-scope AWS service categories',
            summary: 'Recognize important application integration, business, developer, end-user, frontend, and IoT services.',
            points: [
              'Amazon SQS decouples components with queues. Amazon SNS fans messages out to subscribers. Amazon EventBridge routes events using rules.',
              'Amazon SES sends email, while Amazon Connect provides a cloud contact center.',
              'AWS CodeBuild runs builds, AWS CodePipeline orchestrates delivery stages, and AWS X-Ray traces distributed applications.',
              'Amazon WorkSpaces provides managed virtual desktops. AppStream 2.0 streams applications to users.',
              'AWS Amplify helps build and deploy web and mobile applications. AWS AppSync provides managed GraphQL APIs.',
              'AWS IoT Core connects and manages communication with IoT devices.',
              'AWS Support, AWS Marketplace, documentation, and community resources help customers adopt and operate AWS.',
            ],
            keyTerms: ['Amazon SQS', 'Amazon SNS', 'Amazon EventBridge', 'Amazon SES', 'Amazon Connect', 'CodePipeline', 'Amazon WorkSpaces', 'AWS IoT Core'],
            examTip: 'Queue is SQS, publish and subscribe is SNS, and rule-based event routing is EventBridge.',
          },
        ],
      },
      {
        id: 4,
        title: 'Billing, Pricing & Support',
        weight: 12,
        topics: [
          {
            id: '4.1',
            title: 'Compare AWS pricing models',
            summary: 'Know how compute commitments, spare capacity, tenancy, reservations, data transfer, and storage tiers affect price.',
            points: [
              'On-Demand pricing has no long-term commitment and suits short-term, irregular, or unpredictable workloads.',
              'Savings Plans reduce eligible compute cost in exchange for a consistent usage commitment measured per hour.',
              'Reserved Instances provide billing discounts and, for some types, capacity-related benefits for eligible EC2 usage.',
              'Spot Instances use spare EC2 capacity at a discount but can be interrupted, so workloads must tolerate interruption.',
              'Dedicated Hosts provide a physical server for one customer and can support certain licensing requirements. Dedicated Instances run on single-tenant hardware with less host-level visibility.',
              'Capacity Reservations reserve EC2 capacity in an Availability Zone but do not automatically provide a usage discount.',
              'Inbound internet data transfer is commonly free, while outbound and cross-Region transfer can incur charges. Always check the service pricing page.',
            ],
            keyTerms: ['On-Demand', 'Savings Plans', 'Reserved Instances', 'Spot Instances', 'Dedicated Hosts', 'Capacity Reservations', 'Data transfer'],
            examTip: 'Capacity availability and billing discount are different goals. A Capacity Reservation addresses capacity, while Savings Plans primarily address price.',
          },
          {
            id: '4.2',
            title: 'Understand resources for billing, budget, and cost management',
            summary: 'Distinguish forecasting, alerting, estimation, detailed reporting, allocation, and consolidated billing tools.',
            points: [
              'AWS Cost Explorer visualizes historical cost and usage and provides forecasts and filtering.',
              'AWS Budgets tracks cost, usage, reservations, or Savings Plans against thresholds and can send alerts.',
              'AWS Pricing Calculator estimates the cost of a planned architecture before deployment.',
              'AWS Cost and Usage Report provides detailed billing and usage data for analysis.',
              'Cost allocation tags categorize spending by dimensions such as project, owner, environment, or cost center after activation.',
              'AWS Organizations consolidated billing combines member-account charges under a management account and can share eligible volume benefits.',
              'Billing dashboards and service pricing pages help explain current charges and service-specific pricing dimensions.',
            ],
            keyTerms: ['Cost Explorer', 'AWS Budgets', 'Pricing Calculator', 'Cost and Usage Report', 'Cost allocation tags', 'Consolidated billing'],
            examTip: 'Estimate future architecture cost with Pricing Calculator, analyze actual spend with Cost Explorer, and alert on thresholds with Budgets.',
          },
          {
            id: '4.3',
            title: 'Identify AWS technical resources and AWS Support options',
            summary: 'Know where to find self-service guidance, account health information, partner solutions, and expert support.',
            points: [
              'AWS documentation, whitepapers, blogs, Architecture Center, and Prescriptive Guidance provide official technical guidance.',
              'AWS re:Post and AWS Knowledge Center provide community and troubleshooting knowledge.',
              'AWS Support plans provide different levels of technical assistance and response targets. Higher plans add broader production support and proactive guidance.',
              'AWS Trusted Advisor provides checks and recommendations in supported categories. Available checks depend on the support plan and account features.',
              'AWS Health Dashboard shows service events and account-specific events. AWS Health API enables programmatic access for eligible plans.',
              'AWS Marketplace offers third-party software, data, and services with centralized procurement and billing options.',
              'AWS Partners include independent software vendors and system integrators. AWS Professional Services and Solutions Architects can provide specialist guidance.',
              'The AWS Trust and Safety team handles reports of abusive activity involving AWS resources.',
            ],
            keyTerms: ['AWS Support', 'AWS re:Post', 'Knowledge Center', 'Trusted Advisor', 'AWS Health Dashboard', 'AWS Marketplace', 'AWS Partner Network'],
            examTip: 'Use AWS Health for events affecting services or your account. Use Trusted Advisor for recommendations about your environment.',
          },
        ],
      },
    ],
  },
}

export function getRevisionGuide(certCode: string): RevisionGuide | null {
  return REVISION_GUIDES[certCode] ?? null
}
