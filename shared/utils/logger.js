function log(service, message, data = '') {
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${time}] [${service}] ${message}`, data ? JSON.stringify(data) : '');
}

module.exports = { log };