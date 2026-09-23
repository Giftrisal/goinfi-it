const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  const configPath = path.join(__dirname, 'deploy.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Missing deploy.config.json');
    return;
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  try {
    console.log(`Connecting to ${config.host} as ${config.user}...`);
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: config.secure,
    });

    console.log('Connected successfully!');

    const list = await client.list();
    console.log('Remote files:', list.map(f => f.name));

    const filesToDeploy = [
      'index.html',
      'logo.png',
      'logo-white.png',
      'favicon.ico',
      'favicon.png',
      'favicon-32x32.png',
      'apple-touch-icon.png',
      'sitemap.xml',
      'robots.txt',
      '.htaccess'
    ];

    for (const file of filesToDeploy) {
      const localFile = path.join(__dirname, file);
      if (fs.existsSync(localFile)) {
        console.log(`Uploading ${file}...`);
        await client.uploadFrom(localFile, file);
      }
    }

    console.log('\n🚀 Deployment Complete! All files are live on https://labs.goinfi.biz/');
  } catch (err) {
    console.error('Deployment failed:', err.message);
  } finally {
    client.close();
  }
}

deploy();
