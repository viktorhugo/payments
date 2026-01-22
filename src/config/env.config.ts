import 'dotenv/config';
import * as joi from 'joi';

interface EnvironmentVariables {
  PORT: number;
  NATS_SERVERS: string[];
  STRIPE_API_KEY_SECRET: string;
  STRIPE_ENDPOINT_SECRET: string;
}

const envVarsSchema = joi
  .object<EnvironmentVariables>({
    PORT: joi.number().default(3000),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_API_KEY_SECRET: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
  })
  .unknown(true)
  .required();

const { error, value: envVars } = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
}) as { error?: joi.ValidationError; value: EnvironmentVariables };
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  STRIPE_API_KEY_SECRET: envVars.STRIPE_API_KEY_SECRET,
  STRIPE_ENDPOINT_SECRET: envVars.STRIPE_ENDPOINT_SECRET,
};
