import db from '../db.js'
import argon2 from 'argon2';

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

const putSchema = {
	body: {
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

const deleteSchema = {	
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
			const hashedPassword = await argon2.hash(user.password);
			const insertData = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
			insertData.run(user.username, hashedPassword);
			return {success: true, message: 'User registered'};
		} catch (error) {
			return res.status(400).send({error: 'User already exists'});
		};
	});
	done();

	fastify.put('/:id', {schema: putSchema}, async (req, res) => {
		const {id} = req.params;
		const {user} = req.body;
		try {
			const updateData = db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?');
			const result = updateData.run(user.username, user.password, id);
			if (result.changes === 0) {
				return res.status(404).send({error: 'User not found'});
			}
			return {success: true, message: 'User updated'};
		} catch (error) {
			return res.status(400).send({error: 'Could not update user'});
		}
		
	})

	fastify.delete('/:id', {schema: deleteSchema}, async (req, res) => {
		const {id} = req.params;
		try {
			const deleteData = db.prepare('DELETE FROM users WHERE ? = id');
			const result = deleteData.run(id);
			if (result.changes === 0) {
				return res.status(404).send({ error: 'User not found' });
			}
			return {success: true, message: 'User deleted'};
		} catch(error) {
			return res.status(400).send({error: 'Could not delete user'});
		}
	})
};

export default usersController;