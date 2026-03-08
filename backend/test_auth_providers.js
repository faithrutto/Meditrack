const http = require('http');

const data = JSON.stringify({ email: 'dr.doe@hospital.com', password: 'password123' });
const req = http.request('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const token = JSON.parse(body).token;

        http.get('http://localhost:8080/api/appointments/providers', { headers: { 'Authorization': 'Bearer ' + token } }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => console.log('Providers Status:', res2.statusCode, '\n', data2.substring(0, 1000)));
        });
    });
});
req.write(data); req.end();
