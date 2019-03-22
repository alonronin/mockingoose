type Narrowable = string | number | boolean | symbol | 
  object | {} | void | null | undefined;

/**
 * Create a tuple from the arguments
 * @param args 
 * @internal
 */
export const tuple = <T extends Narrowable[]>(...args: T)=>args;