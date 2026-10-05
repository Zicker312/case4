import { app } from './app.js'; import { config } from './config/index.js'; import { sequelize } from './db.js';
let server;
try { await sequelize.authenticate(); server=app.listen(config.port,()=>console.log(JSON.stringify({level:'info',type:'startup',message:'Maintenance API started',port:config.port}))); }
catch(error){ console.error(JSON.stringify({level:'error',type:'startup',message:'PostgreSQL unavailable',error:error.message})); process.exitCode=1; }
async function shutdown(signal){ console.log(JSON.stringify({level:'info',type:'shutdown',signal})); if(server) await new Promise(resolve=>server.close(resolve)); await sequelize.close(); process.exit(0); }
process.on('SIGTERM',()=>shutdown('SIGTERM')); process.on('SIGINT',()=>shutdown('SIGINT'));
