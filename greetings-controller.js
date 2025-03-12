const responseSchema = {
	response: {
		200: {
			properties: {
				message: { type: 'string' }
			},
			required: ['message']
		}
	}
};

const greetingsController = (fastify, options, done) => {
	
	fastify.get('/', {schema: responseSchema}, (req, res) => {
		return {
			message: 'Hello World!'
		};
	});
	
	fastify.get('/:name', {schema: responseSchema}, (req, res) => {
		return {
			message: `Hello ${req.params.name}`
		};
	});
	done();
};

export default greetingsController;