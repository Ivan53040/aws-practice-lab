#!/usr/bin/env node

/**
 * Generate the first offline practice banks for AWS certifications that were
 * not present in the app. The prompts are original, guide-aligned practice
 * scenarios, not copied certification questions.
 *
 * The generator is deterministic and intentionally keeps the generated bank
 * separate from the learner-facing UI. A maintainer can review the JSON and
 * replace any item before publishing a later revision.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DATA_ROOT = join(ROOT, 'src', 'data')
const VERIFIED = '2026-08-10'

const frames = [
  'A production team',
  'A multi-account platform team',
  'A regulated company',
  'A startup preparing for a traffic increase',
  'An operations team supporting a critical workload',
  'A data platform team',
  'A security-conscious engineering team',
  'A company migrating an existing workload',
  'A team with strict recovery objectives',
  'A developer team preparing a release',
  'An enterprise with several AWS Regions',
  'A service owner reviewing an incident',
  'A team optimizing an existing implementation',
  'A company introducing an automated workflow',
  'An AWS administrator working in a shared environment',
  'A customer-facing application team',
  'A platform team standardizing its AWS deployments',
  'A team preparing evidence for an audit',
  'A business replacing a manual process',
  'A team validating a design against the exam guide',
]

function t(prompt, correct, distractors, reason, reject) {
  return { prompt, correct, distractors, reason, reject }
}

const catalogs = {
  'soa-c03': {
    totalTarget: 195,
    domains: [
      { id: 1, name: 'Monitoring, Logging, Analysis, Remediation, and Performance Optimization', weight: 0.22, tasks: ['Implement metrics, alarms, and filters by using AWS monitoring and logging services', 'Identify and remediate issues by using monitoring and availability metrics', 'Implement performance optimization strategies for compute, storage, and database resources'], topics: [
        t('needs a metric for a custom application value that is not emitted by an AWS service. Which feature is most appropriate?', 'A CloudWatch custom metric', ['A Route 53 record', 'An S3 lifecycle rule', 'A KMS grant'], 'CloudWatch custom metrics let applications publish business and operational measurements for alarms and dashboards.', 'The other choices manage DNS, storage transitions, or encryption permissions.'),
        t('must collect operating system logs from an EC2 instance. Which tool should be configured?', 'The CloudWatch agent', ['An S3 bucket ACL', 'A CloudFront origin group', 'A VPC peering route'], 'The CloudWatch agent collects operating system logs and metrics and sends them to CloudWatch.', 'The other choices do not collect EC2 operating system telemetry.'),
        t('needs an alarm that invokes an action only when two underlying alarms are both in alarm state. Which feature should be used?', 'A CloudWatch composite alarm', ['An S3 event notification', 'A Route 53 weighted record', 'An IAM permission boundary'], 'A composite alarm combines the states of other alarms and can reduce noisy or premature remediation.', 'The other choices do not combine CloudWatch alarm states.'),
        t('wants to route a CloudWatch alarm event to a Lambda remediation function. Which integration is suitable?', 'EventBridge targeting Lambda', ['An EBS snapshot policy', 'A security group rule', 'An S3 storage class'], 'EventBridge can receive alarm state events and invoke a Lambda target for automated remediation.', 'The other choices do not route CloudWatch events to code.'),
        t('needs to investigate a slow RDS query using database-level performance information. Which feature should be enabled?', 'Amazon RDS Performance Insights', ['S3 Inventory', 'AWS Artifact', 'Amazon Cognito'], 'Performance Insights exposes database load and helps identify query and wait-event bottlenecks.', 'The other choices provide object reports, compliance documents, or application identity.'),
      ] },
      { id: 2, name: 'Reliability and Business Continuity', weight: 0.22, tasks: ['Implement scalability and elasticity', 'Implement highly available and resilient environments', 'Implement backup and restore strategies'], topics: [
        t('needs to add EC2 capacity when a queue backlog grows. Which scaling signal is most relevant?', 'SQS ApproximateNumberOfMessagesVisible', ['The S3 bucket name', 'The KMS key rotation date', 'The Route 53 hosted zone ID'], 'Queue depth is a direct measure of work waiting for workers and can drive Auto Scaling.', 'The other values do not measure pending work.'),
        t('must route traffic only to healthy targets after a deployment. Which capability should be configured?', 'Load balancer target health checks', ['S3 Object Lock', 'A KMS alias', 'An IAM user password policy'], 'Load balancer health checks remove unhealthy targets from routing.', 'The other choices protect objects, name keys, or govern IAM passwords.'),
        t('needs a database restore to a specific second before an accidental deletion. Which RDS capability fits?', 'Point-in-time restore', ['A read replica endpoint', 'A security group reference', 'A CloudFront invalidation'], 'RDS point-in-time restore uses automated backups and transaction logs to create a new database at a selected time.', 'Read replicas, security groups, and cache invalidations do not restore a database to a selected time.'),
        t('wants automated backup policies across supported AWS resources. Which service should manage the plans?', 'AWS Backup', ['AWS WAF', 'Amazon Route 53', 'AWS Certificate Manager'], 'AWS Backup centralizes schedules, retention, and vault policies for supported resources.', 'The other choices protect web traffic, provide DNS, or manage certificates.'),
        t('must keep only core recovery components running in a secondary Region and create the rest during a disaster. Which strategy is this?', 'Pilot light', ['Active-active', 'Warm standby', 'A single-AZ deployment'], 'Pilot light keeps the core components available while the remaining environment is provisioned during recovery.', 'Active-active and warm standby keep more recovery capacity running. A single AZ is not a Regional recovery strategy.'),
      ] },
      { id: 3, name: 'Deployment, Provisioning, and Automation', weight: 0.22, tasks: ['Provision and maintain cloud resources', 'Automate the management of existing resources'], topics: [
        t('needs repeatable infrastructure changes with a reviewable template. Which service is most appropriate?', 'AWS CloudFormation', ['Amazon Macie', 'Amazon CloudFront', 'Amazon ElastiCache'], 'CloudFormation defines and manages AWS resources as infrastructure as code.', 'The other choices discover sensitive data, deliver content, or cache data.'),
        t('needs to run an operational command across a fleet of managed instances. Which service should be used?', 'AWS Systems Manager Run Command', ['Amazon S3 Select', 'Amazon Cognito', 'AWS Shield'], 'Systems Manager Run Command executes commands across managed instances without requiring inbound SSH.', 'The other choices query objects, manage identities, or protect against DDoS.'),
        t('must share a CloudFormation stack configuration across several accounts and Regions. Which feature fits?', 'CloudFormation StackSets', ['An S3 access point', 'A Lambda layer', 'A Route 53 health check'], 'StackSets deploy and manage CloudFormation stacks across accounts and Regions.', 'The other choices manage S3 access, Lambda packaging, or endpoint health.'),
        t('wants a resource change event to invoke a remediation Lambda function. Which pattern is suitable?', 'EventBridge rule targeting Lambda', ['A NAT gateway route', 'An EBS volume type', 'An RDS read replica'], 'EventBridge rules can match resource events and invoke automation targets.', 'The other choices are networking, block storage, or database read scaling features.'),
        t('needs to build an immutable machine image on a schedule. Which service should be evaluated?', 'EC2 Image Builder', ['Amazon Inspector only', 'AWS Budgets', 'Amazon SES'], 'EC2 Image Builder automates image pipelines that build, test, and distribute AMIs.', 'Inspector scans for vulnerabilities, Budgets monitors cost, and SES sends email.'),
      ] },
      { id: 4, name: 'Security and Compliance', weight: 0.16, tasks: ['Implement and manage security and compliance tools and policies', 'Implement strategies to protect data and infrastructure'], topics: [
        t('needs to find why an IAM principal was denied access to an S3 object. Which tool should be checked first?', 'IAM policy simulator and CloudTrail evidence', ['CloudFront cache statistics', 'EBS burst balance', 'Route 53 latency records'], 'The IAM policy simulator evaluates authorization and CloudTrail can show the denied API call and context.', 'The other choices measure CDN, storage, or DNS behavior rather than IAM authorization.'),
        t('must enforce a list of approved Regions across member accounts. Which organization control is appropriate?', 'A service control policy', ['An S3 lifecycle rule', 'A security group', 'A CloudFront cache policy'], 'An SCP can deny actions outside approved Regions across member accounts.', 'The other choices do not restrict account API operations by Region.'),
        t('needs continuous evaluation of resources against a compliance rule. Which service should be used?', 'AWS Config', ['Amazon Kinesis', 'Amazon EFS', 'AWS CodeBuild'], 'AWS Config records resource configuration and evaluates it against rules and conformance packs.', 'The other choices provide streaming, file storage, or build automation.'),
        t('must keep application credentials out of source code and rotate them automatically. Which service fits?', 'AWS Secrets Manager', ['Amazon CloudFront', 'AWS Transit Gateway', 'Amazon Athena'], 'Secrets Manager stores credentials and supports rotation workflows and runtime retrieval.', 'The other choices provide content delivery, routing, or SQL query services.'),
        t('needs a managed service to detect suspicious API and network activity. Which service should be enabled?', 'Amazon GuardDuty', ['AWS Artifact', 'Amazon EBS', 'AWS CloudFormation'], 'GuardDuty analyzes supported account and network telemetry and produces threat findings.', 'The other choices provide compliance documents, block storage, or infrastructure provisioning.'),
      ] },
      { id: 5, name: 'Networking and Content Delivery', weight: 0.18, tasks: ['Implement and optimize networking features and connectivity', 'Configure domains, DNS services, and content delivery', 'Troubleshoot network connectivity issues'], topics: [
        t('needs private access from a VPC to an AWS service without using the public internet. Which feature fits?', 'A VPC endpoint', ['A public S3 website', 'A CloudFront invalidation', 'An IAM permission boundary'], 'VPC endpoints provide private connectivity to supported AWS services.', 'The other choices do not provide private service connectivity.'),
        t('must route users to the closest healthy Regional endpoint. Which Route 53 policy should be considered?', 'Latency-based routing with health checks', ['Simple routing only', 'An S3 lifecycle rule', 'An EBS snapshot'], 'Latency routing selects by measured network latency and health checks can exclude failed endpoints.', 'The other choices do not perform latency-aware DNS failover.'),
        t('needs a static anycast entry point that routes to healthy regional resources over the AWS global network. Which service fits?', 'AWS Global Accelerator', ['Amazon EFS', 'AWS Glue', 'Amazon RDS Proxy'], 'Global Accelerator provides static anycast IPs and routes traffic to healthy regional endpoints.', 'The other choices provide file storage, ETL, or database connection pooling.'),
        t('must identify whether a subnet route or security group is blocking a connection. Which logs are useful?', 'VPC Flow Logs', ['S3 Inventory', 'CloudTrail digest files only', 'AWS Budgets reports'], 'VPC Flow Logs provide metadata about accepted and rejected traffic for network troubleshooting.', 'The other choices do not capture subnet traffic metadata.'),
        t('needs to cache static and dynamic content near users. Which service should be placed in front of the origin?', 'Amazon CloudFront', ['Amazon SQS', 'AWS Backup', 'Amazon Neptune'], 'CloudFront caches and serves content from edge locations close to viewers.', 'The other choices queue messages, back up resources, or provide graph storage.'),
      ] },
    ],
  },
  'dea-c01': {
    totalTarget: 195,
    domains: [
      { id: 1, name: 'Data Ingestion and Transformation', weight: 0.34, tasks: ['Perform data ingestion', 'Transform and process data', 'Orchestrate data pipelines', 'Apply programming concepts'], topics: [
        t('needs to ingest ordered streaming records that multiple consumers can replay independently. Which service fits?', 'Amazon Kinesis Data Streams', ['Amazon S3 Glacier', 'Amazon Route 53', 'AWS Certificate Manager'], 'Kinesis Data Streams retains ordered records and supports independent consumer positions.', 'The other choices provide archival storage, DNS, or certificates.'),
        t('needs managed ETL jobs and a central schema catalog for objects in S3. Which service should be used?', 'AWS Glue', ['Amazon CloudFront', 'Amazon Cognito', 'AWS Shield'], 'AWS Glue provides ETL jobs, crawlers, and the Glue Data Catalog.', 'The other choices provide content delivery, identity, or DDoS protection.'),
        t('must convert CSV data into a columnar format for analytics. Which transformation is most appropriate?', 'Convert the records to Apache Parquet', ['Convert the records to JPEG', 'Store every row as a DNS record', 'Encode the data as an IAM policy'], 'Parquet is a columnar format that can reduce scan volume and improve analytical query performance.', 'The other choices are image, DNS, or authorization representations.'),
        t('needs a durable workflow that coordinates crawlers, transformations, and validation steps. Which service should orchestrate it?', 'AWS Step Functions or AWS Glue Workflows', ['An S3 ACL', 'A security group', 'An EBS snapshot'], 'Workflow orchestration services represent dependencies and retries between data pipeline steps.', 'The other choices control access, network traffic, or volume backups.'),
        t('must prevent a streaming producer from overwhelming a downstream data store. Which strategy is appropriate?', 'Buffer records and apply throttling with retry and backoff', ['Disable all retries', 'Make the data store public', 'Remove partition keys'], 'Buffering, throttling, and backoff smooth bursts and protect the downstream system from overload.', 'The other choices reduce reliability or data-store performance.'),
      ] },
      { id: 2, name: 'Data Store Management', weight: 0.26, tasks: ['Choose a data store', 'Understand data cataloging systems', 'Manage the lifecycle of data', 'Design data models and schema evolution'], topics: [
        t('needs SQL analytics over large columnar tables with a managed warehouse. Which service fits?', 'Amazon Redshift', ['Amazon EFS', 'Amazon SQS', 'Amazon Cognito'], 'Redshift is a managed analytical data warehouse optimized for columnar scans and parallel queries.', 'The other choices provide file storage, queues, or identity.'),
        t('needs a technical catalog of table schemas discovered from S3 data. Which feature should be used?', 'AWS Glue Data Catalog with a crawler', ['A Route 53 hosted zone', 'An EC2 security group', 'A CloudFront cache policy'], 'A Glue crawler discovers schemas and stores table metadata in the Glue Data Catalog.', 'The other choices do not catalog data schemas.'),
        t('needs to remove old objects automatically after a retention period. Which feature should be configured?', 'An S3 Lifecycle rule', ['An IAM permission boundary', 'A VPC endpoint', 'An SNS subscription'], 'S3 Lifecycle rules transition or expire objects based on age and storage requirements.', 'The other choices manage IAM, private connectivity, or notifications.'),
        t('needs flexible schema evolution for semi-structured records. Which design is appropriate?', 'Use a schema registry or catalog with versioned compatible schemas', ['Require every consumer to share an immutable table forever', 'Use a security group as a schema', 'Disable validation'], 'Versioned schemas let producers and consumers evolve without breaking compatible readers.', 'The other choices do not manage data schema compatibility.'),
        t('needs a key-value store with predictable single-digit millisecond access at scale. Which service should be evaluated?', 'Amazon DynamoDB', ['Amazon CloudFront', 'Amazon EFS', 'Amazon SES'], 'DynamoDB is a managed key-value and document database designed for low-latency access at scale.', 'The other choices deliver content, store files, or send email.'),
      ] },
      { id: 3, name: 'Data Operations and Support', weight: 0.22, tasks: ['Monitor and troubleshoot data pipelines', 'Ensure data quality and consistency', 'Optimize data operations and costs'], topics: [
        t('needs to alert when a pipeline job fails or exceeds its duration objective. Which capability should be configured?', 'CloudWatch metrics and alarms for the pipeline', ['An S3 public access point', 'A KMS alias', 'A Route 53 TXT record'], 'CloudWatch metrics and alarms provide operational visibility and notifications for data workflows.', 'The other choices manage storage access, key names, or DNS text records.'),
        t('must check that required columns are non-null before loading a curated table. What should the pipeline include?', 'A data quality validation step', ['A CloudFront distribution', 'An IAM group only', 'An EBS placement group'], 'A validation step detects missing or invalid values before publishing data to downstream consumers.', 'The other choices do not assess record quality.'),
        t('needs to query historical pipeline logs efficiently. Which destination is suitable?', 'A centralized CloudWatch Logs group with Logs Insights queries', ['An EC2 instance store volume', 'A security group rule', 'An S3 website endpoint'], 'CloudWatch Logs and Logs Insights support centralized retention and queryable operational logs.', 'The other choices do not provide managed log search.'),
        t('wants to reduce the cost of repeated queries over unchanged source data. Which approach is appropriate?', 'Materialize or cache the result when the access pattern justifies it', ['Run a full source scan for every request', 'Disable all partitioning', 'Duplicate data into random Regions'], 'Materialized views, result caching, and partition pruning can reduce repeated processing and cost.', 'Repeated full scans and unplanned duplication increase cost.'),
        t('must replay data after correcting a transformation bug. Which ingestion design helps?', 'Retain source records or a replayable stream for a defined period', ['Delete source data immediately', 'Store only a final aggregate', 'Disable versioning'], 'Retained source or stream data lets the pipeline rerun a corrected transformation.', 'Deleting source data or retaining only aggregates removes replayability.'),
      ] },
      { id: 4, name: 'Data Security and Governance', weight: 0.18, tasks: ['Implement data access controls', 'Encrypt data and manage secrets', 'Implement governance and auditing'], topics: [
        t('must grant an ETL role access to only a curated S3 prefix. Which control is appropriate?', 'A least-privilege IAM policy scoped to that prefix', ['A public bucket policy', 'An administrator policy', 'A security group rule'], 'A narrowly scoped identity or bucket policy limits the role to required prefixes and actions.', 'Public or administrator access is broader than needed, and security groups do not authorize S3 objects.'),
        t('needs to encrypt data in S3 using a customer-controlled key and audit key use. Which option fits?', 'SSE-KMS with a customer managed KMS key', ['SSE-S3 with no audit trail', 'Plaintext objects', 'A CloudFront cache policy'], 'SSE-KMS with a customer managed key provides key policy control and KMS audit events.', 'The other choices do not provide the required customer key governance.'),
        t('must discover personally identifiable information in a data lake. Which service should be evaluated?', 'Amazon Macie', ['Amazon Inspector', 'AWS WAF', 'Amazon Route 53'], 'Macie discovers sensitive data such as PII in S3 and reports findings for investigation.', 'Inspector scans workloads, WAF filters web traffic, and Route 53 provides DNS.'),
        t('needs a central audit record of data pipeline API activity. Which service should be configured?', 'AWS CloudTrail', ['Amazon ElastiCache', 'AWS Batch', 'Amazon EFS'], 'CloudTrail records AWS API activity and can deliver logs to a protected S3 bucket.', 'The other choices provide caching, batch compute, or file storage.'),
        t('must prevent a pipeline role from decrypting data outside an approved account. Which mechanism should constrain the key?', 'A KMS key policy and encryption context conditions', ['A public DNS record', 'An S3 lifecycle rule', 'A CloudFront origin group'], 'KMS key policies and conditions constrain which principals and contexts can use the key.', 'The other choices do not authorize cryptographic operations.'),
      ] },
    ],
  },
  'dva-c02': {
    totalTarget: 195,
    domains: [
      { id: 1, name: 'Development with AWS Services', weight: 0.32, tasks: ['Develop code for applications hosted on AWS', 'Develop code for AWS Lambda', 'Use data stores in application development'], topics: [
        t('needs a loosely coupled notification fanout pattern from application code. Which service should the SDK call?', 'Publish an event to an Amazon SNS topic', ['Write directly to a random EC2 disk', 'Create a Route 53 health check', 'Rotate a KMS key'], 'SNS provides a managed publish and subscribe fanout pattern for application events.', 'The other choices do not deliver application messages to independent subscribers.'),
        t('needs to invoke a Lambda function asynchronously and handle failures without blocking the caller. Which invocation mode fits?', 'An asynchronous Lambda invocation', ['A synchronous invocation that waits for completion', 'A DNS query', 'An S3 lifecycle transition'], 'Asynchronous invocation returns control to the caller and Lambda manages retries and destinations.', 'The other choices do not provide asynchronous Lambda processing.'),
        t('needs a DynamoDB query that reads only items for one partition key. Which operation should the code use?', 'Query', ['Scan', 'DescribeInstances', 'ListBuckets'], 'DynamoDB Query uses a partition key to read matching items efficiently.', 'Scan reads every item and the other APIs target unrelated services.'),
        t('must cache frequently read application data with low latency. Which service should the code integrate?', 'Amazon ElastiCache', ['AWS Artifact', 'Amazon SES', 'AWS Config'], 'ElastiCache provides managed in-memory caching for suitable application data.', 'The other choices provide compliance reports, email, or configuration evaluation.'),
        t('needs to call AWS APIs without storing long-lived keys in application code. Which approach is best?', 'Use an IAM role and temporary credentials through the SDK', ['Embed a root access key', 'Make the API public', 'Put credentials in a container image'], 'Roles and temporary credentials avoid long-lived secrets in application code and images.', 'Embedding keys or using public access creates security risk.'),
      ] },
      { id: 2, name: 'Security', weight: 0.26, tasks: ['Implement authentication and authorization', 'Implement encryption by using AWS services', 'Manage sensitive data in application code'], topics: [
        t('needs users to sign in to a mobile application and receive tokens. Which service should be used?', 'Amazon Cognito user pools', ['AWS Organizations', 'Amazon CloudWatch', 'AWS Transit Gateway'], 'Cognito user pools provide managed application user directories and tokens.', 'The other choices provide governance, monitoring, or networking.'),
        t('needs an application to call a private AWS service without exposing data to the public internet. Which feature should be configured?', 'A VPC interface endpoint', ['A public IP on every instance', 'An S3 website endpoint', 'An internet-facing load balancer only'], 'An interface endpoint provides private access to supported AWS service APIs.', 'Public addresses and internet-facing endpoints do not meet private access requirements.'),
        t('must encrypt a secret used by a Lambda function and rotate it without source changes. Which service fits?', 'AWS Secrets Manager with a KMS key', ['An S3 public object', 'A CloudFront cache', 'A Route 53 record'], 'Secrets Manager stores and rotates secrets and can use KMS for encryption at rest.', 'The other choices do not securely manage rotating application secrets.'),
        t('needs to prevent an application from logging sensitive user data. Which control should be added?', 'Input validation and log redaction before emitting records', ['Log every request body in plaintext', 'Disable all authorization', 'Use a larger EC2 instance'], 'Sanitization and redaction prevent sensitive fields from entering application logs.', 'Plaintext logging increases exposure and the other choices do not protect logged data.'),
        t('must encrypt data in transit between a client and an API. Which configuration should be used?', 'HTTPS with a managed TLS certificate', ['HTTP only', 'An S3 lifecycle rule', 'A DynamoDB scan'], 'HTTPS protects application traffic in transit and a managed certificate provides server identity.', 'The other choices do not provide transport encryption.'),
      ] },
      { id: 3, name: 'Deployment', weight: 0.24, tasks: ['Prepare application artifacts', 'Test applications in development environments', 'Automate deployment testing', 'Deploy code by using CI/CD services'], topics: [
        t('needs a repeatable package for a Lambda function and its dependencies. Which option should be used?', 'A deployment package or Lambda container image', ['A Route 53 hosted zone', 'A security group only', 'A CloudTrail trail'], 'Lambda deployment packages or container images bundle code and runtime dependencies.', 'The other choices do not package executable application code.'),
        t('wants to deploy a function to a test stage before production. Which service combination fits?', 'AWS SAM or CloudFormation with separate environments', ['A public S3 bucket only', 'A KMS alias', 'A VPC flow log'], 'Infrastructure as code can create repeatable test and production environments with controlled parameters.', 'The other choices do not deploy isolated application environments.'),
        t('must shift production traffic gradually to a new Lambda version. Which mechanism is appropriate?', 'Lambda aliases with a weighted canary deployment', ['A full database scan', 'An S3 lifecycle transition', 'An IAM password policy'], 'Lambda aliases can route a percentage of traffic to a new version for a controlled rollout.', 'The other choices do not control Lambda version traffic.'),
        t('needs a code commit to trigger build, test, and deployment stages. Which service should orchestrate the pipeline?', 'AWS CodePipeline', ['Amazon Neptune', 'AWS Shield', 'Amazon EFS'], 'CodePipeline orchestrates source, build, test, and deployment actions.', 'The other choices provide graph storage, DDoS protection, or file storage.'),
        t('must roll back an application after failed health checks. Which deployment capability is useful?', 'A deployment strategy with automatic rollback', ['A public bucket ACL', 'A DNS TXT record', 'An EBS volume snapshot only'], 'Deployment services can use health checks and alarms to stop or roll back an unhealthy release.', 'The other choices do not coordinate application release rollback.'),
      ] },
      { id: 4, name: 'Troubleshooting and Optimization', weight: 0.18, tasks: ['Assist in a root cause analysis', 'Instrument code for observability', 'Optimize applications by using AWS services and features'], topics: [
        t('needs end-to-end traces across API Gateway, Lambda, and downstream services. Which service should be configured?', 'AWS X-Ray', ['Amazon S3 Inventory', 'AWS Budgets', 'Amazon Route 53'], 'X-Ray traces requests across supported service boundaries and helps identify latency and errors.', 'The other choices provide object reports, cost monitoring, or DNS.'),
        t('must find application errors in structured logs using a query language. Which feature is suitable?', 'CloudWatch Logs Insights', ['An IAM role trust policy', 'An S3 lifecycle rule', 'A VPC route table'], 'Logs Insights queries centralized log events and supports operational troubleshooting.', 'The other choices do not query application log records.'),
        t('needs to reduce Lambda cold-start latency for a predictable request rate. Which feature should be evaluated?', 'Provisioned Concurrency', ['An S3 bucket policy', 'A larger Route 53 TTL', 'A KMS alias'], 'Provisioned Concurrency keeps execution environments initialized for lower startup latency.', 'The other choices do not control Lambda initialization.'),
        t('must reduce repeated reads from a slow downstream service. Which application pattern is appropriate?', 'Cache responses with an expiration policy', ['Retry every request immediately forever', 'Disable timeouts', 'Write credentials to logs'], 'Application-level caching can reduce repeated downstream calls and improve response latency.', 'Unbounded retries and disabled timeouts can worsen outages, and logging credentials is unsafe.'),
        t('needs a custom application metric for failed business transactions. Which approach fits?', 'Publish a CloudWatch custom metric and alarm on it', ['Use a public DNS record', 'Create an EBS snapshot', 'Change an IAM username'], 'Custom metrics expose business failures to CloudWatch dashboards and alarms.', 'The other choices do not provide application observability.'),
      ] },
    ],
  },
  'mla-c01': {
    totalTarget: 195,
    domains: [
      { id: 1, name: 'Data Preparation for Machine Learning', weight: 0.28, tasks: ['Ingest and store data', 'Transform and validate data', 'Prepare features for modeling'], topics: [
        t('needs to remove duplicate records and fill missing values before training. Which pipeline stage should perform this?', 'Data cleaning and validation', ['Model endpoint autoscaling', 'A Route 53 health check', 'A KMS alias'], 'Cleaning and validation improve training data quality before feature creation and model fitting.', 'The other choices operate networking, deployment, or encryption naming.'),
        t('needs to transform raw S3 data into a tabular feature set with managed processing. Which service should be evaluated?', 'Amazon SageMaker Processing', ['Amazon CloudFront', 'Amazon Cognito', 'AWS Shield'], 'SageMaker Processing runs managed data processing jobs for ML preparation.', 'The other choices provide content delivery, identity, or DDoS protection.'),
        t('must split labeled data into training, validation, and test sets without leakage. Which practice is appropriate?', 'Use a reproducible split strategy that prevents related records crossing sets', ['Use the same record in every set', 'Shuffle labels independently', 'Test only on training data'], 'A leakage-safe split gives a more realistic estimate of model generalization.', 'The other choices produce inflated or invalid evaluation results.'),
        t('needs a reusable numerical feature definition shared by training and inference. Which capability should be used?', 'Amazon SageMaker Feature Store', ['An S3 website endpoint', 'An IAM password policy', 'A CloudFront invalidation'], 'Feature Store centralizes and serves consistent features for training and inference.', 'The other choices do not manage ML feature definitions.'),
        t('must protect training data while it is stored in S3. Which control is appropriate?', 'S3 server-side encryption with a KMS key and least-privilege access', ['Public read access', 'A DNS alias', 'An unencrypted EBS volume'], 'Encryption and least-privilege policies protect training artifacts at rest.', 'Public access and plaintext storage expose sensitive data.'),
      ] },
      { id: 2, name: 'ML Model Development', weight: 0.26, tasks: ['Select and train models', 'Tune hyperparameters', 'Evaluate and manage model versions'], topics: [
        t('needs to compare multiple hyperparameter combinations automatically. Which SageMaker capability fits?', 'A hyperparameter tuning job', ['An S3 lifecycle rule', 'A VPC endpoint only', 'A CloudFront cache policy'], 'Hyperparameter tuning runs trials and selects configurations based on an objective metric.', 'The other choices do not optimize model training parameters.'),
        t('must choose a metric for a binary classifier with highly imbalanced classes. Which metric is generally more informative than accuracy alone?', 'Precision, recall, or an area-under-curve metric selected for the business objective', ['Only training loss', 'The S3 object count', 'The EC2 instance name'], 'Precision and recall expose minority-class behavior that accuracy can hide.', 'Storage metadata and instance names do not measure classifier quality.'),
        t('needs to register a validated model version for controlled promotion. Which service should be used?', 'SageMaker Model Registry', ['Amazon Route 53', 'AWS WAF', 'Amazon EFS'], 'Model Registry tracks model versions and approval status for controlled deployment.', 'The other choices provide DNS, web filtering, or file storage.'),
        t('must reduce overfitting on the training data. Which action should be considered?', 'Use regularization, validation data, or early stopping', ['Train and test on the same records', 'Remove the validation set', 'Increase label leakage'], 'Regularization and validation-based stopping improve generalization and reduce overfitting.', 'The other choices make evaluation less reliable.'),
        t('needs distributed training over several compute nodes. Which approach should be evaluated?', 'A SageMaker distributed training job', ['A Route 53 weighted record', 'An S3 ACL', 'A CloudWatch dashboard only'], 'SageMaker distributed training coordinates supported algorithms and frameworks across instances.', 'The other choices do not execute distributed ML training.'),
      ] },
      { id: 3, name: 'Deployment and Orchestration of ML Workflows', weight: 0.22, tasks: ['Deploy models to endpoints', 'Orchestrate ML workflows', 'Automate CI/CD for ML systems'], topics: [
        t('needs a real-time prediction endpoint that automatically adds instances with request volume. Which design fits?', 'A SageMaker real-time endpoint with autoscaling', ['A batch transform job only', 'An S3 Glacier vault', 'A Route 53 TXT record'], 'A real-time endpoint serves requests and autoscaling adjusts instances to demand.', 'Batch transform is offline, Glacier is archival, and DNS text records do not host models.'),
        t('needs predictions for a large data set without a low-latency request requirement. Which option is appropriate?', 'A SageMaker batch transform job', ['A public Lambda URL for every row', 'A CloudFront distribution', 'An IAM group'], 'Batch Transform processes a data set offline without maintaining a real-time endpoint.', 'The other choices add unnecessary request infrastructure or do not run predictions.'),
        t('must orchestrate preprocessing, training, evaluation, and registration. Which service should define the workflow?', 'SageMaker Pipelines', ['AWS WAF', 'Amazon EFS', 'Amazon Route 53'], 'SageMaker Pipelines represents repeatable ML workflow steps and conditions.', 'The other choices do not orchestrate ML lifecycle steps.'),
        t('needs to deploy a new model version gradually while comparing it with the existing version. Which strategy is appropriate?', 'A shadow or canary deployment with monitored traffic', ['Delete the existing endpoint first', 'Disable metrics', 'Use a public S3 bucket'], 'Shadow or canary deployments reduce release risk by comparing a new version before full traffic shift.', 'Deleting the old model and disabling metrics removes safety controls.'),
        t('must package preprocessing code and dependencies consistently for training and inference. Which artifact is suitable?', 'A versioned container image or reproducible source package', ['A DNS record', 'A security group description', 'A billing tag only'], 'Versioned artifacts make ML execution environments repeatable across stages.', 'Network and billing metadata do not package runtime dependencies.'),
      ] },
      { id: 4, name: 'ML Solution Monitoring, Maintenance, and Security', weight: 0.24, tasks: ['Monitor models and data', 'Maintain ML infrastructure', 'Secure ML solutions'], topics: [
        t('needs to detect that live feature distributions differ from training data. Which control should be considered?', 'Model Monitor data quality or drift monitoring', ['An S3 lifecycle rule', 'A Route 53 alias', 'A KMS key alias'], 'Model Monitor can detect changes in data quality and distribution that affect model behavior.', 'The other choices do not monitor ML input drift.'),
        t('needs to protect a SageMaker endpoint from unauthorized invocation. Which control is most important?', 'A least-privilege IAM policy on the invoking role', ['A public endpoint with no authentication', 'A CloudFront cache policy', 'An S3 storage class'], 'IAM authorization restricts who can invoke the endpoint and which model resources they can access.', 'Public access and storage or cache settings do not authorize model invocation.'),
        t('must monitor endpoint latency, errors, and invocation count. Which service should collect the operational metrics?', 'Amazon CloudWatch', ['Amazon Macie', 'AWS Artifact', 'Amazon EBS'], 'CloudWatch provides endpoint metrics, alarms, dashboards, and logs for SageMaker operations.', 'The other choices discover data, provide compliance documents, or store blocks.'),
        t('needs explainability and bias analysis before promoting a model. Which SageMaker capability fits?', 'SageMaker Clarify', ['Amazon Route 53', 'AWS Batch only', 'S3 Transfer Acceleration'], 'SageMaker Clarify provides bias detection and explainability features for ML workflows.', 'The other choices provide DNS, batch compute, or transfer acceleration.'),
        t('must ensure model artifacts are encrypted and access is auditable. Which combination is appropriate?', 'KMS encryption, least-privilege IAM, and CloudTrail logging', ['Public artifact access and no logs', 'A security group only', 'A DNS health check'], 'Encryption, authorization, and audit logging provide layered protection for model artifacts.', 'The other choices do not provide ML artifact confidentiality and accountability.'),
      ] },
    ],
  },
  'dop-c02': {
    totalTarget: 225,
    domains: [
      { id: 1, name: 'SDLC Automation', weight: 0.22, tasks: ['Implement continuous delivery systems', 'Automate build and test workflows'], topics: [
        t('needs a pipeline that builds an artifact, runs tests, and deploys it after an approval. Which service should orchestrate the stages?', 'AWS CodePipeline', ['Amazon Route 53', 'AWS KMS', 'Amazon EFS'], 'CodePipeline orchestrates source, build, approval, and deployment stages.', 'The other choices provide DNS, encryption keys, or file storage.'),
        t('must compile source code and produce a versioned artifact in a managed build environment. Which service fits?', 'AWS CodeBuild', ['Amazon Macie', 'AWS WAF', 'Amazon Neptune'], 'CodeBuild runs managed build commands and can publish artifacts.', 'The other choices discover data, filter web requests, or provide graph storage.'),
        t('needs to deploy a new application version to a subset of instances before full rollout. Which strategy fits?', 'A canary or blue-green deployment', ['A full replacement with no health check', 'A public bucket policy', 'A DNS TXT record'], 'Canary and blue-green strategies reduce release risk by validating a new version before full traffic shift.', 'The other choices do not implement controlled application rollout.'),
        t('must prevent an untested artifact from being promoted to production. Which control is appropriate?', 'A pipeline approval or quality gate based on test results', ['Disable all tests', 'Use an unversioned artifact name', 'Store credentials in source'], 'Approval gates and automated quality checks prevent unvalidated artifacts from promotion.', 'The other choices weaken release safety and traceability.'),
        t('needs to generate release notes and test suggestions using an AWS coding assistant. Which service is relevant?', 'Amazon Q Developer', ['Amazon S3 Glacier', 'AWS Transit Gateway', 'Amazon RDS'], 'Amazon Q Developer can assist with code, reviews, tests, and development workflows.', 'The other choices provide archival storage, networking, or relational databases.'),
      ] },
      { id: 2, name: 'Configuration Management and IaC', weight: 0.17, tasks: ['Implement infrastructure as code', 'Manage configuration and secrets'], topics: [
        t('needs repeatable multi-account infrastructure deployments from one template. Which CloudFormation feature fits?', 'CloudFormation StackSets', ['A CloudFront cache policy', 'An S3 ACL', 'An RDS read replica'], 'StackSets deploy templates across multiple accounts and Regions.', 'The other choices do not manage multi-account infrastructure.'),
        t('must store environment-specific application settings and roll them out safely. Which service should be evaluated?', 'AWS AppConfig', ['Amazon Inspector', 'AWS Shield', 'Amazon SQS'], 'AppConfig manages and deploys application configuration with validation and controlled rollout.', 'The other choices scan, protect, or queue but do not manage application configuration.'),
        t('needs to detect configuration drift from its infrastructure templates. Which capability should be used?', 'CloudFormation drift detection', ['A Route 53 health check', 'An S3 event notification', 'An EBS snapshot'], 'Drift detection compares deployed resources with the expected template state.', 'The other choices monitor DNS, publish object events, or back up volumes.'),
        t('must prevent secrets from appearing in IaC templates and deployment logs. Which practice is appropriate?', 'Reference Secrets Manager or Parameter Store at runtime', ['Hard-code secrets in the template', 'Print secrets during the build', 'Put secrets in a public S3 object'], 'Runtime secret references keep sensitive values out of source and logs.', 'Hard-coded or public secrets expose credentials.'),
        t('needs to apply the same guardrail policy to every account. Which organization feature fits?', 'An AWS Organizations service control policy', ['A local EC2 user', 'A CloudFront invalidation', 'An EFS lifecycle rule'], 'SCPs apply permission guardrails across member accounts.', 'The other choices do not establish an organization-wide API guardrail.'),
      ] },
      { id: 3, name: 'Resilient Cloud Solutions', weight: 0.15, tasks: ['Build highly available and self-healing systems', 'Automate resilient deployments'], topics: [
        t('must replace unhealthy instances automatically and spread capacity across Availability Zones. Which design fits?', 'A multi-AZ Auto Scaling group with health checks', ['One fixed instance', 'An S3 bucket website', 'A KMS alias'], 'Auto Scaling health checks replace failed instances and multiple subnets spread capacity.', 'The other choices do not provide self-healing compute.'),
        t('needs to decouple a producer from workers when the worker fleet is temporarily unavailable. Which service should buffer work?', 'Amazon SQS', ['Amazon Route 53', 'AWS Certificate Manager', 'Amazon EBS'], 'SQS durably buffers messages until workers can process them.', 'The other choices provide DNS, certificates, or block storage.'),
        t('must send requests to healthy application targets in multiple Availability Zones. Which service fits?', 'An Application Load Balancer with target health checks', ['A single EC2 public IP', 'An S3 lifecycle rule', 'An IAM group'], 'An ALB routes to healthy targets across configured subnets.', 'The other choices do not perform application load balancing.'),
        t('needs a database failover target without changing the application connection endpoint. Which deployment should be used?', 'RDS Multi-AZ', ['A single-AZ RDS instance', 'An S3 bucket policy', 'An EBS snapshot only'], 'RDS Multi-AZ maintains a standby and updates the managed endpoint during failover.', 'The other choices do not provide managed database failover.'),
        t('wants an event to trigger an automated recovery workflow. Which integration is suitable?', 'EventBridge invoking Step Functions', ['A public DNS record', 'A security group only', 'An S3 storage class'], 'EventBridge and Step Functions can route events into durable, retryable recovery workflows.', 'The other choices do not orchestrate recovery steps.'),
      ] },
      { id: 4, name: 'Monitoring and Logging', weight: 0.15, tasks: ['Implement monitoring and logging systems', 'Analyze operational metrics'], topics: [
        t('needs centralized application logs searchable by request ID. Which design is appropriate?', 'Structured logs in CloudWatch Logs with Logs Insights queries', ['Logs only on instance store', 'Public S3 objects', 'DNS TXT records'], 'Central structured logs and queries make distributed troubleshooting practical.', 'The other choices are ephemeral or unrelated to application logs.'),
        t('must alert when a deployment causes a latency regression. Which combination fits?', 'CloudWatch metrics, alarms, and a deployment event', ['Disable metrics during deployment', 'Use only an IAM policy', 'Create a static S3 object'], 'Metrics and alarms can detect regression and trigger an incident or rollback.', 'IAM and static objects do not measure deployment performance.'),
        t('needs distributed request tracing across microservices. Which service should be evaluated?', 'AWS X-Ray', ['AWS Artifact', 'Amazon EFS', 'AWS Budgets'], 'X-Ray traces requests across supported service boundaries.', 'The other choices provide compliance documents, file storage, or cost monitoring.'),
        t('must preserve logs centrally for audit and operational analysis. Which destination is suitable?', 'An encrypted central S3 bucket with CloudTrail and log delivery', ['A single developer laptop', 'An instance store volume', 'A public web directory'], 'A protected central bucket provides durable retention and controlled access for logs.', 'Local or public storage is not a reliable audit archive.'),
        t('needs a dashboard that combines metrics from several accounts and Regions. Which feature should be used?', 'CloudWatch cross-account observability dashboards', ['A Route 53 record', 'An S3 ACL', 'A KMS grant'], 'CloudWatch supports cross-account and cross-Region monitoring views for centralized operations.', 'The other choices do not aggregate operational metrics.'),
      ] },
      { id: 5, name: 'Incident and Event Response', weight: 0.14, tasks: ['Detect and respond to incidents', 'Automate event response'], topics: [
        t('must invoke a remediation runbook when a security finding appears. Which pattern is appropriate?', 'EventBridge finding event to Systems Manager Automation', ['A manual spreadsheet only', 'A Route 53 TXT record', 'An S3 lifecycle rule'], 'EventBridge can route findings to an automated Systems Manager runbook.', 'The other choices do not automate incident remediation.'),
        t('needs a central queue for operational alerts so responders can acknowledge them in order. Which service fits?', 'Amazon SQS', ['Amazon CloudFront', 'AWS KMS', 'Amazon EFS'], 'SQS provides durable queueing for alert workflows and consumer acknowledgement.', 'The other choices provide content delivery, encryption, or file storage.'),
        t('must preserve an event stream for later replay after an incident. Which capability should be configured?', 'An EventBridge archive and replay', ['An EBS deletion', 'A public S3 bucket', 'A security group'], 'EventBridge archives can retain matching events and replay them after a fix.', 'The other choices do not preserve event bus traffic for replay.'),
        t('needs to isolate a compromised EC2 instance quickly while retaining evidence. Which first action is appropriate?', 'Apply a restrictive security group and preserve logs and snapshots', ['Terminate it immediately without evidence', 'Open all ports', 'Delete CloudTrail'], 'Isolation limits further access while snapshots and logs preserve investigation evidence.', 'Immediate deletion destroys evidence, and opening ports or deleting logs worsens the incident.'),
        t('must document a repeatable response to a common alarm. Which service should store the procedure?', 'Systems Manager Automation runbook', ['A CloudFront cache policy', 'An S3 storage class', 'A Route 53 weighted record'], 'Automation runbooks encode repeatable operational response steps.', 'The other choices do not represent incident procedures.'),
      ] },
      { id: 6, name: 'Security and Compliance', weight: 0.17, tasks: ['Implement security controls', 'Validate compliance and auditability'], topics: [
        t('needs to enforce encryption on all new S3 objects. Which control should be configured?', 'An S3 bucket policy that denies unencrypted PutObject requests', ['A public bucket ACL', 'A Route 53 health check', 'A CloudFront cache'], 'A bucket policy can explicitly deny uploads that do not include the required encryption headers.', 'The other choices do not enforce object encryption.'),
        t('must identify external access granted by resource policies. Which tool is appropriate?', 'IAM Access Analyzer', ['Amazon CloudFront', 'AWS Batch', 'Amazon EFS'], 'IAM Access Analyzer identifies unintended external access in resource policies.', 'The other choices provide content delivery, compute, or file storage.'),
        t('needs to rotate database credentials without rebuilding applications. Which service fits?', 'AWS Secrets Manager', ['A security group', 'An EBS snapshot', 'A Route 53 alias'], 'Secrets Manager supports runtime retrieval and rotation of database credentials.', 'The other choices do not rotate application secrets.'),
        t('must audit every API action in a production account. Which service should be enabled?', 'AWS CloudTrail', ['Amazon ElastiCache', 'AWS WAF only', 'Amazon SES'], 'CloudTrail records API events for security investigations and compliance.', 'The other choices provide caching, web filtering, or email.'),
        t('needs a managed service to detect vulnerabilities in container images before deployment. Which service should be evaluated?', 'Amazon Inspector', ['Amazon Cognito', 'AWS Glue', 'Amazon Route 53'], 'Inspector assesses supported container images and workloads for vulnerabilities.', 'The other choices provide identity, ETL, or DNS.'),
      ] },
    ],
  },
  'aip-c01': {
    totalTarget: 225,
    domains: [
      { id: 1, name: 'Foundation Model Integration, Data Management, and Compliance', weight: 0.31, tasks: ['Integrate foundation models and data', 'Apply compliance controls'], topics: [
        t('needs to provide an application with relevant company documents at inference time without retraining the foundation model. Which pattern fits?', 'Retrieval Augmented Generation with a knowledge base', ['Randomly increase temperature', 'Store documents only in logs', 'Disable access controls'], 'RAG retrieves relevant content and supplies it as context to a foundation model.', 'Temperature does not retrieve facts, logs are not a knowledge base, and disabled access controls are unsafe.'),
        t('must store vector embeddings for semantic similarity search. Which capability is suitable?', 'A vector index in an approved vector store', ['A DNS record', 'An EBS boot log', 'An IAM password policy'], 'Vector indexes support nearest-neighbor retrieval for semantic search and RAG.', 'The other choices do not store or search embeddings.'),
        t('needs to keep customer data private while invoking a managed foundation model. Which control should be considered?', 'Private connectivity, encryption, and least-privilege IAM', ['Send data to a public paste site', 'Disable logging controls', 'Share one administrator key'], 'Network, encryption, and identity controls protect data and reduce unnecessary access.', 'The other choices expose data or weaken authorization.'),
        t('must evaluate a model against a fixed set of business prompts and expected responses. Which practice is appropriate?', 'A repeatable model evaluation dataset and scoring process', ['Evaluate only one happy-path prompt', 'Change prompts after every test', 'Skip recording results'], 'A fixed evaluation set makes quality comparisons reproducible across model versions.', 'The other choices cannot show reliable model changes.'),
        t('needs to control which model a production role can invoke. Which mechanism should be used?', 'An IAM policy scoped to approved Bedrock model resources', ['A public model endpoint', 'A Route 53 record', 'An S3 lifecycle rule'], 'IAM can restrict model invocation actions and resources for a production role.', 'The other choices do not authorize model selection.'),
      ] },
      { id: 2, name: 'Implementation and Integration', weight: 0.26, tasks: ['Integrate foundation models into applications', 'Implement RAG and agentic workflows'], topics: [
        t('needs a model to call approved business APIs while retaining control over tool permissions. Which pattern is appropriate?', 'An agent with narrowly scoped action groups and IAM permissions', ['Give the model administrator credentials', 'Allow arbitrary network egress', 'Store tools in a public bucket'], 'Scoped action groups and IAM permissions constrain agent capabilities and reduce blast radius.', 'Administrator credentials and unrestricted tools are unsafe.'),
        t('must keep prompts consistent across several applications and versions. Which capability should be used?', 'Prompt templates or prompt management with version control', ['Write prompts only in chat messages', 'Use random prompts per request', 'Disable evaluation'], 'Versioned prompt management improves reuse, testing, and controlled rollout.', 'Unversioned or random prompts make application behavior difficult to reproduce.'),
        t('needs to stream model output to a web client as it is generated. Which API behavior should be used?', 'A streaming inference response', ['Wait for a daily batch job', 'Store output only in EBS', 'Use a DNS health check'], 'Streaming responses improve perceived latency for interactive applications.', 'Batch jobs, EBS, and DNS checks do not stream model output.'),
        t('must limit the amount of retrieved context sent to a model while preserving relevant passages. Which approach fits?', 'Retrieve, rank, and limit top relevant chunks', ['Send the entire data lake every time', 'Use no retrieval', 'Increase unrelated prompt text'], 'Ranking and limiting context controls token cost while keeping relevant evidence.', 'Sending all data increases cost and noise, while no retrieval loses grounding.'),
        t('needs to invoke a foundation model from an application without hosting GPU instances. Which service should be used?', 'Amazon Bedrock', ['A self-managed GPU fleet only', 'Amazon Route 53', 'AWS Config'], 'Amazon Bedrock provides managed API access to foundation models without managing model servers.', 'The other choices do not provide managed foundation model inference.'),
      ] },
      { id: 3, name: 'AI Safety, Security, and Governance', weight: 0.20, tasks: ['Apply safety controls', 'Secure and govern GenAI applications'], topics: [
        t('must block harmful topics in both user prompts and model responses. Which feature fits?', 'Amazon Bedrock Guardrails', ['A CloudFront cache policy', 'An S3 lifecycle rule', 'A Route 53 record'], 'Guardrails apply configurable policies to model inputs and outputs.', 'The other choices do not filter GenAI content.'),
        t('needs to prevent customer PII from appearing in model responses. Which layered approach is appropriate?', 'Sensitive information filters, authorization, and output validation', ['Return every response without checks', 'Log all prompts publicly', 'Disable data classification'], 'Input and output controls plus identity policy reduce the chance of exposing sensitive content.', 'Unfiltered responses and public logs increase exposure.'),
        t('must give each agent its own identity when accessing backend systems. Which design is preferred?', 'Per-agent identities with scoped credentials', ['One administrator key shared by all agents', 'Anonymous access', 'Credentials in prompts'], 'Distinct identities support least privilege and auditability for agent actions.', 'Shared or prompt-embedded credentials are difficult to control and audit.'),
        t('needs an audit trail for Bedrock API calls and policy changes. Which service should be enabled?', 'AWS CloudTrail', ['Amazon EFS', 'AWS Batch', 'Amazon CloudFront'], 'CloudTrail records API activity and can deliver it to a protected archive.', 'The other choices do not audit Bedrock API calls.'),
        t('must ensure an agent cannot invoke an unapproved tool. Which control should enforce this?', 'An allowlist of tools backed by IAM and application authorization', ['Allow every tool dynamically', 'Use a random model temperature', 'Remove all logs'], 'A tool allowlist and IAM policy constrain what the agent can call.', 'Model sampling and missing logs do not enforce tool authorization.'),
      ] },
      { id: 4, name: 'Operational Efficiency and Optimization for GenAI Applications', weight: 0.12, tasks: ['Optimize GenAI cost and performance', 'Operate production GenAI systems'], topics: [
        t('needs to reduce inference cost for repeated identical requests. Which optimization should be evaluated?', 'Cache safe, deterministic responses with an expiration policy', ['Send every request to the most expensive model', 'Disable all caching', 'Include the full conversation forever'], 'Response caching can reduce repeated model calls when freshness and privacy requirements permit it.', 'The other choices increase token use or inference cost.'),
        t('must choose a lower-cost model for simple classification while reserving a larger model for complex reasoning. Which design fits?', 'Route requests by complexity and quality requirements', ['Use the largest model for every request', 'Randomly choose a model', 'Disable evaluation'], 'Model routing aligns cost and latency with the task while preserving quality where needed.', 'Using the largest model for every request is usually less cost optimized.'),
        t('needs to control token costs from long conversation history. Which practice is appropriate?', 'Summarize or window conversation context while preserving needed facts', ['Send the entire history indefinitely', 'Duplicate every message', 'Ignore token metrics'], 'Context windows and summaries reduce input tokens while retaining relevant state.', 'Unbounded history increases cost and latency.'),
        t('must monitor production GenAI latency and token usage. Which service should collect operational metrics?', 'Amazon CloudWatch', ['Amazon EFS', 'AWS Certificate Manager', 'Amazon Route 53'], 'CloudWatch dashboards and alarms can track latency, errors, and usage metrics.', 'The other choices do not provide GenAI operational monitoring.'),
        t('needs to keep a workload responsive during model-provider throttling. Which pattern helps?', 'Exponential backoff, bounded retries, and a fallback path', ['Retry without limit', 'Open every request concurrently', 'Remove timeouts'], 'Bounded retries and fallback behavior protect user experience during throttling or transient failures.', 'Unbounded retries and no timeouts can amplify an outage.'),
      ] },
      { id: 5, name: 'Testing, Validation, and Troubleshooting', weight: 0.11, tasks: ['Test and validate GenAI applications', 'Troubleshoot model and retrieval failures'], topics: [
        t('needs to detect hallucinations in a grounded answer set. Which test should be included?', 'A factuality or groundedness evaluation against reference evidence', ['Only measure response length', 'Skip retrieval checks', 'Test only one prompt'], 'Groundedness evaluation checks whether responses are supported by retrieved or reference information.', 'Length and one-off prompts do not measure factual reliability.'),
        t('must determine whether poor answers come from retrieval or generation. Which diagnostic is useful?', 'Inspect retrieved chunks and evaluate the generation separately', ['Change both systems at once', 'Delete all logs', 'Use only a latency metric'], 'Separating retrieval and generation isolates the root cause of a RAG failure.', 'Changing multiple systems or removing evidence prevents diagnosis.'),
        t('needs regression tests for a prompt and model update. Which practice is appropriate?', 'Run a fixed evaluation suite before promotion', ['Promote immediately without tests', 'Change expected answers after failures', 'Test only the UI color'], 'A fixed suite detects quality regressions across model, prompt, and retrieval changes.', 'Uncontrolled expectations do not provide a meaningful regression signal.'),
        t('must monitor a retrieval application for stale documents. Which control should be configured?', 'Document freshness metadata and an index refresh process', ['Disable document timestamps', 'Use a larger model only', 'Store documents only in browser cache'], 'Freshness metadata and index refreshes keep retrieval content aligned with the source of truth.', 'Model size and browser cache do not maintain a current knowledge base.'),
        t('needs to protect troubleshooting logs from containing prompts with confidential data. Which practice fits?', 'Redact sensitive fields and restrict log access', ['Log all prompts publicly', 'Disable authentication', 'Store secrets in error messages'], 'Redaction and least-privilege log access reduce exposure while preserving useful diagnostics.', 'Public logs and secrets in errors create a data leak.'),
      ] },
    ],
  },
  'sap-c02': {
    totalTarget: 225,
    domains: [
      { id: 1, name: 'Design Solutions for Organizational Complexity', weight: 0.26, tasks: ['Design for organizational complexity'], topics: [
        t('needs centralized governance while allowing application teams to deploy in separate accounts. Which design fits?', 'AWS Organizations with delegated administration and SCP guardrails', ['One shared root account', 'Public credentials', 'A single VPC for every workload'], 'Organizations and SCPs provide account boundaries and guardrails while teams retain delegated control.', 'A shared account and public credentials weaken isolation.'),
        t('must connect many VPCs and on-premises networks through a central hub. Which service should be evaluated?', 'AWS Transit Gateway', ['A full mesh of public IPs', 'An S3 website', 'A CloudFront cache'], 'Transit Gateway centralizes routing and supports many attachments.', 'The other choices do not provide private transitive network connectivity.'),
        t('needs to share selected resources across accounts without granting broad account access. Which capability fits?', 'AWS Resource Access Manager with scoped resource shares', ['Share root credentials', 'Make resources public', 'Use one administrator role everywhere'], 'RAM shares supported resources with specific principals and organizational scopes.', 'Public or shared administrator access is broader than necessary.'),
        t('must enforce a common security baseline across new accounts. Which service should assist?', 'AWS Control Tower guardrails and account factory', ['A local spreadsheet', 'An S3 lifecycle rule', 'A Route 53 alias'], 'Control Tower automates account setup and preventive or detective guardrails.', 'The other choices do not govern account baselines.'),
        t('needs a central identity experience for workforce users across many accounts. Which service should be used?', 'IAM Identity Center', ['Cognito user pools only', 'An S3 bucket policy', 'A VPC route table'], 'IAM Identity Center provides workforce access and permission sets across accounts.', 'Cognito targets application users and the other choices are not workforce identity systems.'),
      ] },
      { id: 2, name: 'Design for New Solutions', weight: 0.29, tasks: ['Design new AWS solutions'], topics: [
        t('needs a resilient web architecture with independent scaling tiers. Which pattern is appropriate?', 'Stateless application tiers behind a load balancer with a durable data layer', ['One large instance for every tier', 'Local session state only', 'A public database'], 'Stateless tiers and managed data services scale independently and improve resilience.', 'A single instance and public database create bottlenecks and exposure.'),
        t('must serve global users with low latency and protect a Regional origin. Which design fits?', 'CloudFront with an origin access control and multi-Region strategy where needed', ['Send every request to one public instance', 'Use Direct Connect for public users', 'Disable caching'], 'CloudFront reduces latency and can protect a private origin.', 'The other choices add latency, cost, or exposure.'),
        t('needs asynchronous processing for a large volume of requests. Which architecture should be considered?', 'API ingress, SQS buffering, and independently scaled workers', ['Synchronous calls to every worker', 'One process with local state', 'A single shared administrator credential'], 'Queues decouple producers and workers and absorb bursts.', 'Synchronous chains and shared credentials reduce resilience and security.'),
        t('must choose between relational transactions and flexible key-value access. Which factor should drive the selection?', 'The workload data model, consistency, query, and transaction requirements', ['The service name only', 'The number of DNS records', 'The color of the console'], 'Data model and access patterns determine the appropriate database technology.', 'Cosmetic or unrelated factors do not select a data store.'),
        t('needs a disaster recovery architecture with a defined RTO and RPO. Which process should begin the design?', 'Translate RTO and RPO into recovery strategy and testable controls', ['Choose the largest instance first', 'Skip recovery tests', 'Use one Availability Zone'], 'RTO and RPO determine the recovery architecture, capacity, and backup frequency.', 'Instance size and a single AZ do not define disaster recovery.'),
      ] },
      { id: 3, name: 'Continuous Improvement for Existing Solutions', weight: 0.25, tasks: ['Improve existing AWS solutions'], topics: [
        t('must reduce cost in an existing workload without violating availability objectives. Which first step is appropriate?', 'Analyze utilization, data transfer, and service metrics before rightsizing', ['Delete production resources immediately', 'Disable monitoring', 'Move everything to the largest instance'], 'Measurement identifies safe rightsizing and architectural cost opportunities.', 'Unmeasured deletion or oversizing increases risk and cost.'),
        t('needs to improve a slow service without changing its public API. Which approach fits?', 'Use tracing and metrics to identify the bottleneck before changing components', ['Rewrite every service at once', 'Disable logs', 'Increase all timeouts'], 'Observability identifies the limiting component and supports targeted improvement.', 'Broad rewrites and disabled telemetry increase risk.'),
        t('must modernize a scheduled batch process into a managed, event-driven workflow. Which design should be evaluated?', 'EventBridge triggering Step Functions and managed compute', ['A permanent server with a cron job only', 'Manual console execution', 'A public root key'], 'Managed event-driven orchestration reduces operational work and improves retry behavior.', 'Manual or credential-sharing designs are fragile.'),
        t('needs to migrate a database while minimizing downtime. Which strategy should be considered?', 'AWS DMS with continuous replication and a planned cutover', ['Copy data once and stop the source for weeks', 'Use a DNS TXT record', 'Disable backups'], 'DMS can replicate changes and support a controlled migration cutover.', 'A one-time copy creates a long outage window and the other choices are unrelated.'),
        t('must replace a self-managed cache with a managed service. Which factor is most important?', 'Required data structures, latency, durability, and failover behavior', ['The shortest service name', 'The number of IAM users', 'The S3 bucket region only'], 'Cache selection should match workload behavior and resilience requirements.', 'The other factors do not determine cache suitability.'),
      ] },
      { id: 4, name: 'Accelerate Workload Migration and Modernization', weight: 0.20, tasks: ['Accelerate workload migration and modernization'], topics: [
        t('needs to discover on-premises application dependencies before migration. Which service should be evaluated?', 'AWS Application Discovery Service', ['Amazon CloudFront', 'AWS WAF', 'Amazon Cognito'], 'Application Discovery collects utilization and dependency information for migration planning.', 'The other choices provide delivery, filtering, or application identity.'),
        t('must migrate servers to AWS with minimal changes before later modernization. Which service is appropriate?', 'AWS Application Migration Service', ['AWS Glue', 'Amazon Route 53', 'Amazon EFS only'], 'Application Migration Service replicates servers for lift-and-shift migration.', 'The other choices provide ETL, DNS, or file storage.'),
        t('needs to modernize a monolith into event-driven components gradually. Which approach is sensible?', 'Strangler-style incremental decomposition with APIs and events', ['Rewrite everything before testing', 'Share a root credential', 'Disable observability'], 'Incremental decomposition limits migration risk and permits controlled validation.', 'A big-bang rewrite and missing telemetry increase risk.'),
        t('must move large archives to S3 when network bandwidth is constrained. Which service fits?', 'AWS Snowball Edge', ['Amazon Cognito', 'AWS WAF', 'Amazon API Gateway'], 'Snowball Edge supports offline bulk data transfer when network upload is impractical.', 'The other choices do not transfer offline archives.'),
        t('needs to run a legacy database temporarily while a managed database migration is prepared. Which principle applies?', 'Separate migration phases and define an explicit decommission plan', ['Run both systems forever without reconciliation', 'Delete the source immediately', 'Ignore data validation'], 'Phased migration with reconciliation and decommission criteria reduces operational and data risk.', 'The other choices create permanent drift or data loss.'),
      ] },
    ],
  },
  'ans-c01': {
    totalTarget: 195,
    domains: [
      { id: 1, name: 'Network Design', weight: 0.30, tasks: ['Design hybrid and cloud network architectures'], topics: [
        t('needs centralized routing between dozens of VPCs and on-premises networks. Which design fits?', 'AWS Transit Gateway with route domains', ['A full mesh of public IPs', 'An S3 website', 'A single security group'], 'Transit Gateway provides scalable centralized routing for many network attachments.', 'Public IP meshes and security groups do not provide centralized private routing.'),
        t('must connect a data center to AWS with predictable private bandwidth. Which service should be evaluated?', 'AWS Direct Connect', ['Amazon CloudFront', 'Amazon Cognito', 'AWS WAF'], 'Direct Connect provides a dedicated connection from an on-premises location to AWS.', 'The other choices provide delivery, identity, or web filtering.'),
        t('needs low-latency global routing to healthy regional endpoints with static addresses. Which service fits?', 'AWS Global Accelerator', ['Route 53 TXT records only', 'S3 Transfer Acceleration', 'An EBS volume'], 'Global Accelerator provides static anycast addresses and health-aware routing over the AWS network.', 'The other choices do not provide global application routing.'),
        t('must design IPv6 egress from private subnets without allowing inbound internet initiation. Which component is appropriate?', 'An egress-only internet gateway', ['A public IPv4 address on every host', 'A public S3 bucket', 'A Route 53 TXT record'], 'An egress-only internet gateway supports outbound IPv6 traffic while blocking unsolicited inbound connections.', 'Public addresses and buckets do not provide the required IPv6 egress boundary.'),
        t('needs an architecture that keeps provider and consumer VPC address spaces independent. Which service should be evaluated?', 'AWS PrivateLink', ['VPC peering only', 'A public load balancer', 'A NAT gateway'], 'PrivateLink exposes a service through endpoint interfaces without routing consumer VPCs together.', 'Peering and public load balancers create different connectivity and isolation tradeoffs.'),
      ] },
      { id: 2, name: 'Network Implementation', weight: 0.26, tasks: ['Implement AWS and hybrid network connectivity'], topics: [
        t('must advertise selected VPC prefixes to an on-premises router over a private connection. Which protocol is commonly used?', 'BGP over a Direct Connect or VPN connection', ['HTTP over CloudFront', 'DNS TXT records', 'S3 lifecycle rules'], 'BGP exchanges routes over supported hybrid connectivity links.', 'The other choices are application, DNS, or storage controls.'),
        t('needs encrypted connectivity between two networks over the public internet. Which service should be configured?', 'AWS Site-to-Site VPN', ['Amazon EFS', 'AWS Glue', 'Amazon Macie'], 'Site-to-Site VPN creates encrypted tunnels between networks.', 'The other choices provide file storage, ETL, or data discovery.'),
        t('must expose a private application to selected customer VPCs without VPC peering. Which feature fits?', 'A PrivateLink endpoint service', ['A public IP allowlist only', 'An S3 website endpoint', 'A single NAT gateway'], 'PrivateLink uses interface endpoints and provider endpoint services for private consumer access.', 'The other choices do not provide private service endpoints.'),
        t('needs to preserve source IP information through a load balancer for an application. Which design detail must be considered?', 'The load balancer type and the relevant proxy or header behavior', ['An S3 storage class', 'A KMS alias', 'A Route 53 TTL only'], 'Source address preservation depends on load balancer behavior and application headers or protocol support.', 'The other choices do not control load balancer source information.'),
        t('must automate VPC and route configuration consistently across accounts. Which approach is appropriate?', 'Infrastructure as code with CloudFormation or the AWS CDK', ['Manual edits in every account', 'Public credentials', 'A CloudFront cache'], 'IaC makes network changes repeatable, reviewable, and consistent.', 'Manual edits and public credentials increase drift and risk.'),
      ] },
      { id: 3, name: 'Network Management and Operation', weight: 0.20, tasks: ['Operate and troubleshoot network architectures'], topics: [
        t('needs to investigate rejected packets between two VPC subnets. Which evidence should be collected?', 'VPC Flow Logs and route and security group configuration', ['S3 object tags only', 'A CloudFront cache key only', 'An IAM username'], 'Flow Logs combined with routing and security controls identify where traffic is rejected.', 'The other choices do not describe network packet decisions.'),
        t('must monitor the health of network paths and trigger alerts on latency. Which service combination fits?', 'CloudWatch metrics and appropriate network probes', ['An S3 lifecycle rule', 'AWS Artifact only', 'A DynamoDB table name'], 'CloudWatch metrics and probes provide ongoing network health visibility.', 'The other choices do not monitor network paths.'),
        t('needs to reduce DNS query latency for users in several Regions. Which Route 53 policy should be evaluated?', 'Latency-based routing', ['Simple routing with one endpoint', 'An EBS snapshot', 'A KMS grant'], 'Latency-based routing directs DNS responses based on measured network latency.', 'The other choices do not optimize DNS endpoint selection.'),
        t('must troubleshoot intermittent CloudFront stale content after an origin update. Which action should be considered?', 'Review cache policy and invalidate affected paths when necessary', ['Delete the origin database', 'Disable TLS', 'Open all security group ports'], 'Cache policy and targeted invalidation address stale content without changing unrelated security controls.', 'The other choices increase risk or do not affect CloudFront cache freshness.'),
        t('needs operational runbooks for repeated network changes. Which service should store executable procedures?', 'Systems Manager Automation', ['Amazon SES', 'Amazon EFS', 'S3 Glacier only'], 'Systems Manager Automation runbooks can execute repeatable operational tasks.', 'The other choices do not provide network automation runbooks.'),
      ] },
      { id: 4, name: 'Network Security, Compliance, and Governance', weight: 0.24, tasks: ['Secure networks and enforce governance'], topics: [
        t('must block known malicious domains for workloads in a VPC. Which feature should be evaluated?', 'Route 53 Resolver DNS Firewall', ['An S3 lifecycle rule', 'A KMS alias', 'A CloudWatch dashboard'], 'DNS Firewall can block or allow domain queries for VPC workloads.', 'The other choices do not filter DNS requests.'),
        t('needs layer 3 and layer 4 stateful inspection between network segments. Which service fits?', 'AWS Network Firewall', ['Amazon Cognito', 'Amazon Athena', 'AWS Budgets'], 'Network Firewall provides managed stateful network traffic inspection.', 'The other choices provide identity, SQL queries, or cost monitoring.'),
        t('must protect internet-facing applications from DDoS attacks and apply request filtering. Which combination is appropriate?', 'AWS Shield and AWS WAF', ['An EBS volume and S3 lifecycle rule', 'A public root key', 'A Route 53 TXT record only'], 'Shield provides DDoS protection and WAF filters HTTP requests with managed or custom rules.', 'Storage and DNS records do not provide layered web protection.'),
        t('needs to prove that network changes were made by authorized principals. Which services provide useful evidence?', 'CloudTrail and configuration history', ['A public dashboard only', 'A DNS cache entry', 'An EBS volume name'], 'CloudTrail and configuration history provide API and resource-change evidence.', 'The other choices do not establish an audit trail.'),
        t('must enforce network and service guardrails across accounts. Which organization control should be used?', 'SCPs combined with centralized policy and security services', ['One local security group only', 'Public network paths', 'Manual console notes'], 'Organization guardrails and centralized policy reduce inconsistent network governance.', 'Local or manual-only controls do not scale across accounts.'),
      ] },
    ],
  },
  'scs-c03': {
    totalTarget: 195,
    domains: [
      { id: 1, name: 'Detection', weight: 0.16, tasks: ['Detect security events and vulnerabilities'], topics: [
        t('needs managed threat detection using AWS account and network telemetry. Which service should be enabled?', 'Amazon GuardDuty', ['Amazon EFS', 'AWS Glue', 'Amazon CloudFront'], 'GuardDuty analyzes supported telemetry and produces security findings.', 'The other choices provide file storage, ETL, or content delivery.'),
        t('must aggregate security findings across accounts and Regions. Which service should be evaluated?', 'AWS Security Hub', ['Amazon Route 53', 'AWS Batch', 'Amazon RDS'], 'Security Hub centralizes and normalizes findings from supported security services.', 'The other choices provide DNS, batch compute, or databases.'),
        t('needs to identify sensitive data in S3 that could increase incident impact. Which service fits?', 'Amazon Macie', ['AWS WAF', 'Amazon EBS', 'AWS Certificate Manager'], 'Macie discovers sensitive data such as PII in S3 and reports findings.', 'The other choices provide web filtering, block storage, or certificates.'),
        t('must scan EC2 and container artifacts for known vulnerabilities. Which service should be used?', 'Amazon Inspector', ['Amazon Cognito', 'AWS CloudFormation', 'Amazon SES'], 'Inspector assesses supported workloads and images for vulnerabilities.', 'The other choices provide identity, infrastructure as code, or email.'),
        t('needs audit records for security API activity. Which service should be configured?', 'AWS CloudTrail', ['Amazon EFS', 'AWS Budgets', 'Amazon ElastiCache'], 'CloudTrail records API activity for investigation and compliance.', 'The other choices provide storage, cost monitoring, or caching.'),
      ] },
      { id: 2, name: 'Incident Response', weight: 0.14, tasks: ['Respond to security incidents'], topics: [
        t('must isolate a compromised EC2 instance while preserving evidence. Which first action is appropriate?', 'Restrict its network access and preserve snapshots and logs', ['Terminate it without evidence', 'Open all ports', 'Delete CloudTrail'], 'Isolation limits further access while evidence is preserved for investigation.', 'The other choices destroy evidence or increase exposure.'),
        t('needs a repeatable response to a GuardDuty finding. Which service should run the procedure?', 'Systems Manager Automation', ['Amazon CloudFront', 'AWS Route 53', 'Amazon Athena only'], 'Automation runbooks can execute controlled response actions for findings.', 'The other choices do not provide incident response procedures.'),
        t('must coordinate human approval before disabling a production role during an incident. Which workflow fits?', 'A Step Functions workflow with an approval step', ['An uncontrolled Lambda loop', 'A public S3 object', 'A DNS TXT record'], 'A durable workflow can pause for approval and record the decision.', 'The other choices do not coordinate an auditable approval.'),
        t('needs to retain incident logs in a tamper-resistant archive. Which design should be used?', 'A dedicated encrypted S3 log bucket with restricted access and retention controls', ['A developer laptop', 'An instance store volume', 'A public bucket'], 'A protected central archive supports investigation and retention requirements.', 'Local, ephemeral, or public storage is not an incident archive.'),
        t('must determine the timeline of unauthorized API calls. Which evidence is most useful?', 'CloudTrail events correlated with identity and resource logs', ['Only CPU utilization', 'A Route 53 TTL', 'An S3 storage class'], 'Correlated API, identity, and resource logs establish who did what and when.', 'The other choices do not provide an incident timeline.'),
      ] },
      { id: 3, name: 'Infrastructure Security', weight: 0.18, tasks: ['Secure network and compute infrastructure'], topics: [
        t('needs layer 7 filtering for a public API. Which service should be configured?', 'AWS WAF', ['Amazon Macie', 'AWS Glue', 'Amazon EBS'], 'WAF evaluates HTTP requests and can block managed web exploits and custom patterns.', 'The other choices discover data, transform data, or store blocks.'),
        t('must protect a private subnet workload from unsolicited inbound traffic while allowing updates. Which design fits?', 'Private subnets with controlled egress through a NAT gateway or endpoint', ['Public addresses on every instance', 'An open security group', 'A public bucket'], 'Private subnets and controlled egress reduce inbound exposure while allowing required outbound access.', 'Public addresses and open rules increase exposure.'),
        t('needs centralized inspection between VPCs. Which service should be evaluated?', 'AWS Network Firewall or a managed inspection VPC pattern', ['Amazon SES', 'Amazon Polly', 'AWS Budgets'], 'Network Firewall and inspection VPC patterns provide centralized traffic controls.', 'The other choices do not inspect network traffic.'),
        t('must protect container images from tampering before deployment. Which control is appropriate?', 'ECR image scanning and signed, immutable image tags', ['Public mutable tags only', 'Disable scan results', 'Store images in a public website'], 'Scanning and immutability reduce supply-chain tampering and vulnerability risk.', 'Mutable public tags and disabled scanning reduce assurance.'),
        t('needs host access without inbound SSH ports. Which operational security service should be used?', 'Systems Manager Session Manager', ['A public bastion with a shared key', 'An open security group', 'A Route 53 record'], 'Session Manager provides audited access through the agent and IAM authorization.', 'Shared keys and open ports increase attack surface.'),
      ] },
      { id: 4, name: 'Identity and Access Management', weight: 0.20, tasks: ['Manage identity and authorization at scale'], topics: [
        t('must grant an application only the S3 actions it needs. Which principle should guide the policy?', 'Least privilege with resource and condition scoping', ['AdministratorAccess for convenience', 'Public access', 'A shared root key'], 'Least privilege limits actions, resources, and conditions to the application requirement.', 'Broad or shared credentials increase blast radius.'),
        t('needs workforce users to access several AWS accounts with centrally managed assignments. Which service fits?', 'IAM Identity Center', ['Cognito user pools only', 'An S3 ACL', 'A VPC route table'], 'IAM Identity Center manages workforce identity and permission sets across accounts.', 'The other choices do not provide centralized workforce access.'),
        t('must detect resource policies that allow access outside the organization. Which tool should be used?', 'IAM Access Analyzer', ['Amazon CloudFront', 'AWS Batch', 'AWS Backup'], 'Access Analyzer identifies unintended external access in supported resource policies.', 'The other choices provide delivery, compute, or backup.'),
        t('needs temporary credentials for an EC2 application. Which configuration is preferred?', 'An IAM role attached through an instance profile', ['A long-lived access key in the AMI', 'A root key in user data', 'A public bucket'], 'Instance profiles provide temporary role credentials without embedding long-lived keys.', 'Embedded or public credentials are unsafe.'),
        t('must restrict a delegated administrator from granting permissions beyond an approved set. Which feature fits?', 'An IAM permission boundary', ['An S3 lifecycle rule', 'A CloudFront cache', 'A Route 53 health check'], 'Permission boundaries cap the maximum permissions an identity can receive.', 'The other choices do not constrain IAM delegation.'),
      ] },
      { id: 5, name: 'Data Protection', weight: 0.18, tasks: ['Protect data at rest and in transit'], topics: [
        t('needs customer-controlled encryption policies and audit events for S3 data. Which option should be selected?', 'SSE-KMS with a customer managed key', ['Plaintext objects', 'SSE-S3 only when key policy control is required', 'A DNS record'], 'SSE-KMS with a customer managed key provides key policy control and KMS audit events.', 'Plaintext and unrelated controls do not protect or govern the data.'),
        t('must prevent deletion of compliance records until a retention date. Which S3 feature fits?', 'S3 Object Lock in compliance mode', ['S3 Transfer Acceleration', 'A security group', 'A Route 53 alias'], 'Object Lock compliance mode enforces retention against deletion and overwrite.', 'The other choices do not enforce object retention.'),
        t('needs to keep database credentials out of source and rotate them automatically. Which service fits?', 'AWS Secrets Manager', ['An S3 website', 'A CloudFront distribution', 'An EBS snapshot'], 'Secrets Manager stores and rotates credentials and supports runtime retrieval.', 'The other choices do not manage application secrets.'),
        t('must protect data in transit to a public API. Which configuration is appropriate?', 'TLS with a managed certificate and strict security policies', ['HTTP only', 'An unencrypted public endpoint', 'A bucket lifecycle rule'], 'TLS protects data in transit and certificate management supports trusted endpoints.', 'HTTP and unrelated storage controls do not protect transport.'),
        t('needs to discover PII before sharing a data set with another account. Which service should be evaluated?', 'Amazon Macie', ['Amazon Inspector', 'AWS Shield', 'Amazon EFS'], 'Macie discovers sensitive data in S3 and can inform remediation before sharing.', 'The other choices assess vulnerabilities, DDoS, or file storage.'),
      ] },
      { id: 6, name: 'Security Foundations and Governance', weight: 0.14, tasks: ['Apply governance, risk, and compliance foundations'], topics: [
        t('must align security controls with the AWS shared responsibility model. Which practice is correct?', 'Identify AWS-managed responsibilities and customer cloud-configuration responsibilities separately', ['Assume AWS secures every customer setting', 'Assume the customer patches managed service hardware', 'Disable all controls'], 'The shared responsibility model separates cloud infrastructure duties from customer configuration and data duties.', 'The other choices misunderstand the model.'),
        t('needs continuous evidence that resources comply with a baseline. Which service should be used?', 'AWS Config conformance packs', ['Amazon CloudFront', 'Amazon EFS', 'Amazon SES'], 'Conformance packs bundle Config rules and remediation guidance for a baseline.', 'The other choices do not evaluate resource compliance.'),
        t('must centralize security findings and prioritize high-risk issues. Which service should be evaluated?', 'AWS Security Hub', ['AWS Budgets', 'Amazon Route 53', 'Amazon SQS'], 'Security Hub centralizes findings and provides standards and prioritization.', 'The other choices monitor cost, DNS, or messages.'),
        t('needs a formal report of AWS compliance certifications and attestations. Which service provides AWS reports?', 'AWS Artifact', ['Amazon GuardDuty', 'AWS WAF', 'Amazon RDS'], 'Artifact provides on-demand access to AWS compliance documents and agreements.', 'The other choices detect threats, filter web requests, or host databases.'),
        t('must protect the organization root user from routine misuse. Which practice is appropriate?', 'Use the root user only when required and enable MFA', ['Use root for daily work', 'Share root keys with developers', 'Disable all audit logging'], 'Root-use restrictions and MFA reduce the highest-impact credential risk.', 'Routine root use and shared keys increase risk.'),
      ] },
    ],
  },
}

const LEVELS = {
  'soa-c03': 'associate',
  'dea-c01': 'associate',
  'dva-c02': 'associate',
  'mla-c01': 'associate',
  'dop-c02': 'professional',
  'aip-c01': 'professional',
  'sap-c02': 'professional',
  'ans-c01': 'specialty',
  'scs-c03': 'specialty',
}

const difficultyContexts = {
  associate: [
    'The change affects a production workload, so existing application behavior must be preserved and the team prefers a managed AWS capability with low operational overhead.',
    'The team has confirmed the requirement with workload owners and must make a targeted change without redesigning unrelated components.',
    'The implementation must be repeatable, observable after deployment, and suitable for normal production support procedures.',
    'The workload already follows AWS security best practices, and the team wants the option that most directly satisfies the stated technical requirement.',
    'The team must avoid a prolonged outage and will validate the selected capability in a staging environment before a controlled production rollout.',
  ],
  professional: [
    'The environment spans multiple AWS accounts and supports business-critical workloads. The design must preserve delegated ownership, remain auditable, and minimize custom operational processes.',
    'A phased production rollout is required. The selected approach must support centralized governance, clear rollback procedures, and continued workload availability.',
    'Several application teams share the platform. The organization requires a repeatable managed solution that limits blast radius and does not depend on manual coordination.',
    'The architecture review prioritizes least privilege, measurable operational outcomes, and predictable recovery while existing services remain available.',
    'The organization needs to standardize the capability across workloads while allowing teams to retain day-to-day ownership of their applications.',
  ],
  specialty: [
    'The production environment uses centralized governance across several accounts. Changes must be least-privilege, auditable, and introduced without an extended outage.',
    'The team must account for hybrid connectivity, existing security boundaries, and operational troubleshooting after the change is deployed.',
    'The requirement applies at scale. The solution must avoid one-off manual configuration and provide evidence that the intended control remains effective.',
    'The current architecture is business critical. The selected option must address the exact failure or security condition without weakening another control.',
    'The implementation will be reviewed by specialist engineers for service limits, failure behavior, and the operational tradeoffs of the proposed design.',
  ],
}

const integratedTradeoffs = [
  {
    en: 'The design must keep recurring cost proportional to use, enforce least privilege, and remain available during a component or Availability Zone failure.',
    zh: '此設計必須讓持續成本與實際用量相符、落實最低權限，並在元件或可用區域發生故障時維持可用。',
  },
  {
    en: 'The design must avoid unnecessary standby cost without weakening security controls or the availability objective.',
    zh: '此設計必須避免不必要的備用成本，同時不可削弱安全控制或可用性目標。',
  },
  {
    en: 'The organization will accept additional managed-service cost only when it measurably improves security and availability with less operational effort.',
    zh: '只有在託管服務能以較低營運負擔明確改善安全性與可用性時，組織才會接受額外成本。',
  },
  {
    en: 'The architecture must limit blast radius, preserve availability during change, and control cost through automation instead of permanent overprovisioning.',
    zh: '此架構必須限制影響範圍、在變更期間維持可用性，並透過自動化控制成本，而不是長期過度佈建。',
  },
  {
    en: 'The selected controls must provide auditable security, predictable availability, and the lowest operational cost that still satisfies both requirements.',
    zh: '所選控制必須提供可稽核的安全性、可預測的可用性，以及在滿足兩項要求前提下最低的營運成本。',
  },
]

function requirementFromPrompt(prompt) {
  return prompt
    .replace(/\s+(?:Which|What)\s+.*$/i, '')
    .replace(/[?.]+$/, '')
    .trim()
}

function rotate(values, offset) {
  const distance = offset % values.length
  return [...values.slice(distance), ...values.slice(0, distance)]
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

function questionType(question) {
  return question.type ?? (question.isMultiAnswer ? 'multi' : 'single')
}

function questionIndex(question) {
  return Number(question.id.match(/-(\d+)$/)?.[1] ?? 0)
}

function correctValues(question) {
  if (questionType(question) === 'matching') {
    return Object.values(question.correctMatches ?? {})
      .map(key => question.targets?.[key])
      .filter(Boolean)
  }
  const keys = Array.isArray(question.answer) ? question.answer : [question.answer]
  return keys.map(key => question.options?.[key]).filter(Boolean)
}

function finalRequirementSentence(value) {
  const sentences = value
    .split('。')
    .map(sentence => sentence.trim())
    .filter(Boolean)
  if (sentences.length >= 2) return `${sentences.at(-2)}。`
  return value.trim()
}

function translatedRequirementsFromMulti(value) {
  const firstMarker = '第一項需求：'
  const secondMarker = '第二項需求：'
  const questionMarkers = ['哪兩項操作', '哪兩個動作', '哪兩項行動', '應選擇哪兩項']
  const firstStart = value.indexOf(firstMarker)
  const secondStart = value.indexOf(secondMarker)
  if (firstStart < 0 || secondStart < 0) return []
  const questionStart = questionMarkers
    .map(marker => value.indexOf(marker, secondStart))
    .filter(index => index >= 0)
    .sort((left, right) => left - right)[0] ?? value.length
  return [
    value.slice(firstStart + firstMarker.length, secondStart).trim(),
    value.slice(secondStart + secondMarker.length, questionStart).trim(),
  ]
}

function loadTranslationMemory(config, certDir) {
  const questionsById = new Map()
  const optionZh = new Map()
  const requirementZh = new Map()
  const rationaleZh = new Map()

  if (!existsSync(certDir)) return { questionsById, optionZh, requirementZh, rationaleZh }

  const domainFiles = readdirSync(certDir).filter(file => /^domain\d+\.json$/.test(file)).sort()
  for (const file of domainFiles) {
    const domainId = Number(file.match(/domain(\d+)/)?.[1])
    const domain = config.domains.find(candidate => candidate.id === domainId)
    if (!domain) continue
    const questions = JSON.parse(readFileSync(join(certDir, file), 'utf8'))

    for (const question of questions) {
      questionsById.set(question.id, question)
      const zh = question.translations?.zh
      if (!zh) continue
      for (const [key, value] of Object.entries(question.options ?? {})) {
        if (value && zh.options?.[key]) optionZh.set(value, zh.options[key])
      }
      for (const [key, value] of Object.entries(question.targets ?? {})) {
        if (value && zh.targets?.[key]) optionZh.set(value, zh.targets[key])
      }

      const index = questionIndex(question)
      const topicIndex = (index - 1) % domain.topics.length
      const type = questionType(question)
      if (type === 'single') {
        const topic = domain.topics[topicIndex]
        requirementZh.set(topic.correct, finalRequirementSentence(zh.question))
        rationaleZh.set(topic.correct, zh.explanation.split('\n')[0])
      } else if (type === 'multi') {
        const requirements = translatedRequirementsFromMulti(zh.question)
        const topics = [domain.topics[topicIndex], domain.topics[(topicIndex + 1) % domain.topics.length]]
        topics.forEach((topic, offset) => {
          if (requirements[offset]) requirementZh.set(topic.correct, requirements[offset])
        })
      } else if (type === 'matching') {
        for (const [optionKey, targetKey] of Object.entries(question.correctMatches ?? {})) {
          const correct = question.targets?.[targetKey]
          const requirement = zh.options?.[optionKey]
          if (correct && requirement) requirementZh.set(correct, requirement.replace(/^工作負載\s*/, '').trim())
        }
      }

      const values = correctValues(question)
      if (values.length === 1 && !rationaleZh.has(values[0])) {
        rationaleZh.set(values[0], zh.explanation.split('\n')[0])
      }
    }
  }

  return { questionsById, optionZh, requirementZh, rationaleZh }
}

