module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'bdcefbd9889da737321890768cbfc69a'),
  },
});
