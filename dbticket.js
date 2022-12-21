const  configTICKET = {
    user:  'sa', // sql user
    password:  'Mlisql123', //sql user password
    server:  '202.133.4.238', // if it does not work try- localhost
    database:  'dbtiketing',
    options: { encrypt: false },
    port:  1433,
    pool: {
      max: 25,
      min: 0,
      idleTimeoutMillis: 30000
    }
}

module.exports = configTICKET;