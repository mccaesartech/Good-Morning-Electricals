-- Re-assert RPC grant after function replacements in migrations 022/023
GRANT EXECUTE ON FUNCTION get_published_site_content() TO anon, authenticated;
