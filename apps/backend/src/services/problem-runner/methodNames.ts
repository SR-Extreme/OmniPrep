function slugToCamelCase(slug: string): string {
    const parts = slug.split("-");
    return parts
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join("");
}

export function methodNameForSlug(slug: string): string {
    return slugToCamelCase(slug);
}
