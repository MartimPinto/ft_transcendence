import Fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import usersController from "./routes/users-controller.js";
import path from "path";

const fastify = Fastify({
	logger: true
});

fastify.register(fastifyHelmet, {global: true});
fastify.register(fastifyCors, {
    origin: 'http://localhost:8080', // Permitir requisições apenas de http://localhost:8080
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), 'public'),  // optional: default '/'
});
fastify.register(usersController, {prefix: '/users'});



try {
	fastify.listen({port: 3000, host: '0.0.0.0'})
} catch(err) {
	fastify.log.error(err);
	process.exit(1);
}

