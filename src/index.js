import Fastify from "fastify";
import greetingsController from "./routes/greetings-controller.js";
import usersController from "./routes/users-controller.js";

const fastify = Fastify({
	logger: true
});

fastify.register(greetingsController, {prefix: '/greetings'});
fastify.register(usersController, {prefix: '/users'});

try {
	fastify.listen({port: 3002})
} catch(err) {
	fastify.log.error(err);
	process.exit(1);
}

