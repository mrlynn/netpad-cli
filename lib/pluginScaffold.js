const fs = require('fs/promises');
const path = require('path');
const inquirer = require('inquirer').default;
const chalk = require('chalk');
const { execSync } = require('child_process');

const PLUGIN_CATEGORIES = {
    DATA: 'data',
    INTEGRATION: 'integration',
    TRANSFORM: 'transform',
    DATABASE: 'database',
    UTILITY: 'utility',
};

const PLUGIN_SCOPES = {
    PRIVATE: 'private',
    ORGANIZATION: 'organization',
    PUBLIC: 'public',
};

function isValidPluginName(name) {
    return /^[a-z0-9-]+$/.test(name);
}

async function promptPluginDetails(pluginName) {
    const questions = [
        {
            type: 'input',
            name: 'displayName',
            message: 'Plugin display name:',
            default: pluginName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        },
        {
            type: 'input',
            name: 'description',
            message: 'Plugin description:',
            validate: input => input.length > 0 || 'Description is required'
        },
        {
            type: 'list',
            name: 'category',
            message: 'Plugin category:',
            choices: Object.values(PLUGIN_CATEGORIES)
        },
        {
            type: 'list',
            name: 'scope',
            message: 'Plugin scope:',
            choices: [
                { name: 'Private (only you can use)', value: PLUGIN_SCOPES.PRIVATE },
                { name: 'Organization (your org can use)', value: PLUGIN_SCOPES.ORGANIZATION },
                { name: 'Public (everyone can use)', value: PLUGIN_SCOPES.PUBLIC }
            ]
        },
        {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            default: () => {
                try {
                    return execSync('git config user.name', { encoding: 'utf8' }).trim();
                } catch {
                    return '';
                }
            }
        },
        {
            type: 'input',
            name: 'email',
            message: 'Author email:',
            default: () => {
                try {
                    return execSync('git config user.email', { encoding: 'utf8' }).trim();
                } catch {
                    return '';
                }
            }
        },
        {
            type: 'list',
            name: 'template',
            message: 'Choose template:',
            choices: [
                { name: 'Basic Node Template', value: 'basic' },
                { name: 'API Integration Template', value: 'api' },
                { name: 'Data Transformer Template', value: 'transformer' },
                { name: 'Database Connector Template', value: 'database' }
            ]
        },
        {
            type: 'confirm',
            name: 'includeTests',
            message: 'Include test files?',
            default: true
        },
        {
            type: 'confirm',
            name: 'includeReadme',
            message: 'Include README template?',
            default: true
        }
    ];

    const answers = await inquirer.prompt(questions);
    return {
        ...answers,
        name: pluginName,
        id: `${answers.author.toLowerCase().replace(/\s+/g, '')}.${pluginName}`
    };
}

function generateManifest(config) {
    return {
        name: config.name,
        id: config.id,
        version: '1.0.0',
        displayName: config.displayName,
        description: config.description,
        author: {
            name: config.author,
            email: config.email
        },
        license: 'MIT',
        keywords: [config.category, 'netpad', 'plugin'],
        category: config.category,
        scope: config.scope,
        permissions: {
            network: [],
            environment: [],
            files: []
        },
        nodeConfig: {
            gradientColors: ['#4F46E5', '#7C3AED'],
            primaryColor: '#4F46E5',
            badgeText: 'PLUGIN',
            description: config.description,
            category: config.category
        },
        dependencies: {},
        files: {
            runner: './src/runner.js',
            shape: './src/shape.js',
            icon: './src/icon.svg'
        },
        engines: {
            netpad: '>=1.0.0'
        }
    };
}

function generatePackageJson(config) {
    return {
        name: config.name,
        version: '1.0.0',
        description: config.description,
        main: 'src/runner.js',
        scripts: {
            dev: 'netpad-plugin dev',
            build: 'netpad-plugin build',
            test: 'jest',
            validate: 'netpad-plugin validate',
            publish: 'netpad-plugin publish'
        },
        keywords: [config.category, 'netpad', 'plugin'],
        author: `${config.author} <${config.email}>`,
        license: 'MIT',
        devDependencies: {
            '@netpad/plugin-cli': '^1.0.0',
            jest: '^29.0.0'
        },
        peerDependencies: {
            '@netpad/core': '^1.0.0'
        }
    };
}

async function loadTemplate(templateDir, filename, templatesDir) {
    try {
        return await fs.readFile(path.join(templateDir, filename), 'utf8');
    } catch (error) {
    // Fallback to default template
        return await fs.readFile(path.join(templatesDir, 'basic', filename), 'utf8');
    }
}

function processTemplate(template, config) {
    // Create camelCase function name from plugin name
    const functionName = config.name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase());
  
    return template
        .replace(/\{\{name\}\}/g, config.name)
        .replace(/\{\{functionName\}\}/g, functionName)
        .replace(/\{\{displayName\}\}/g, config.displayName)
        .replace(/\{\{description\}\}/g, config.description)
        .replace(/\{\{author\}\}/g, config.author)
        .replace(/\{\{category\}\}/g, config.category)
    // Handle complex name transformation expression
        .replace(/\{\{name\.replace\(.*?\)\}\}/g, functionName);
}

