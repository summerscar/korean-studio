#!/usr/bin/env node

/**
 * 获取特定 tunnel 的 hostname 和 service 信息
 */

interface CloudflareTunnel {
	id: string;
	name: string;
	created_at: string;
	deleted_at: string | null;
	status: string;
	connections: Array<{
		id: string;
		origin_ip: string;
		colo_name: string;
		opened_at: string;
		client_version: string;
	}>;
}

interface CloudflareError {
	code: number;
	message: string;
}

interface CloudflareResponse {
	result: CloudflareTunnel[];
	success: boolean;
	errors: CloudflareError[];
	messages: string[];
}

interface TunnelConfig {
	tunnel_id: string;
	version: number;
	config: {
		ingress: Array<{
			service: string;
			hostname?: string;
			originRequest?: Record<string, unknown>;
		}>;
		"warp-routing"?: {
			enabled: boolean;
		};
	};
	source: string;
	created_at: string;
}

interface TunnelConfigResponse {
	result: TunnelConfig;
	success: boolean;
	errors: CloudflareError[];
	messages: string[];
}

class CloudflareHostnameExtractor {
	private apiToken: string;
	private accountId: string;
	private baseUrl: string;

	constructor(apiToken: string, accountId: string) {
		this.apiToken = apiToken;
		this.accountId = accountId;
		this.baseUrl = "https://api.cloudflare.com/client/v4";
	}

	private async makeRequest(endpoint: string, options: RequestInit = {}) {
		const url = `${this.baseUrl}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.apiToken}`,
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		if (!response.ok) {
			let errorDetails = "";
			try {
				const errorData = await response.json();
				errorDetails = JSON.stringify(errorData);
			} catch {
				errorDetails = response.statusText;
			}
			throw new Error(
				`API request failed: ${response.status} ${response.statusText} - ${errorDetails}`,
			);
		}

		return response.json();
	}

	async getTunnels(): Promise<CloudflareTunnel[]> {
		try {
			const response: CloudflareResponse = await this.makeRequest(
				`/accounts/${this.accountId}/cfd_tunnel`,
			);

			if (!response.success) {
				throw new Error(
					`API Error: ${response.errors.map((e) => e.message).join(", ")}`,
				);
			}

			return response.result;
		} catch (error) {
			console.error("Error fetching tunnels:", error);
			throw error;
		}
	}

	async getTunnelConfig(tunnelId: string): Promise<TunnelConfig> {
		try {
			const response: TunnelConfigResponse = await this.makeRequest(
				`/accounts/${this.accountId}/cfd_tunnel/${tunnelId}/configurations`,
			);

			if (!response.success) {
				throw new Error(
					`API Error: ${response.errors.map((e) => e.message).join(", ")}`,
				);
			}

			return response.result;
		} catch (error) {
			console.error("Error fetching tunnel config:", error);
			throw error;
		}
	}

	async extractHostnameInfo(tunnelId?: string) {
		try {
			const tunnels = await this.getTunnels();

			// 如果指定了 tunnelId，找到对应的 tunnel
			let targetTunnel: CloudflareTunnel | undefined;
			if (tunnelId) {
				targetTunnel = tunnels.find(
					(t) => t.id === tunnelId || t.name === tunnelId,
				);
				if (!targetTunnel) {
					console.log(`❌ Tunnel with ID/name "${tunnelId}" not found.`);
					return;
				}
			} else {
				targetTunnel = tunnels[0]; // 默认使用第一个 tunnel
			}

			if (!targetTunnel) {
				console.log("❌ No tunnels found.");
				return;
			}

			console.log(`🚇 Tunnel: ${targetTunnel.name} (${targetTunnel.id})`);
			console.log(`   Status: ${targetTunnel.status}`);
			console.log(
				`   Created: ${new Date(targetTunnel.created_at).toLocaleString("zh-CN")}\n`,
			);

			// 显示连接信息
			if (targetTunnel.connections && targetTunnel.connections.length > 0) {
				console.log(
					`🔗 Active Connections: ${targetTunnel.connections.length}`,
				);
				targetTunnel.connections.forEach((conn, index) => {
					console.log(`   ${index + 1}. ${conn.colo_name} (${conn.origin_ip})`);
					console.log(`      Client: ${conn.client_version}`);
					console.log(
						`      Opened: ${new Date(conn.opened_at).toLocaleString("zh-CN")}`,
					);
				});
				console.log("");
			} else {
				console.log("🔗 No active connections\n");
			}

			// 获取 tunnel 配置
			const config = await this.getTunnelConfig(targetTunnel.id);

			// 提取 hostname 和 service 信息
			console.log("📋 Hostname and Service Configuration:\n");

			const hostnames = config.config.ingress
				.filter((ingress) => ingress.hostname && ingress.service)
				.map((ingress, index) => ({
					index: index + 1,
					hostname: ingress.hostname,
					service: ingress.service,
				}));

			if (hostnames.length === 0) {
				console.log("   No hostname configurations found.");
				return;
			}

			// 输出所有 hostname 和 service
			hostnames.forEach((item) => {
				console.log(`   ${item.index}. ${item.hostname}`);
				console.log(`      Service: ${item.service}`);
				console.log("");
			});

			// 查找特定的 news.summerscar.me
			const newsHostname = hostnames.find(
				(item) => item.hostname === "news.summerscar.me",
			);
			if (newsHostname) {
				console.log("🎯 Specific Configuration for news.summerscar.me:");
				console.log(`   Hostname: ${newsHostname.hostname}`);
				console.log(`   Service: ${newsHostname.service}`);
				console.log(`   Tunnel Status: ${targetTunnel.status}`);
				console.log(
					`   Origin Server IP: ${targetTunnel.connections[0]?.origin_ip || "N/A"}`,
				);
				if (targetTunnel.connections.length > 0) {
					console.log(
						`   Connection Opened: ${new Date(targetTunnel.connections[0].opened_at).toLocaleString("zh-CN")}`,
					);
				}
				console.log("");
			}

			// 以 JSON 格式输出，方便复制使用
			console.log("📄 JSON Format (for easy copying):");
			console.log("");
			hostnames.forEach((item) => {
				console.log("{");
				console.log(`  "service": "${item.service}",`);
				console.log(`  "hostname": "${item.hostname}"`);
				console.log(`}${item.index < hostnames.length ? "," : ""}`);
			});
		} catch (error) {
			console.error("❌ Error:", error);
			throw error;
		}
	}
}

async function main() {
	const args = process.argv.slice(2);
	const tunnelId = args[0]; // 可选的 tunnel ID 或名称

	const apiToken = process.env.CLOUDFLARE_API_TOKEN;
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

	if (!apiToken) {
		console.error(
			"❌ Error: CLOUDFLARE_API_TOKEN environment variable is required",
		);
		process.exit(1);
	}

	if (!accountId) {
		console.error(
			"❌ Error: CLOUDFLARE_ACCOUNT_ID environment variable is required",
		);
		process.exit(1);
	}

	try {
		const extractor = new CloudflareHostnameExtractor(apiToken, accountId);
		await extractor.extractHostnameInfo(tunnelId);
	} catch (error) {
		console.error("❌ Failed to extract hostname information:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
