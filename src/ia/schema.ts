import { ZodObject } from 'zod';
import { Tools } from './tools';

export function collectTools(instance: Tools) {
  const tools: Record<string, SdkTools> = {};

  for (const key of Object.keys(instance)) {
    const value = instance[key];
    if (
      typeof value === 'function' ||
      typeof value !== 'object' ||
      !key.includes('Tool')
    )
      continue;
    tools[key] = value;
  }

  return tools;
}

type SdkTools = {
  description: string;
  execute: () => Promise<any>;
  parameters: ZodObject<any>;
};
