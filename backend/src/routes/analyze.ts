import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { analyzeText } from '../services/gemini';

const AnalyzeRequestSchema = z.object({
  text: z.string().min(1),
});

export async function analyzeRoutes(fastify: FastifyInstance) {
  fastify.post('/analyze', async (request, reply) => {
    try {
      const body = AnalyzeRequestSchema.parse(request.body);
      const result = await analyzeText(body.text);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({ error: 'Validation Error', details: error.errors });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  });
}