function translatedOption(memory, value) {
  return memory.optionZh.get(value) ?? value
}

function translatedRequirement(memory, topic) {
  return memory.requirementZh.get(topic.correct)
    ?? `工作負載需要符合與 ${translatedOption(memory, topic.correct)} 相關的生產要求。`
}

function preserveExistingTranslation(question, memory) {
  const existing = memory.questionsById.get(question.id)
  if (!existing?.translations) return question
  const sameEnglish = existing.question === question.question
    && existing.explanation === question.explanation
    && JSON.stringify(existing.options) === JSON.stringify(question.options)
    && JSON.stringify(existing.targets ?? null) === JSON.stringify(question.targets ?? null)
  return sameEnglish ? { ...question, translations: existing.translations } : question
}

function taskFor(domain, index) {
  return `${domain.id}.${((index - 1) % domain.tasks.length) + 1}`
}

function contextFor(config, domain, index) {
  const level = LEVELS[config.code]
  const contexts = difficultyContexts[level]
  const variant = Math.floor((index - 1) / domain.topics.length)
  return contexts[(variant + domain.id - 1) % contexts.length]
}

function topicAlternatives(domain, topicIndex, excluded = []) {
  const orderedTopics = rotate(domain.topics, topicIndex + 1)
  return uniqueValues([
    ...orderedTopics.map(topic => topic.correct),
    ...domain.topics[topicIndex].distractors,
  ]).filter(value => !excluded.includes(value))
}

