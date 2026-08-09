export interface StudyComparisonItem {
  name: string
  purpose: string
  remember: string
  translations: {
    zh: {
      name: string
      purpose: string
      remember: string
    }
  }
}

export interface StudyComparison {
  id: string
  title: string
  summary: string
  sourceUrl?: string
  items: StudyComparisonItem[]
  translations: {
    zh: {
      title: string
      summary: string
    }
  }
}

export interface ExamKeywordHint {
  id: string
  phrase: string
  thinkOf: string
  reason: string
  translations: {
    zh: {
      phrase: string
      thinkOf: string
      reason: string
    }
  }
}

function comparisonItem(
  name: string,
  zhName: string,
  purpose: string,
  zhPurpose: string,
  remember: string,
  zhRemember: string,
): StudyComparisonItem {
  return { name, purpose, remember, translations: { zh: { name: zhName, purpose: zhPurpose, remember: zhRemember } } }
}

export const STUDY_COMPARISONS: StudyComparison[] = [
  {
    id: 'storage',
    title: 'Amazon S3 vs Amazon EBS vs Amazon EFS',
    summary: 'Choose storage by access model: object, block, or shared file storage.',
    sourceUrl: 'https://docs.aws.amazon.com/decision-guides/latest/storage-on-aws-how-to-choose/choosing-aws-storage-service.html',
    translations: { zh: { title: 'Amazon S3、Amazon EBS 與 Amazon EFS', summary: '按存取模式選擇物件、區塊或共用檔案儲存。' } },
    items: [
      comparisonItem('Amazon S3', 'Amazon S3', 'Object storage for files, backups, static assets, and data lakes.', '適用於檔案、備份、靜態資源與資料湖的物件儲存。', 'Access by API and object key, not as an EC2 disk.', '透過 API 與物件金鑰存取，不是 EC2 磁碟。'),
      comparisonItem('Amazon EBS', 'Amazon EBS', 'Persistent block volumes for EC2 and workloads needing low-latency disk access.', '為 EC2 與需要低延遲磁碟存取的工作負載提供持久區塊磁碟區。', 'Think virtual hard drive, normally tied to one Availability Zone.', '想成虛擬硬碟，通常位於單一可用區域。'),
      comparisonItem('Amazon EFS', 'Amazon EFS', 'Elastic shared Linux file storage mounted by multiple compute resources.', '可由多個運算資源掛載的彈性 Linux 共用檔案儲存。', 'Think shared NFS file system across multiple instances.', '想成可供多個執行個體共用的 NFS 檔案系統。'),
    ],
  },
  {
    id: 'messaging',
    title: 'Amazon SQS vs Amazon SNS vs Amazon EventBridge',
    summary: 'Separate queue buffering, pub/sub fanout, and rule-based event routing.',
    sourceUrl: 'https://docs.aws.amazon.com/decision-guides/latest/sns-or-sqs-or-eventbridge/sns-or-sqs-or-eventbridge.html',
    translations: { zh: { title: 'Amazon SQS、Amazon SNS 與 Amazon EventBridge', summary: '分辨訊息佇列、發佈訂閱扇出與規則式事件路由。' } },
    items: [
      comparisonItem('Amazon SQS', 'Amazon SQS', 'Durable queue for asynchronous work and buffering between producers and consumers.', '在生產者與消費者之間緩衝非同步工作的持久訊息佇列。', 'Consumers pull messages at their own rate.', '消費者按自己的速度拉取訊息。'),
      comparisonItem('Amazon SNS', 'Amazon SNS', 'Push-based pub/sub for sending one message to many subscribers.', '把一個訊息推送給多個訂閱者的發佈訂閱服務。', 'Think immediate fanout to queues, functions, HTTP, SMS, or email.', '想成即時扇出到佇列、函數、HTTP、SMS 或電郵。'),
      comparisonItem('Amazon EventBridge', 'Amazon EventBridge', 'Event bus that matches event content against rules and routes it to targets.', '根據規則比對事件內容並路由到目標的事件匯流排。', 'Think event-driven integration and advanced content filtering.', '想成事件驅動整合與進階內容篩選。'),
    ],
  },
  {
    id: 'observability',
    title: 'Amazon CloudWatch vs AWS CloudTrail vs AWS Config',
    summary: 'Separate operational monitoring, API auditing, and resource configuration compliance.',
    translations: { zh: { title: 'Amazon CloudWatch、AWS CloudTrail 與 AWS Config', summary: '分辨營運監控、API 稽核與資源設定合規。' } },
    items: [
      comparisonItem('Amazon CloudWatch', 'Amazon CloudWatch', 'Metrics, logs, alarms, dashboards, and operational visibility.', '提供指標、日誌、警示、儀表板與營運可見性。', 'Think performance and health right now.', '想成目前的效能與健康狀況。'),
      comparisonItem('AWS CloudTrail', 'AWS CloudTrail', 'Records account activity and API calls for audit history.', '記錄帳戶活動與 API 呼叫以提供稽核歷史。', 'Think who did what, when, and from where.', '想成誰在何時從何處做了什麼。'),
      comparisonItem('AWS Config', 'AWS Config', 'Tracks resource configurations and evaluates compliance rules.', '追蹤資源設定並評估合規規則。', 'Think what a resource configuration is or was.', '想成資源目前或過去的設定。'),
    ],
  },
  {
    id: 'security',
    title: 'AWS WAF vs AWS Shield vs Amazon GuardDuty',
    summary: 'Separate web request filtering, DDoS protection, and intelligent threat detection.',
    translations: { zh: { title: 'AWS WAF、AWS Shield 與 Amazon GuardDuty', summary: '分辨 Web 請求篩選、DDoS 防護與智能威脅偵測。' } },
    items: [
      comparisonItem('AWS WAF', 'AWS WAF', 'Filters HTTP and HTTPS requests using customizable web rules.', '使用可自訂 Web 規則篩選 HTTP 與 HTTPS 請求。', 'Think SQL injection, cross-site scripting, and IP rules.', '想成 SQL 注入、跨網站指令碼與 IP 規則。'),
      comparisonItem('AWS Shield', 'AWS Shield', 'Protects AWS applications against DDoS attacks.', '保護 AWS 應用程式免受 DDoS 攻擊。', 'Think network and transport layer flood protection.', '想成網絡與傳輸層流量攻擊防護。'),
      comparisonItem('Amazon GuardDuty', 'Amazon GuardDuty', 'Analyzes AWS telemetry to detect suspicious behavior and threats.', '分析 AWS 遙測資料以偵測可疑行為與威脅。', 'Think managed threat findings, not traffic blocking.', '想成受管威脅發現，而不是直接封鎖流量。'),
    ],
  },
  {
    id: 'ai-platforms',
    title: 'Amazon Bedrock vs Amazon SageMaker AI',
    summary: 'Choose between managed foundation model access and a broader machine learning platform.',
    sourceUrl: 'https://docs.aws.amazon.com/decision-guides/latest/bedrock-or-sagemaker/bedrock-or-sagemaker.html',
    translations: { zh: { title: 'Amazon Bedrock 與 Amazon SageMaker AI', summary: '分辨受管基礎模型存取與更完整的機器學習平台。' } },
    items: [
      comparisonItem('Amazon Bedrock', 'Amazon Bedrock', 'Build generative AI applications using managed foundation models and related features.', '使用受管基礎模型與相關功能建立生成式 AI 應用程式。', 'Think use and customize foundation models with less infrastructure work.', '想成以較少基礎設施工作使用及自訂基礎模型。'),
      comparisonItem('Amazon SageMaker AI', 'Amazon SageMaker AI', 'Prepare data and build, train, tune, and deploy machine learning models.', '準備資料並建立、訓練、調校及部署機器學習模型。', 'Think full ML lifecycle and greater model control.', '想成完整 ML 生命週期與更高模型控制。'),
    ],
  },
  {
    id: 'databases',
    title: 'Amazon RDS vs Amazon DynamoDB vs Amazon ElastiCache',
    summary: 'Separate relational data, serverless NoSQL, and in-memory acceleration.',
    translations: { zh: { title: 'Amazon RDS、Amazon DynamoDB 與 Amazon ElastiCache', summary: '分辨關聯式資料、無伺服器 NoSQL 與記憶體內加速。' } },
    items: [
      comparisonItem('Amazon RDS', 'Amazon RDS', 'Managed relational databases for SQL, schemas, joins, and transactions.', '支援 SQL、結構描述、聯結與交易的受管關聯式資料庫。', 'Think relational engines with managed administration.', '想成由 AWS 管理操作工作的關聯式引擎。'),
      comparisonItem('Amazon DynamoDB', 'Amazon DynamoDB', 'Serverless key-value and document database for predictable performance at scale.', '在大規模下提供穩定效能的無伺服器鍵值與文件資料庫。', 'Think single-digit millisecond NoSQL access without servers.', '想成無需伺服器的個位數毫秒 NoSQL 存取。'),
      comparisonItem('Amazon ElastiCache', 'Amazon ElastiCache', 'Managed in-memory cache for faster reads, sessions, and frequently accessed data.', '用於加快讀取、工作階段與常用資料的受管記憶體快取。', 'Think cache beside a database, not the main durable store.', '想成資料庫旁的快取，而不是主要持久資料存放區。'),
    ],
  },
  {
    id: 'containers',
    title: 'Amazon ECS vs Amazon EKS vs AWS Fargate',
    summary: 'Separate AWS container orchestration, managed Kubernetes, and serverless container compute.',
    translations: { zh: { title: 'Amazon ECS、Amazon EKS 與 AWS Fargate', summary: '分辨 AWS 容器編排、受管 Kubernetes 與無伺服器容器運算。' } },
    items: [
      comparisonItem('Amazon ECS', 'Amazon ECS', 'AWS-native service for scheduling and managing containers.', '用於排程及管理容器的 AWS 原生服務。', 'Think AWS container orchestrator without Kubernetes.', '想成不使用 Kubernetes 的 AWS 容器編排器。'),
      comparisonItem('Amazon EKS', 'Amazon EKS', 'Managed Kubernetes control plane for Kubernetes workloads.', '為 Kubernetes 工作負載提供受管 Kubernetes 控制平面。', 'Think Kubernetes compatibility and ecosystem.', '想成 Kubernetes 相容性與生態系統。'),
      comparisonItem('AWS Fargate', 'AWS Fargate', 'Serverless compute capacity used by ECS or EKS tasks and pods.', '供 ECS 或 EKS 任務與 Pod 使用的無伺服器運算容量。', 'Fargate is compute, while ECS and EKS are orchestrators.', 'Fargate 是運算層，ECS 與 EKS 是編排器。'),
    ],
  },
  {
    id: 'load-balancing',
    title: 'Application Load Balancer vs Network Load Balancer vs Gateway Load Balancer',
    summary: 'Choose the load balancer by protocol, latency, and appliance-routing requirements.',
    translations: { zh: { title: 'Application、Network 與 Gateway Load Balancer', summary: '按協定、延遲與網絡設備路由需求選擇負載平衡器。' } },
    items: [
      comparisonItem('Application Load Balancer', 'Application Load Balancer', 'Layer 7 HTTP and HTTPS routing by host, path, header, and other request data.', '第 7 層 HTTP 與 HTTPS 路由，可按主機、路徑、標頭等請求資料分流。', 'Think web applications and content-based routing.', '想成 Web 應用程式與內容式路由。'),
      comparisonItem('Network Load Balancer', 'Network Load Balancer', 'Layer 4 TCP, UDP, and TLS traffic requiring very high performance and low latency.', '處理需要極高效能與低延遲的第 4 層 TCP、UDP 與 TLS 流量。', 'Think static IP support and millions of connections.', '想成靜態 IP 支援與大量連線。'),
      comparisonItem('Gateway Load Balancer', 'Gateway Load Balancer', 'Deploys and scales third-party virtual network appliances transparently.', '透明地部署及擴展第三方虛擬網絡設備。', 'Think firewalls, inspection systems, and appliance fleets.', '想成防火牆、檢查系統與網絡設備群組。'),
    ],
  },
]

