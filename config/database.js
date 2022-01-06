// module.exports = ({ env }) => ({
//   connection: {
//     client: 'postgres',
//     connection: {
//       host: env('DATABASE_HOST', ''),
//       port: env.int('DATABASE_PORT', 5432),
//       database: env('DATABASE_NAME', ''),
//       user: env('DATABASE_USERNAME', ''),
//       password: env('DATABASE_PASSWORD', ''),
//       ssl: env.bool('DATABASE_SSL', false),
//     },
//   },
// });
//taken from docs:
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: process.env.DATABASE_HOST,
      port: env.int('DATABASE_PORT', 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      schema: env('DATABASE_SCHEMA', 'public'), // Not required
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
      },
    },
    debug: false,
  },
});