function choiceRecord(entries, offset) {
  const shuffled = rotate(entries, offset)
  const keys = ['A', 'B', 'C', 'D', 'E'].slice(0, shuffled.length)
  const options = Object.fromEntries(keys.map((key, index) => [key, shuffled[index].value]))
  const answers = keys.filter((_, index) => shuffled[index].correct)
  return { options, answers }
}

function baseQuestion(config, domain, index) {
  return {
    id: `${config.code}-d${domain.id}-${String(index).padStart(3, '0')}`,
    taskStatement: taskFor(domain, index),
    lastVerified: VERIFIED,
  }
}

function buildSingleQuestion(config, domain, index, topicIndex) {
  const topic = domain.topics[topicIndex]
  const frame = frames[(index - 1) % frames.length]
  const alternatives = topicAlternatives(domain, topicIndex, [topic.correct]).slice(0, 3)
  const entries = [
    { value: topic.correct, correct: true },
    ...alternatives.map(value => ({ value, correct: false })),
  ]
  const { options, answers } = choiceRecord(entries, index + domain.id + config.code.length)

  return {
    ...baseQuestion(config, domain, index),
    type: 'single',
    question: `${frame} is reviewing a production decision. ${contextFor(config, domain, index)} The team ${topic.prompt}`,
    options,
    answer: answers[0],
    isMultiAnswer: false,
    explanation: `${topic.reason}\nThe alternatives are valid for other requirements in this domain, but they do not directly provide ${topic.correct} for the stated scenario.`,
  }
}

