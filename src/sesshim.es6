/*global module require*/

module.exports = (function(){
  "use strict";

  const def = Object.freeze;

  function confine(exprSrc, env) {
    exprSrc = ''+exprSrc;
    const names = Object.getOwnPropertyNames(env);
    // Note: no newline prior to ${exprSrc}, so that line numbers for
    // errors within exprSrc are accurate. Column numbers on the first
    // line won't be, but will on following lines.
    let closedFuncSrc =
`(function(${names.join(',')}) { "use strict"; return (${exprSrc});
})
//# sourceURL=data:${encodeURIComponent(exprSrc)}
`;
    const closedFunc = (1,eval)(closedFuncSrc);
    return closedFunc(...names.map(n => env[n]));
  }

  return def({
    def, confine
  });
}());
