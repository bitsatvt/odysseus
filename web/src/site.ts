const productionPath = "/vt";

export const productionSiteUrl = `https://odyadvisor.com${productionPath}`;

export function sitePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${process.env.NODE_ENV === "production" ? productionPath : ""}${normalizedPath}`;
}
