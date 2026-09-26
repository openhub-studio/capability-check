/* DOM helpers — typed getElementById / querySelector that throw on miss. */

export function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} not found`);
  return node as T;
}

export function mustQuery<T extends Element>(
  root: ParentNode,
  sel: string,
): T {
  const node = root.querySelector<T>(sel);
  if (!node) throw new Error(`${sel} not found`);
  return node;
}
