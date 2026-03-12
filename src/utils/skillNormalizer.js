/**
 * Comprehensive Skill Normalizer
 * Maps skill variations to canonical forms for accurate matching
 */

// Comprehensive mapping of variations to canonical skill names
const skillAliases = {
  // ========== Programming Languages ==========
  "javascript": "javascript", "js": "javascript", "ecmascript": "javascript", "es6": "javascript",
  "typescript": "typescript", "ts": "typescript",
  "python": "python", "python3": "python", "py": "python",
  "java": "java", "j2ee": "java", "jdk": "java",
  "c++": "c++", "cpp": "c++", "cplusplus": "c++", "c plus plus": "c++",
  "c#": "c#", "csharp": "c#", "c sharp": "c#", "c-sharp": "c#",
  "go": "go", "golang": "go", "go lang": "go",
  "ruby": "ruby",
  "php": "php", "php7": "php", "php8": "php",
  "swift": "swift", "swiftui": "swift",
  "kotlin": "kotlin",
  "scala": "scala",
  "rust": "rust", "rustlang": "rust",
  "r": "r", "r programming": "r", "r language": "r", "rstudio": "r",
  "matlab": "matlab", "simulink": "matlab",
  "shell": "shell", "bash": "shell", "shell scripting": "shell", "bash scripting": "shell", "zsh": "shell",
  "powershell": "powershell", "ps1": "powershell",
  "perl": "perl",

  // ========== Web Frontend ==========
  "html": "html", "html5": "html", "html/css": "html",
  "css": "css", "css3": "css", "scss": "css", "sass": "css", "less": "css", "stylus": "css",
  "react": "react", "reactjs": "react", "react.js": "react", "react js": "react",
  "react native": "react native", "react-native": "react native", "reactnative": "react native",
  "angular": "angular", "angularjs": "angular", "angular.js": "angular", "angular js": "angular",
  "vue": "vue", "vuejs": "vue", "vue.js": "vue", "vue js": "vue",
  "nuxt": "nuxt", "nuxtjs": "nuxt", "nuxt.js": "nuxt",
  "next.js": "next.js", "nextjs": "next.js", "next js": "next.js",
  "svelte": "svelte", "sveltekit": "svelte",
  "jquery": "jquery",
  "bootstrap": "bootstrap", "bootstrap 5": "bootstrap",
  "tailwind": "tailwind", "tailwindcss": "tailwind", "tailwind css": "tailwind",

  // ========== Backend Frameworks ==========
  "node.js": "node.js", "nodejs": "node.js", "node js": "node.js", "node": "node.js",
  "express": "express", "expressjs": "express", "express.js": "express",
  "nestjs": "nestjs", "nest.js": "nestjs", "nest js": "nestjs",
  "django": "django", "django rest": "django", "drf": "django",
  "flask": "flask", "flask api": "flask",
  "fastapi": "fastapi", "fast api": "fastapi", "fast-api": "fastapi",
  "spring": "spring", "spring boot": "spring boot", "springboot": "spring boot",
  "laravel": "laravel",
  "rails": "rails", "ruby on rails": "rails", "ror": "rails",
  "asp.net": "asp.net", "asp net": "asp.net", ".net": ".net", "dotnet": ".net", ".net core": ".net",

  // ========== Databases ==========
  "sql": "sql", "t-sql": "sql", "tsql": "sql",
  "mysql": "mysql", "mariadb": "mysql",
  "postgresql": "postgresql", "postgres": "postgresql", "psql": "postgresql", "pg": "postgresql",
  "mongodb": "mongodb", "mongo": "mongodb", "mongoose": "mongodb",
  "redis": "redis", "redis cache": "redis",
  "elasticsearch": "elasticsearch", "elastic search": "elasticsearch", "elk": "elasticsearch",
  "oracle": "oracle", "oracle db": "oracle", "pl/sql": "oracle", "plsql": "oracle",
  "sqlite": "sqlite", "sqlite3": "sqlite",
  "cassandra": "cassandra", "apache cassandra": "cassandra",
  "dynamodb": "dynamodb", "dynamo db": "dynamodb", "aws dynamodb": "dynamodb",
  "firebase": "firebase", "firestore": "firebase",
  "nosql": "nosql", "no-sql": "nosql",

  // ========== Cloud & DevOps ==========
  "aws": "aws", "amazon web services": "aws", "ec2": "aws", "s3": "aws", "lambda": "aws", "aws lambda": "aws",
  "azure": "azure", "microsoft azure": "azure", "azure devops": "azure",
  "gcp": "gcp", "google cloud": "gcp", "google cloud platform": "gcp", "gke": "gcp",
  "docker": "docker", "dockerfile": "docker", "docker compose": "docker", "docker-compose": "docker", "containerization": "docker",
  "kubernetes": "kubernetes", "k8s": "kubernetes", "kubectl": "kubernetes", "helm": "kubernetes",
  "jenkins": "jenkins", "jenkins ci": "jenkins", "jenkins pipeline": "jenkins",
  "terraform": "terraform", "tf": "terraform", "infrastructure as code": "terraform", "iac": "terraform",
  "ansible": "ansible", "ansible playbook": "ansible",
  "ci/cd": "ci/cd", "cicd": "ci/cd", "ci cd": "ci/cd", "continuous integration": "ci/cd", "continuous deployment": "ci/cd",
  "github actions": "github actions", "gh actions": "github actions",
  "gitlab ci": "gitlab ci", "gitlab-ci": "gitlab ci", "gitlab pipeline": "gitlab ci",

  // ========== Data Science & ML ==========
  "machine learning": "machine learning", "ml": "machine learning", "deep learning": "machine learning", "dl": "machine learning", "neural network": "machine learning",
  "artificial intelligence": "artificial intelligence", "ai": "artificial intelligence", "ai/ml": "artificial intelligence",
  "tensorflow": "tensorflow", "keras": "tensorflow",
  "pytorch": "pytorch", "torch": "pytorch",
  "pandas": "pandas", "pd": "pandas",
  "numpy": "numpy", "np": "numpy",
  "scikit-learn": "scikit-learn", "sklearn": "scikit-learn", "scikit learn": "scikit-learn",
  "opencv": "opencv", "cv2": "opencv", "computer vision": "opencv",
  "nlp": "nlp", "natural language processing": "nlp", "text mining": "nlp",
  "data science": "data science", "data analysis": "data science", "data analytics": "data science",

  // ========== BI / Data Tools ==========
  "excel": "excel", "ms excel": "excel", "microsoft excel": "excel",
  "google sheets": "google sheets", "google spreadsheets": "google sheets",
  "tableau": "tableau",
  "power bi": "power bi", "powerbi": "power bi",
  "qlik sense": "qlik sense", "qliksense": "qlik sense", "qlik": "qlik sense",
  "metabase": "metabase",
  "looker": "looker",
  "data visualization": "data visualization", "data visualisation": "data visualization",
  "statistical modeling": "statistical modeling", "statistical modelling": "statistical modeling",
  "presto": "presto",
  "hive": "hive", "apache hive": "hive",

  // ========== APIs & Protocols ==========
  "rest api": "rest api", "rest": "rest api", "restful": "rest api", "restful api": "rest api",
  "graphql": "graphql", "graph ql": "graphql", "apollo": "graphql",
  "grpc": "grpc", "g-rpc": "grpc",
  "websocket": "websocket", "websockets": "websocket", "socket.io": "websocket",

  // ========== Testing ==========
  "jest": "jest",
  "mocha": "mocha", "chai": "mocha",
  "pytest": "pytest", "py.test": "pytest",
  "junit": "junit", "junit5": "junit",
  "selenium": "selenium", "selenium webdriver": "selenium",
  "cypress": "cypress",
  "unit testing": "testing", "integration testing": "testing", "e2e testing": "testing", "tdd": "testing", "bdd": "testing",

  // ========== Version Control ==========
  "git": "git", "github": "git", "gitlab": "git", "bitbucket": "git", "version control": "git",
  "svn": "svn", "subversion": "svn",

  // ========== Tools ==========
  "jira": "jira", "atlassian jira": "jira",
  "confluence": "confluence",
  "slack": "slack",
  "vscode": "vscode", "vs code": "vscode", "visual studio code": "vscode",

  // ========== Methodologies ==========
  "agile": "agile", "scrum": "agile", "kanban": "agile",
  "devops": "devops", "dev ops": "devops", "sre": "devops", "site reliability": "devops",

  // ========== Security ==========
  "security": "security", "cybersecurity": "security", "infosec": "security", "owasp": "security",
  "oauth": "oauth", "oauth2": "oauth", "openid": "oauth", "sso": "oauth",
  "jwt": "jwt", "json web token": "jwt",

  // ========== Soft Skills ==========
  "leadership": "leadership", "team lead": "leadership", "tech lead": "leadership",
  "communication": "communication", "presentation": "communication",
  "teamwork": "teamwork", "team player": "teamwork",
  "collaboration": "collaboration", "collaborative": "collaboration",
  "problem solving": "problem solving", "problem-solving": "problem solving", "analytical": "problem solving"
};

/**
 * Normalize a single skill to its canonical form
 */
function normalizeSkill(skill) {
  if (!skill) return skill;
  const lower = skill.toLowerCase().trim();
  return skillAliases[lower] || lower;
}

/**
 * Preprocess text for better skill extraction
 */
function preprocessText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[,;|•·]/g, ' ')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get all skill aliases
 */
function getSkillAliases() {
  return skillAliases;
}

module.exports = {
  normalizeSkill,
  preprocessText,
  getSkillAliases
};
