require('https').get('https://firestore.googleapis.com', res => {
  console.log('Status:', res.statusCode);
}).on('error', err => {
  console.error('Error:', err);
});