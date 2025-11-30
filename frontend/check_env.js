const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.production');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env.production file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const requiredKeys = [
    'KINDE_CLIENT_ID',
    'KINDE_CLIENT_SECRET',
    'KINDE_ISSUER_URL',
    'KINDE_SITE_URL',
    'KINDE_POST_LOGOUT_REDIRECT_URL',
    'KINDE_POST_LOGIN_REDIRECT_URL',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'PYTHON_BACKEND_URL'
];

let missing = [];
requiredKeys.forEach(key => {
    if (!envContent.includes(key + '=')) {
        missing.push(key);
    }
});

if (missing.length > 0) {
    console.error('❌ Missing Environment Variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\nPlease add these to your .env.production file.');
} else {
    console.log('✅ All required environment variables are present in .env.production!');
    console.log('   (Make sure the values are correct!)');
}
