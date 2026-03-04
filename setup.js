const https = require('https');
const fs = require('fs');
const url = "https://start.spring.io/starter.zip?type=maven-project&language=java&bootVersion=3.4.1&groupId=com.meditrack&artifactId=backend&name=backend&description=MediTrack+Backend&packageName=com.meditrack.backend&packaging=jar&javaVersion=21&dependencies=web,data-jpa,security,mysql,mail,validation,lombok";

const file = fs.createWriteStream("backend.zip");
https.get(url, function(response) {
  if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
     https.get(response.headers.location, (res) => {
        res.pipe(file);
        file.on('finish', () => { file.close(() => console.log("Downloaded successfully")); });
     });
  } else {
    response.pipe(file);
    file.on('finish', () => { file.close(() => console.log("Downloaded successfully")); });
  }
});
