var firebase = require('firebase-tools');

function exit() {
  process.exit();
}

firebase
  .serve({
    project: 'nail-salon-ib',
    token: process.env.FIREBASE_TOKEN,
    cwd: 'C:\\Users\\Steven\\Google Drive\\School\\Grade 11\\Computer Science 30\\Computer Science IA\\Computer Science IA Code', 
    port: 5000
  })
  .then(function() {
    console.log('Served!');
  })
  .catch(function(err) {
    console.log('' + err);
    setTimeout(exit, 8000);
  });
