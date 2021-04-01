// @ts-check

export const harden = Object.freeze;

export const confine = (exprSrc, env) => {
  const names = Object.getOwnPropertyNames(env);

  // Note: no newline prior to ${exprSrc}, so that line numbers for
  // errors within exprSrc are accurate. Column numbers on the first
  // line won't be, but will on following lines.
  const functionBody = `"use strict"; return ${exprSrc};`;
  const closedFunc = new Function(...names, functionBody);

  return closedFunc(...names.map(n => env[n]));
};
