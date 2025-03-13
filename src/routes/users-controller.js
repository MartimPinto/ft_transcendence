import db from '../db.js'

const responseSchema = {
	response: {
		200: {
			properties: {
				users: { type: 'array' }
			},
		}
	}
};

const postSchema = {
	body : {
		properties: {
			user: {type: 'object'}
		},
		required: ['user']
	},
	response: {
		200: {
			status: {type: 'number'}
		}
	}
};

const usersController = (fastify, options, done) => {

	fastify.get('/', {schema: responseSchema}, async (req, res) => {
		try {
			const users = db.prepare('SELECT id, username FROM users').all();
			return { users };
		} catch(error) {
			return(error);
		};
	});

	fastify.post('/register', {schema: postSchema}, async (req, res) => {
		const {user} = req.body;
		try {
			const insertData = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
			insertData.run(user.username, user.password);
			return {success: true, message: 'User registered'};
		} catch (error) {
			return res.status(400).send({error: 'User already exists'});
		};
	});
	done();
};

export default usersController;