function buildMultiQuestion(config, domain, index, topicIndex) {
  const first = domain.topics[topicIndex]
  const secondIndex = (topicIndex + 1) % domain.topics.length
  const second = domain.topics[secondIndex]
  const frame = frames[(index - 1) % frames.length]
  const correct = uniqueValues([first.correct, second.correct])
  const alternatives = topicAlternatives(domain, secondIndex, correct).slice(0, 5 - correct.length)
  const entries = [
    ...correct.map(value => ({ value, correct: true })),
    ...alternatives.map(value => ({ value, correct: false })),
  ]
  const { options, answers } = choiceRecord(entries, index + domain.id)

  return {
    ...baseQuestion(config, domain, index),
    type: 'multi',
    question: `${frame} is planning two independent production changes. ${contextFor(config, domain, index)} The first team ${requirementFromPrompt(first.prompt)}. A second team ${requirementFromPrompt(second.prompt)}. Which TWO actions satisfy these requirements?`,
    options,
    answer: answers,
    isMultiAnswer: true,
    explanation: `${first.correct} meets the first requirement: ${first.reason} ${second.correct} meets the second requirement: ${second.reason}\nThe remaining options address different capabilities and do not satisfy either stated requirement as directly.`,
  }
}

function integratedTopics(config, domain, index, count) {
  const primaryIndex = (index - 1) % domain.topics.length
  const selected = [{ domain, topic: domain.topics[primaryIndex] }]
  const domainIndex = config.domains.indexOf(domain)
  const variant = Math.floor((index - 1) / 4)

  for (let offset = 1; selected.length < count && offset <= config.domains.length * 3; offset += 1) {
    const candidateDomain = config.domains[(domainIndex + offset + variant) % config.domains.length]
    const candidateTopic = candidateDomain.topics[(primaryIndex + variant + offset) % candidateDomain.topics.length]
    if (!selected.some(item => item.topic.correct === candidateTopic.correct)) {
      selected.push({ domain: candidateDomain, topic: candidateTopic })
    }
  }

  if (selected.length < count) {
    for (const candidateDomain of config.domains) {
      for (const candidateTopic of candidateDomain.topics) {
        if (!selected.some(item => item.topic.correct === candidateTopic.correct)) {
          selected.push({ domain: candidateDomain, topic: candidateTopic })
        }
        if (selected.length === count) return selected
      }
    }
  }
  return selected
}

