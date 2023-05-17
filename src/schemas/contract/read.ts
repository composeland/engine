import { Static, Type } from '@sinclair/typebox';
import { schemaTypes } from '../../sharedApiSchemas';

/**
 * Basic schema for all Request Body String
 */
export const readRequestBodySchema = Type.Object({
  function_name: Type.String({
    description: 'Name of the function to call on Contract',
    examples: ["balanceOf"]
  }),
  args: Type.Optional(Type.String({
    description: 'Arguments for the function. Comma Separated',
    examples:[""]
   })),
});

export interface readSchema extends schemaTypes {
  Querystring: Static<typeof readRequestBodySchema>;
}