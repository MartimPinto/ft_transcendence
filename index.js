import Fastify from "fastify";
import greetingsController from "./greetings-controller.js";

const fastify = Fastify({
	logger: true
});

fastify.register(greetingsController, {prefix: '/greetings'});

try {
	fastify.listen({port: 3002})
} catch(err) {
	fastify.log.error(err);
	process.exit(1);
}