function integratedAlternatives(config, selected, count) {
  const correct = selected.map(item => item.topic.correct)
  const pool = []
  for (const candidateDomain of config.domains) {
    pool.push(...candidateDomain.topics.map(topic => topic.correct))
  }
  pool.push(...selected.flatMap(item => item.topic.distractors))
  return uniqueValues(pool).filter(value => !correct.includes(value)).slice(0, count)
}

function buildIntegratedQuestion(config, domain, index, memory) {
  const selected = integratedTopics(config, domain, index, 2)
  const [first, second] = selected.map(item => item.topic)
  const frame = frames[(index - 1) % frames.length]
  const tradeoff = integratedTradeoffs[Math.floor((index - 1) / 4) % integratedTradeoffs.length]
  const alternatives = integratedAlternatives(config, selected, 3)
  const plans = [
    {
      value: `Use ${first.correct} for the primary requirement and integrate it with ${second.correct} for the connected control`,
      zh: `以${translatedOption(memory, first.correct)}處理主要需求，並整合${translatedOption(memory, second.correct)}作為相連控制`,
      correct: true,
    },
    {
      value: `Use ${first.correct} but replace the connected control with ${alternatives[0]}`,
      zh: `使用${translatedOption(memory, first.correct)}，但以${translatedOption(memory, alternatives[0])}取代相連控制`,
      correct: false,
    },
    {
      value: `Use ${alternatives[1]} for the primary requirement and integrate it with ${second.correct}`,
      zh: `以${translatedOption(memory, alternatives[1])}處理主要需求，並整合${translatedOption(memory, second.correct)}`,
      correct: false,
    },
    {
      value: `Combine ${alternatives[1]} with ${alternatives[2]} as a single platform design`,
      zh: `把${translatedOption(memory, alternatives[1])}與${translatedOption(memory, alternatives[2])}結合為單一平台設計`,
      correct: false,
    },
  ]
  const { options, answers } = choiceRecord(plans, index + domain.id + config.code.length)
  const zhByValue = new Map(plans.map(plan => [plan.value, plan.zh]))
  const question = `${frame} is redesigning one integrated end-to-end architecture. ${contextFor(config, domain, index)} ${tradeoff.en} The workload ${requirementFromPrompt(first.prompt)}, and the same architecture ${requirementFromPrompt(second.prompt)}. Both capabilities must work together because failure of either prevents the required business outcome. Which architecture best meets these requirements?`
  const explanation = `${first.correct} satisfies the first part of the architecture: ${first.reason} ${second.correct} satisfies the connected requirement: ${second.reason}\nThe remaining options can be useful in other designs, but they do not satisfy both connected requirements with the stated cost, security, and availability tradeoffs.`
  const zhOptions = Object.fromEntries(Object.entries(options).map(([key, value]) => [key, zhByValue.get(value)]))
  const firstZh = translatedOption(memory, first.correct)
  const secondZh = translatedOption(memory, second.correct)

  return {
    ...baseQuestion(config, domain, index),
    type: 'single',
    question,
    options,
    answer: answers[0],
    isMultiAnswer: false,
    explanation,
    translations: {
      zh: {
        question: `某企業正在重新設計一個整合式端到端生產架構。兩項能力必須共同運作，任一項失效都會影響業務成果。第一項需求：${translatedRequirement(memory, first)} 第二項需求：${translatedRequirement(memory, second)} ${tradeoff.zh} 哪一個架構最符合這些要求？`,
        options: zhOptions,
        explanation: `${firstZh} 負責架構的第一項需求，${secondZh} 負責相連的第二項需求。兩者必須在同一個端到端設計中共同運作。\n其餘選項可能適用於其他設計，但無法在指定的成本、安全性及可用性取捨下同時滿足這兩項相連需求。`,
      },
    },
  }
}

