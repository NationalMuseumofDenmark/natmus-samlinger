// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});

exports.create = {
	User: [
		{
    'name.first': 'Admin',
    'name.last': 'User',
    'email': process.env.KEYSTONE_ADMIN_EMAIL || 'user@keystonejs.com',
    'password': process.env.KEYSTONE_ADMIN_PASSWORD || 'admin',
    'isAdmin': true
  },
	],
};
