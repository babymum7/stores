if (process.env.NODE_ENV === 'production' && !process.env.HEROKU) {
  const cluster = require('cluster');
  const numCPUs = require('os').cpus();

  if (cluster.isMaster) {
    numCPUs.forEach(() => cluster.fork());

    cluster.on('exit', worker => {
      console.log(`worker ${worker.id} died`);
    });

    // Auto send email for users subscribed
    // Need to connect to user of moogoose first, then can use auto mail, cause
    // Master runs separately with worker
    // require('../mail/autoMail');
  } else {
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '..', 'production.env') });
    require('./express');
  }
} else {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '..', 'development.env') });
  require('./express');
}