function buildIntegratedMatchingQuestion(config, domain, index, memory) {
  const selected = integratedTopics(config, domain, index, 3)
  const frame = frames[(index - 1) % frames.length]
  const tradeoff = integratedTradeoffs[Math.floor((index - 1) / 4) % integratedTradeoffs.length]
  const targetEntries = rotate(selected.map(item => item.topic.correct), index + domain.id)
  const targetKeys = ['1', '2', '3']
  const targets = Object.fromEntries(targetKeys.map((key, offset) => [key, targetEntries[offset]]))
  const optionKeys = ['A', 'B', 'C']
  const options = Object.fromEntries(optionKeys.map((key, offset) => [
    key,
    `Stage ${offset + 1}: The architecture ${requirementFromPrompt(selected[offset].topic.prompt)}`,
  ]))
  const correctMatches = Object.fromEntries(optionKeys.map((key, offset) => [
    key,
    targetKeys[targetEntries.indexOf(selected[offset].topic.correct)],
  ]))
  const mappings = optionKeys.map((key, offset) => `${key} maps to ${selected[offset].topic.correct}. ${selected[offset].topic.reason}`)
  const zhOptions = Object.fromEntries(optionKeys.map((key, offset) => [
    key,
    `階段 ${offset + 1}：${translatedRequirement(memory, selected[offset].topic)}`,
  ]))
  const zhTargets = Object.fromEntries(targetKeys.map((key, offset) => [key, translatedOption(memory, targetEntries[offset])]))
  const zhMappings = optionKeys.map((key, offset) => `${key} 應配對 ${translatedOption(memory, selected[offset].topic.correct)}`)

  return {
    ...baseQuestion(config, domain, index),
    type: 'matching',
    question: `${frame} is designing one integrated end-to-end network architecture across accounts and Regions. ${contextFor(config, domain, index)} ${tradeoff.en} Match each connected stage to the implementation that lets the complete architecture satisfy its business outcome.`,
    options,
    answer: '',
    isMultiAnswer: false,
    targets,
    correctMatches,
    explanation: `${mappings.join(' ')}\nAll three stages are connected. Substituting an unrelated target would break the architecture or weaken its cost, security, and availability tradeoffs.`,
    translations: {
      zh: {
        question: `某企業正在跨帳戶與區域設計一個整合式端到端網路架構。三個階段彼此相連，任一階段錯誤都會影響整體業務成果。${tradeoff.zh} 請把每個階段配對至最合適的實作。`,
        options: zhOptions,
        targets: zhTargets,
        explanation: `${zhMappings.join('；')}。三個實作共同組成完整架構。\n若以不相關的目標取代任何一項，便會破壞架構或削弱成本、安全性及可用性之間的取捨。`,
      },
    },
  }
}

