const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Base Swagger configuration
const baseConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Leave Management System API',
    description:
      'Comprehensive API for managing employee leave, HR operations, recruitment, compensation, and onboarding',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@company.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server',
    },
    {
      url: 'https://hr-employees-management-bn.andasy.dev',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Function to load and parse YAML files
function loadYamlFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContent);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

// Function to merge components
function mergeComponents(target, source) {
  if (!source.components) return target;

  if (!target.components) {
    target.components = {};
  }

  Object.keys(source.components).forEach((key) => {
    if (!target.components[key]) {
      target.components[key] = {};
    }
    Object.assign(target.components[key], source.components[key]);
  });

  return target;
}

// Function to merge paths
function mergePaths(target, source) {
  if (!source.paths) return target;

  if (!target.paths) {
    target.paths = {};
  }

  Object.assign(target.paths, source.paths);
  return target;
}

// Function to generate complete Swagger spec
function generateSwaggerSpec() {
  let finalSpec = { ...baseConfig };

  // Define the order of module files to load
  const moduleFiles = [
    'schemas/auth.yaml',
    'schemas/employee.yaml',
    'schemas/leave.yaml',
    'schemas/attendance.yaml',
    'schemas/hr.yaml',
    'schemas/recruitment.yaml',
    'schemas/compensation.yaml',
    'schemas/onboarding.yaml',
    'schemas/documents.yaml',
    'schemas/audit.yaml',
    'schemas/profile.yaml',
    'schemas/notification.yaml',
  ];

  const pathFiles = [
    'paths/auth.yaml',
    'paths/employee.yaml',
    'paths/leave.yaml',
    'paths/attendance.yaml',
    'paths/hr.yaml',
    'paths/recruitment.yaml',
    'paths/compensation.yaml',
    'paths/onboarding.yaml',
    'paths/reports.yaml',
    'paths/notifications.yaml',
    'paths/audit.yaml',
    'paths/documents.yaml',
    'paths/manager.yaml',
    'paths/profile.yaml',
  ];

  // Load and merge each module
  moduleFiles.forEach((filePath) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const moduleSpec = loadYamlFile(fullPath);
      if (moduleSpec) {
        finalSpec = mergeComponents(finalSpec, moduleSpec);
        finalSpec = mergePaths(finalSpec, moduleSpec);
        console.log(`Loaded: ${filePath}`);
      }
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  });

  // Load and merge path files
  pathFiles.forEach((filePath) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const pathSpec = loadYamlFile(fullPath);
      if (pathSpec) {
        finalSpec = mergePaths(finalSpec, pathSpec);
        console.log(`Loaded: ${filePath}`);
      }
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  });

  return finalSpec;
}

// Function to save the combined spec
function saveCombinedSpec() {
  const combinedSpec = generateSwaggerSpec();
  const outputPath = path.join(__dirname, 'swagger-combined.yaml');

  try {
    const yamlOutput = yaml.dump(combinedSpec, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });

    fs.writeFileSync(outputPath, yamlOutput, 'utf8');
    console.log(`Combined Swagger spec saved to: ${outputPath}`);

    // Also save as JSON for easier programmatic use
    const jsonOutput = JSON.stringify(combinedSpec, null, 2);
    fs.writeFileSync(path.join(__dirname, 'swagger-combined.json'), jsonOutput, 'utf8');
    console.log(`Combined Swagger spec saved to: swagger-combined.json`);
  } catch (error) {
    console.error('Error saving combined spec:', error.message);
  }
}

// Export functions for use in other files
module.exports = {
  generateSwaggerSpec,
  saveCombinedSpec,
  loadYamlFile,
  mergeComponents,
  mergePaths,
};

// Run if called directly
if (require.main === module) {
  saveCombinedSpec();
}
