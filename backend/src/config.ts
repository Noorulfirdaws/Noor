import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized, fail-fast configuration.
 * The server refuses to boot if a required secret is missing, so we never
 * fall back to a hardcoded/predictable value that an attacker could exploit.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `[config] Variable d'environnement manquante: ${name}. ` +
      `Définissez-la dans .env avant de démarrer le serveur.`
    );
  }
  return value;
}

// In development we allow a generated ephemeral JWT secret so local runs work,
// but production (NODE_ENV=production) MUST provide a strong one.
function jwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.trim() !== '') return fromEnv;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[config] JWT_SECRET est obligatoire en production.');
  }
  console.warn('[config] JWT_SECRET non défini — secret éphémère généré (dev uniquement).');
  return require('crypto').randomBytes(48).toString('hex');
}

export const JWT_SECRET = jwtSecret();

export const DB = {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'djibtaxi',
  user:     process.env.DB_USER || 'postgres',
  // No hardcoded fallback password — required so a default never ships.
  password: required('DB_PASSWORD'),
};
