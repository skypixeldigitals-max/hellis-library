// Retired: Sarasavi's sitemap is outdated (most product links 404), so the site links to Sarasavi's
// live search page instead. Kept as a no-op so old callers get a clear answer.
Deno.serve(() => new Response(JSON.stringify({ retired: true }), { status: 410, headers: { 'Content-Type': 'application/json' } }));
