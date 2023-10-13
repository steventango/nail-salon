var firebase = require('firebase-tools');

function exit() {
  process.exit();
}
firebase
  .deploy({
    project: 'nail-salon-ib',
    token: process.env.FIREBASE_TOKEN,
    cwd: 'C:\\Users\\Steven\\Google Drive\\School\\Grade 11\\Computer Science 30\\Computer Science IA\\Computer Science IA Code'
  })
  .then(function() {
    console.log('Deployed!');
    setTimeout(exit, 2000);
  })
  .catch(function(err) {
    console.log(err);
    setTimeout(exit, 16000);
  });
