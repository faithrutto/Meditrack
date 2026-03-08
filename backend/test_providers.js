const http = require('http');

http.get('http://localhost:8080/api/appointments/providers', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data.substring(0, 500)));
}).on('error', err => console.error('Error:', err.message));
