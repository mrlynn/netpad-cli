const inquirer = require('inquirer').default;
const auth = require('../lib/auth');
const chalk = require('chalk');

module.exports = (program) => {
  program
    .command('login')
    .description('Authenticate with NetPad')
    .option('-u, --url <url>', 'NetPad instance URL')
    .option('-e, --email <email>', 'Email address')
    .option('--google', 'Login with Google OAuth')
    .option('--github', 'Login with GitHub OAuth')
    .action(async (options) => {
      try {
        console.log(chalk.blue('🚀 NetPad CLI Authentication\n'));

        // Check if already authenticated
        if (auth.isAuthenticated()) {
          const { proceed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'proceed',
            message: 'You are already logged in. Do you want to log in again?',
            default: false
          }]);

          if (!proceed) {
            console.log(chalk.gray('Login cancelled.'));
            return;
          }
        }

        // Get base URL
        let baseUrl;
        if (!options.url) {
          const { url } = await inquirer.prompt([{
            type: 'input',
            name: 'url',
            message: 'NetPad instance URL:',
            default: 'https://netpad.io',
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return 'Please enter a valid URL (e.g., https://netpad.io)';
              }
            }
          }]);
          baseUrl = url;
        } else {
          baseUrl = options.url;
        }

        // Remove trailing slash from URL
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');

        let email = options.email;

        // Handle OAuth options  
        if (options.google) {
          try {
            await auth.authenticateWithDeviceCode(cleanBaseUrl, 'google');
            console.log(chalk.gray(`Instance: ${cleanBaseUrl}`));
            console.log(chalk.gray('Provider: Google OAuth'));
          } catch (error) {
            if (error.message.includes('405') || error.message.includes('404')) {
              console.log(chalk.yellow('\n⚠️ Device code flow not available on this NetPad instance.'));
              console.log(chalk.gray('This feature requires NetPad v2.0+ with CLI authentication support.'));
              console.log(chalk.gray('Please use email/password authentication or contact your admin.'));
              return;
            }
            throw error;
          }
        } else if (options.github) {
          try {
            await auth.authenticateWithDeviceCode(cleanBaseUrl, 'github');
            console.log(chalk.gray(`Instance: ${cleanBaseUrl}`));
            console.log(chalk.gray('Provider: GitHub OAuth'));
          } catch (error) {
            if (error.message.includes('405') || error.message.includes('404')) {
              console.log(chalk.yellow('\n⚠️ Device code flow not available on this NetPad instance.'));
              console.log(chalk.gray('This feature requires NetPad v2.0+ with CLI authentication support.'));
              console.log(chalk.gray('Please use email/password authentication or contact your admin.'));
              return;
            }
            throw error;
          }
        } else {
          // Traditional email/password authentication
          const questions = [];

          if (!email) {
            questions.push({
              type: 'input',
              name: 'email',
              message: 'Email address:',
              validate: (input) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(input) || 'Please enter a valid email address';
              }
            });
          }

          questions.push({
            type: 'password',
            name: 'password',
            message: 'Password:',
            mask: '*',
            validate: (input) => input.length > 0 || 'Password is required'
          });

          // Ask about auth method if no email provided and no OAuth flags
          if (!email && questions.length === 2) {
            const { authMethod } = await inquirer.prompt([{
              type: 'list',
              name: 'authMethod',
              message: 'Choose authentication method:',
              choices: [
                { name: 'Email & Password', value: 'credentials' },
                { name: 'Google OAuth (opens browser)', value: 'google' },
                { name: 'GitHub OAuth (opens browser)', value: 'github' }
              ]
            }]);

            if (authMethod === 'google') {
              await auth.authenticateWithDeviceCode(cleanBaseUrl, 'google');
              console.log(chalk.gray(`Instance: ${cleanBaseUrl}`));
              console.log(chalk.gray('Provider: Google OAuth'));
              return;
            } else if (authMethod === 'github') {
              await auth.authenticateWithDeviceCode(cleanBaseUrl, 'github');
              console.log(chalk.gray(`Instance: ${cleanBaseUrl}`));
              console.log(chalk.gray('Provider: GitHub OAuth'));
              return;
            }
          }

          const answers = await inquirer.prompt(questions);
          email = email || answers.email;
          const password = answers.password;

          // Authenticate with credentials
          await auth.authenticate(cleanBaseUrl, email, password);
          
          console.log(chalk.green('\n✅ Successfully authenticated with NetPad!'));
          console.log(chalk.gray(`Instance: ${cleanBaseUrl}`));
          console.log(chalk.gray(`Email: ${email}`));
        }

      } catch (error) {
        console.error(chalk.red('\n❌ Authentication failed:'), error.message);
        
        if (error.code === 'CONNECTION_ERROR') {
          console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
          console.log(chalk.gray('• Check your internet connection'));
          console.log(chalk.gray('• Verify the NetPad instance URL is correct'));
          console.log(chalk.gray('• Ensure the NetPad instance is running'));
        } else if (error.code === 'INVALID_CREDENTIALS') {
          console.log(chalk.yellow('\n💡 Please check:'));
          console.log(chalk.gray('• Your email address is correct'));
          console.log(chalk.gray('• Your password is correct'));
          console.log(chalk.gray('• Your account exists on this NetPad instance'));
        } else if (error.code === 'DEVICE_CODE_ERROR') {
          console.log(chalk.yellow('\n💡 Device code troubleshooting:'));
          console.log(chalk.gray('• Ensure the browser opened correctly'));
          console.log(chalk.gray('• Complete the authentication in the browser'));
          console.log(chalk.gray('• Enter the verification code correctly'));
          console.log(chalk.gray('• Check that OAuth is enabled on the NetPad instance'));
          console.log(chalk.gray('• Try again or use email/password authentication'));
        }
        
        process.exit(1);
      }
    });

  program
    .command('logout')
    .description('Clear authentication credentials')
    .action(() => {
      if (!auth.isAuthenticated()) {
        console.log(chalk.yellow('You are not currently logged in.'));
        return;
      }

      auth.logout();
    });

  program
    .command('whoami')
    .description('Show current authentication status')
    .action(async () => {
      if (!auth.isAuthenticated()) {
        console.log(chalk.yellow('Not authenticated. Run "netpad-cli login" to sign in.'));
        return;
      }

      const baseUrl = auth.getBaseUrl();
      const apiKey = auth.getApiKey();
      
      console.log(chalk.blue('🔐 Authentication Status'));
      console.log(`Instance: ${baseUrl}`);
      console.log(`API Key: ${apiKey.substring(0, 10)}...`);
      
      // Validate API key
      console.log(chalk.gray('Validating API key...'));
      const isValid = await auth.validateApiKey();
      
      if (isValid) {
        console.log(chalk.green('✅ API key is valid'));
      } else {
        console.log(chalk.red('❌ API key is invalid or expired'));
        console.log(chalk.yellow('Run "netpad-cli login" to re-authenticate.'));
      }
    });
}; 