function buildMatchingQuestion(config, domain, index, topicIndex) {
  const selected = [0, 1, 2].map(offset => domain.topics[(topicIndex + offset) % domain.topics.length])
  const frame = frames[(index - 1) % frames.length]
  const targetEntries = rotate(selected.map(topic => topic.correct), index + domain.id)
  const targetKeys = ['1', '2', '3']
  const targets = Object.fromEntries(targetKeys.map((key, offset) => [key, targetEntries[offset]]))
  const optionKeys = ['A', 'B', 'C']
  const options = Object.fromEntries(optionKeys.map((key, offset) => [
    key,
    `A workload ${requirementFromPrompt(selected[offset].prompt)}`,
  ]))
  const correctMatches = Object.fromEntries(optionKeys.map((key, offset) => [
    key,
    targetKeys[targetEntries.indexOf(selected[offset].correct)],
  ]))
  const mappings = optionKeys.map((key, offset) => `${key} maps to ${selected[offset].correct}. ${selected[offset].reason}`)

  return {
    ...baseQuestion(config, domain, index),
    type: 'matching',
    question: `${frame} is reviewing several independent production requirements. ${contextFor(config, domain, index)} Match each workload requirement to the most appropriate implementation.`,
    options,
    answer: '',
    isMultiAnswer: false,
    targets,
    correctMatches,
    explanation: `${mappings.join(' ')}\nEach target is intended for a different requirement, so all three mappings must be evaluated independently.`,
  }
}

