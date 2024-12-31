import postgres from 'postgres'

const DB_CONFIG: postgres.Options<{}> = {
  host: process.env.DB_HOST || 'localhost',
  backoff(attemptNum) {
    return (attemptNum * attemptNum) * 100
  },
  connect_timeout: 300,
  database: process.env.DB_DB || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  username: process.env.DB_USER || 'postgres',
  port: +(process.env.DB_PORT || 5432)
}

export const sql = postgres(DB_CONFIG)