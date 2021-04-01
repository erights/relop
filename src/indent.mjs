// @ts-check

export const indent = (template, ...substs) => {
  const parts = [];
  let newnewline = '\n';
  for (let i = 0, ilen = substs.length; i < ilen; i++) {
    let segment = template[i];
    if (i == 0 && segment.startsWith('\n')) {
      segment = segment.substr(1);
    }
    parts.push(segment);

    let subst = `${substs[i]}`;
    const lastnl = segment.lastIndexOf('\n');
    if (true || lastnl >= 0) {
      newnewline = `\n${' '.repeat(segment.length - lastnl - 1)}`;
      subst = subst.replace(/\n/g, newnewline);
    }
    parts.push(subst);
  }
  parts.push(template[substs.length]);
  return parts.join('');
};