function buildQuestion(config, domain, index, memory) {
  const topicIndex = (index - 1) % domain.topics.length
  const level = LEVELS[config.code]

  if ((level === 'professional' || level === 'specialty') && index % 4 === 0) {
    return config.code === 'ans-c01'
      ? buildIntegratedMatchingQuestion(config, domain, index, memory)
      : buildIntegratedQuestion(config, domain, index, memory)
  }

  if (config.code === 'ans-c01') {
    return buildMultiQuestion(config, domain, index, topicIndex)
  }
  if ((config.code === 'mla-c01' || config.code === 'scs-c03') && index % 17 === 0) {
    return buildMatchingQuestion(config, domain, index, topicIndex)
  }
  if (index % 7 === 0) return buildMultiQuestion(config, domain, index, topicIndex)
  return buildSingleQuestion(config, domain, index, topicIndex)
}

for (const [code, config] of Object.entries(catalogs)) {
  config.code = code
  const certDir = join(DATA_ROOT, code)
  const memory = loadTranslationMemory(config, certDir)
  mkdirSync(certDir, { recursive: true })
  const totalTarget = config.totalTarget
  const rawCounts = config.domains.map(domain => totalTarget * domain.weight)
  const counts = rawCounts.map(value => Math.floor(value))
  let remainder = totalTarget - counts.reduce((sum, value) => sum + value, 0)
  rawCounts
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ index }) => {
      if (remainder > 0) {
        counts[index] += 1
        remainder -= 1
      }
  })
  config.domains.forEach((domain, index) => {
    const questions = Array.from({ length: counts[index] }, (_, offset) => {
      const question = buildQuestion(config, domain, offset + 1, memory)
      return question.translations ? question : preserveExistingTranslation(question, memory)
    })
    writeFileSync(join(certDir, `domain${domain.id}.json`), `${JSON.stringify(questions, null, 2)}\n`)
  })
  console.log(`${config.code}: ${counts.join('/')} (${counts.reduce((sum, value) => sum + value, 0)} questions)`)
}