async function scaffoldPlugin(pluginDir, config, templatesDir) {
    await fs.mkdir(pluginDir, { recursive: true });
    await fs.mkdir(path.join(pluginDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(pluginDir, 'tests'), { recursive: true });

    // manifest.json
    const manifest = generateManifest(config);
    await fs.writeFile(path.join(pluginDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // package.json
    const packageJson = generatePackageJson(config);
    await fs.writeFile(path.join(pluginDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Copy template files
    const templateDir = path.join(templatesDir, config.template);
    // runner.js
    const runnerTemplate = await loadTemplate(templateDir, 'runner.js', templatesDir);
    const runnerContent = processTemplate(runnerTemplate, config);
    await fs.writeFile(path.join(pluginDir, 'src', 'runner.js'), runnerContent);
    // shape.js
    const shapeTemplate = await loadTemplate(templateDir, 'shape.js', templatesDir);
    const shapeContent = processTemplate(shapeTemplate, config);
    await fs.writeFile(path.join(pluginDir, 'src', 'shape.js'), shapeContent);
    // icon.svg
    const iconTemplate = await loadTemplate(templateDir, 'icon.svg', templatesDir);
    await fs.writeFile(path.join(pluginDir, 'src', 'icon.svg'), iconTemplate);
    // tests
    if (config.includeTests) {
        const testTemplate = await loadTemplate(templateDir, 'runner.test.js', templatesDir);
        const testContent = processTemplate(testTemplate, config);
        await fs.writeFile(path.join(pluginDir, 'tests', 'runner.test.js'), testContent);
    }
    // jest.config.json
    const jestConfig = {
        testEnvironment: 'node',
        testMatch: ['**/tests/**/*.test.js'],
        collectCoverageFrom: ['src/**/*.js'],
        coverageDirectory: 'coverage'
    };
    await fs.writeFile(path.join(pluginDir, 'jest.config.json'), JSON.stringify(jestConfig, null, 2));
    // .gitignore
    const gitignore = 'node_modules/\ncoverage/\ndist/\n.env\n.env.local\n*.log\n.DS_Store\n';
    await fs.writeFile(path.join(pluginDir, '.gitignore'), gitignore);
    // README.md
    if (config.includeReadme) {
        const readme = `# ${config.displayName}\n\n${config.description}\n\n## Installation\n\n\`\`\`bash\n# Install from NetPad Plugin Store\n# (Instructions will be available after publishing)\n\`\`\`\n\n## Usage\n\nThis plugin adds a new node type to NetPad workflows that ${config.description.toLowerCase()}.\n\n## Development\n\n\`\`\`bash\n# Install dependencies\nnpm install\n\n# Start development mode\nnpm run dev\n\n# Run tests\nnpm test\n\n# Build for production\nnpm run build\n\n# Publish to store\nnpm run publish\n\`\`\`\n\n## Configuration\n\nThe plugin supports the following configuration options:\n\n- \`option1\`: Description of option 1\n- \`option2\`: Description of option 2\n\n## License\n\nMIT License - see LICENSE file for details.\n\n## Author\n\n${config.author} <${config.email}>\n`;
        await fs.writeFile(path.join(pluginDir, 'README.md'), readme);
    }
}

async function installDependencies(pluginDir) {
    console.log(chalk.yellow('📦 Installing dependencies...'));
    try {
        execSync('npm install', {
            cwd: pluginDir,
            stdio: 'inherit'
        });
    } catch (error) {
        console.log(chalk.yellow('⚠️ Failed to install dependencies automatically'));
        console.log(chalk.gray('Run "npm install" manually in the plugin directory'));
    }
}

async function createPlugin(pluginName, templatesDir) {
    if (!pluginName) {
        console.log(chalk.red('❌ Plugin name is required'));
        return;
    }
    if (!isValidPluginName(pluginName)) {
        console.log(chalk.red('❌ Invalid plugin name. Must be lowercase, alphanumeric with hyphens only.'));
        return;
    }
    console.log(chalk.yellow(`📦 Creating plugin: ${pluginName}`));
    const pluginDir = path.join(process.cwd(), pluginName);
    try {
        await fs.access(pluginDir);
        console.log(chalk.red(`❌ Directory ${pluginName} already exists`));
        return;
    } catch {
    // Directory doesn't exist, good to proceed
    }
    const answers = await promptPluginDetails(pluginName);
    await scaffoldPlugin(pluginDir, answers, templatesDir);
    await installDependencies(pluginDir);
    console.log(chalk.green.bold('\n✅ Plugin created successfully!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray(`  cd ${pluginName}`));
    console.log(chalk.gray('  npm run dev     # Start development mode'));
    console.log(chalk.gray('  npm test        # Run tests'));
    console.log(chalk.gray('  npm run build   # Build for production'));
    console.log(chalk.gray('  npm run publish # Publish to NetPad store'));
}

module.exports = {
    createPlugin
}; 