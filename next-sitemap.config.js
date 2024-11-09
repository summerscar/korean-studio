/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXTAUTH_URL || "https://example.com",
	sitemapSize: 7000,
	generateRobotsTxt: true,
	// ...other options
};
