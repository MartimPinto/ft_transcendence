import db from '../db.js'
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const secretKey = 'segredo_super_secreto';

const responseSchema = {
	response: {
		200: {
			properties: {
				users: { type: 'array',
					properties: {
						id: {type: 'number'},
						username: {type: 'string'},
						email: {type: 'string'}
					},
				 }
			},
		}
	}
};

const userSchema = {
	response: {
		200: {
			properties: {
				user: { type: 'object',
					properties: {
						id: {type: 'number'},
						username: {type: 'string'},
						email: {type: 'string'}
					},
				}
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
	
	fastify.get('/:id', {schema: userSchema}, async (req, res) => {
		const {id} = req.params;
		try {
			const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(Number(id));
			console.log("Prepared User: ",user);
			if (!user) {
				return res.status(404).send({error: 'User not found'});
			}
			return {user};
		} catch(error) {
			return res.status(500).send({error: 'Failure to fetch user'});
		};
	});

	fastify.get('/profile', async (req, res) => {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) {
			return res.status(401).send({error: 'Unauthorized'});
		}
		try {
			const decoded = jwt.verify(token, secretKey);
			const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(decoded.id);
			if (!user) {
				return res.status(404).send({error: 'User not found'});
			}
			return {user};
		} catch(error) {
			return res.status(500).send({error: 'Internal server error'});
		}
	});

	fastify.post('/register', {schema: postSchema}, async (req, res) => {
		const {user} = req.body;
		if (!user.username || !user.password || !user.email) {
			return res.status(400).send({error: 'Missing fields'});
		}
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{7,20}$/;
        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
		if (!passwordRegex.test(user.password)) {
			return res.status(400).send({error: 'Password must be 7-20 characters long, contain at least one uppercase letter, one lowercase letter and one number'});
		}
		if (!emailRegex.test(user.email)) {
			return res.status(400).send({error: 'Email must be valid'});
		}
		try {
			const hashedPassword = await argon2.hash(user.password);
			const insertData = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)')
			insertData.run(user.username, hashedPassword, user.email);
			return {success: true, message: 'User registered'};
		} catch (error) {
			return res.status(400).send({error: 'User already exists'});
		};
	});

	fastify.post('/login', async (req, res) => {
		const {user} = req.body;
		if (!user.username || !user.password) {
			return res.status(400).send({error: 'Missing fields'});
		}
		try {
			const dbUser = db.prepare('SELECT * FROM users WHERE username = ?').get(user.username);
			if (!dbUser) {
				return res.status(404).send({error: 'User not found'});
			}
			const passwordMatch = await argon2.verify(dbUser.password, user.password);
			if (!passwordMatch) {
				return res.status(401).send({error: 'Invalid password'});
			}
			const token = jwt.sign({id: dbUser.id}, secretKey, {expiresIn: '1h'});
			return {success: true, message: 'User logged in', token};
		} catch (error) {
			return res.status(500).send({error: 'Internal server error'});
		}
	});

	fastify.put('/:id', {schema: putSchema}, async (req, res) => {
		const {id} = req.params;
		const {user} = req.body;
		if (!user.username || !user.password) {
			return res.status(400).send({error: 'Missing fields'});
		}
		try {
			const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
			if (!dbUser) {
				return res.status(404).send({error: 'User not found'});
			}
			const hashedPassword = await argon2.hash(user.password);
			const updateData = db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?');
			const result = updateData.run(user.username, hashedPassword, id);
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
			const deleteData = db.prepare('DELETE FROM users WHERE id = ?');
			const result = deleteData.run(id);
			if (result.changes === 0) {
				return res.status(404).send({ error: 'User not found' });
			}
			return {success: true, message: 'User deleted'};
		} catch(error) {
			return res.status(400).send({error: 'Could not delete user'});
		}
	})
	done();
};

export default usersController;