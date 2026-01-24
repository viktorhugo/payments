import 'dotenv/config';
import * as joi from 'joi';

interface EnvironmentVariables {
  PORT: number;
  NATS_SERVERS: string[];
  STRIPE_API_KEY_SECRET: string;
  STRIPE_WEBHOOK_SIGNING_SECRET: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
}

const envVarsSchema = joi
  .object<EnvironmentVariables>({
    PORT: joi.number().default(3000),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_API_KEY_SECRET: joi.string().required(),
    STRIPE_WEBHOOK_SIGNING_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
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
  stripeApiKeySecret: envVars.STRIPE_API_KEY_SECRET,
  stripeWebhookSigningSecret: envVars.STRIPE_WEBHOOK_SIGNING_SECRET,
  stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
  stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
};
