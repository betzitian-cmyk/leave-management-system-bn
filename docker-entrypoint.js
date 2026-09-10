#!/usr/bin/env node

const { execSync } = require('child_process')

function run(command) {
  console.log(`> ${command}`)
  execSync(command, { stdio: 'inherit' })
}

async function main() {
  console.log('Running table creation...')
  run('node dist/scripts/create-tables.js')

  console.log('Running seeds...')
  run('node dist/scripts/seed-all.js')

  console.log('Starting server...')
  require('./dist/server.js')
}

main().catch(err => {
  console.error('Startup failed:', err)
  process.exit(1)
})