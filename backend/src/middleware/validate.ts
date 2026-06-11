import { Request, Response, NextFunction } from 'express';

type Rule = {
  type?: 'string' | 'number' | 'email' | 'uuid';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
};

type Schema = Record<string, Rule>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value: unknown): string {
  return String(value)
    .replace(/[<>]/g, '')       // strip angle brackets (XSS)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // strip control chars
    .trim();
}

export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(schema)) {
      const raw = req.body[field];

      if (rule.required && (raw === undefined || raw === null || raw === '')) {
        errors.push(`Le champ "${field}" est requis.`);
        continue;
      }
      if (!rule.required && (raw === undefined || raw === null)) continue;

      if (rule.type === 'string' || rule.type === 'email') {
        if (typeof raw !== 'string') { errors.push(`"${field}" doit être une chaîne.`); continue; }
        req.body[field] = sanitizeString(raw);
        const val: string = req.body[field];
        if (rule.minLength && val.length < rule.minLength)
          errors.push(`"${field}" doit contenir au moins ${rule.minLength} caractères.`);
        if (rule.maxLength && val.length > rule.maxLength)
          errors.push(`"${field}" ne peut pas dépasser ${rule.maxLength} caractères.`);
        if (rule.type === 'email' && !EMAIL_RE.test(val))
          errors.push(`"${field}" doit être une adresse email valide.`);
        if (rule.pattern && !rule.pattern.test(val))
          errors.push(`"${field}" a un format invalide.`);
      }

      if (rule.type === 'uuid') {
        if (typeof raw !== 'string' || !UUID_RE.test(raw))
          errors.push(`"${field}" doit être un UUID valide.`);
      }

      if (rule.type === 'number') {
        const num = Number(raw);
        if (isNaN(num)) { errors.push(`"${field}" doit être un nombre.`); continue; }
        req.body[field] = num;
        if (rule.min !== undefined && num < rule.min)
          errors.push(`"${field}" doit être au moins ${rule.min}.`);
        if (rule.max !== undefined && num > rule.max)
          errors.push(`"${field}" ne peut pas dépasser ${rule.max}.`);
      }
    }

    if (errors.length > 0)
      return res.status(400).json({ error: 'Validation échouée.', details: errors });

    next();
  };
}

// Pre-built schemas for reuse
export const schemas = {
  register: {
    name:             { type: 'string', required: true, minLength: 2, maxLength: 100 },
    email:            { type: 'email',  required: true },
    password:         { type: 'string', required: true, minLength: 8, maxLength: 128 },
  } as Schema,

  login: {
    email:    { type: 'email',  required: true },
    password: { type: 'string', required: true, minLength: 1 },
  } as Schema,

  requestTrip: {
    pickupLocation:  { type: 'string', required: true, minLength: 2, maxLength: 255 },
    dropoffLocation: { type: 'string', required: true, minLength: 2, maxLength: 255 },
  } as Schema,

  submitReview: {
    tripId: { type: 'uuid',   required: true },
    rating: { type: 'number', required: true, min: 1, max: 5 },
    comment:{ type: 'string', required: false, maxLength: 500 },
  } as Schema,

  fileComplaint: {
    tripId:      { type: 'uuid',   required: true },
    reason:      { type: 'string', required: true, minLength: 3, maxLength: 255 },
    description: { type: 'string', required: false, maxLength: 1000 },
  } as Schema,
};