function keyword(
  id: string,
  phrase: string,
  zhPhrase: string,
  thinkOf: string,
  zhThinkOf: string,
  reason: string,
  zhReason: string,
): ExamKeywordHint {
  return { id, phrase, thinkOf, reason, translations: { zh: { phrase: zhPhrase, thinkOf: zhThinkOf, reason: zhReason } } }
}

export const EXAM_KEYWORD_HINTS: ExamKeywordHint[] = [
  keyword('least-effort', 'least operational effort', '最少營運工作', 'Managed or serverless service', '受管或無伺服器服務', 'Prefer the option that removes infrastructure administration while meeting every requirement.', '在符合所有要求的前提下，優先選擇可減少基礎設施管理的方案。'),
  keyword('high-availability', 'high availability across data centers', '跨資料中心高可用性', 'Multiple Availability Zones', '多個可用區域', 'Availability Zones are isolated locations within a Region and are the common boundary for resilient design.', '可用區域是區域內互相隔離的位置，是設計高韌性架構的常見邊界。'),
  keyword('global-low-latency', 'global users and low latency', '全球使用者與低延遲', 'Amazon CloudFront or AWS Global Accelerator', 'Amazon CloudFront 或 AWS Global Accelerator', 'CloudFront caches content, while Global Accelerator improves routing to regional endpoints.', 'CloudFront 快取內容，Global Accelerator 則改善前往區域端點的網絡路由。'),
  keyword('decouple', 'decouple application components', '解耦應用程式元件', 'Amazon SQS, Amazon SNS, or Amazon EventBridge', 'Amazon SQS、Amazon SNS 或 Amazon EventBridge', 'Choose queue buffering, pub/sub fanout, or event routing according to the communication pattern.', '按通訊模式選擇訊息佇列、發佈訂閱扇出或事件路由。'),
  keyword('audit-api', 'audit API calls', '稽核 API 呼叫', 'AWS CloudTrail', 'AWS CloudTrail', 'CloudTrail records account activity and API call history.', 'CloudTrail 記錄帳戶活動與 API 呼叫歷史。'),
  keyword('metrics-alarms', 'metrics, logs, alarms, or dashboards', '指標、日誌、警示或儀表板', 'Amazon CloudWatch', 'Amazon CloudWatch', 'CloudWatch provides operational monitoring and observability.', 'CloudWatch 提供營運監控與可觀測性。'),
  keyword('configuration-compliance', 'resource configuration compliance', '資源設定合規', 'AWS Config', 'AWS Config', 'Config records resource configuration changes and evaluates rules.', 'Config 記錄資源設定變更並評估規則。'),
  keyword('object-storage', 'object storage or static website', '物件儲存或靜態網站', 'Amazon S3', 'Amazon S3', 'S3 stores objects in buckets and can host static website content.', 'S3 在儲存貯體中存放物件，並可託管靜態網站內容。'),
  keyword('block-storage', 'persistent disk for one EC2 instance', '單一 EC2 的持久磁碟', 'Amazon EBS', 'Amazon EBS', 'EBS provides persistent block volumes for EC2 workloads.', 'EBS 為 EC2 工作負載提供持久區塊磁碟區。'),
  keyword('shared-file', 'shared Linux file system', '共用 Linux 檔案系統', 'Amazon EFS', 'Amazon EFS', 'EFS provides elastic NFS file storage that multiple compute resources can mount.', 'EFS 提供可由多個運算資源掛載的彈性 NFS 檔案儲存。'),
  keyword('relational', 'SQL, joins, or relational database', 'SQL、聯結或關聯式資料庫', 'Amazon RDS or Amazon Aurora', 'Amazon RDS 或 Amazon Aurora', 'These services provide managed relational database engines.', '這些服務提供受管關聯式資料庫引擎。'),
  keyword('serverless-nosql', 'serverless key-value database at scale', '大規模無伺服器鍵值資料庫', 'Amazon DynamoDB', 'Amazon DynamoDB', 'DynamoDB is a serverless key-value and document database.', 'DynamoDB 是無伺服器鍵值與文件資料庫。'),
  keyword('detailed-billing', 'analyze historical costs and usage', '分析歷史成本與用量', 'AWS Cost Explorer', 'AWS Cost Explorer', 'Cost Explorer visualizes cost and usage patterns and forecasts.', 'Cost Explorer 以圖表顯示成本與用量模式及預測。'),
  keyword('budget-alert', 'alert when spending reaches a threshold', '支出達到門檻時警示', 'AWS Budgets', 'AWS Budgets', 'Budgets tracks custom cost or usage thresholds and sends alerts.', 'Budgets 追蹤自訂成本或用量門檻並發出警示。'),
  keyword('sensitive-s3', 'discover sensitive data in S3', '在 S3 探索敏感資料', 'Amazon Macie', 'Amazon Macie', 'Macie uses machine learning and pattern matching to identify sensitive data.', 'Macie 使用機器學習與模式比對識別敏感資料。'),
  keyword('threat-detection', 'continuous threat detection', '持續威脅偵測', 'Amazon GuardDuty', 'Amazon GuardDuty', 'GuardDuty analyzes AWS telemetry and produces security findings.', 'GuardDuty 分析 AWS 遙測資料並產生安全發現。'),
  keyword('web-protection', 'SQL injection or cross-site scripting', 'SQL 注入或跨網站指令碼', 'AWS WAF', 'AWS WAF', 'WAF filters malicious web requests with customizable rules.', 'WAF 使用可自訂規則篩選惡意 Web 請求。'),
  keyword('generative-ai', 'foundation models with least infrastructure management', '以最少基礎設施管理使用基礎模型', 'Amazon Bedrock', 'Amazon Bedrock', 'Bedrock provides managed access to foundation models and generative AI features.', 'Bedrock 提供基礎模型與生成式 AI 功能的受管存取。'),
  keyword('custom-ml', 'build, train, tune, and deploy an ML model', '建立、訓練、調校及部署 ML 模型', 'Amazon SageMaker AI', 'Amazon SageMaker AI', 'SageMaker AI supports the full machine learning lifecycle.', 'SageMaker AI 支援完整機器學習生命週期。'),
  keyword('documents', 'extract forms and tables from scanned documents', '從掃描文件擷取表格欄位與資料表', 'Amazon Textract', 'Amazon Textract', 'Textract understands document structure in addition to extracting text.', 'Textract 除了擷取文字，亦可理解文件結構。'),
]
