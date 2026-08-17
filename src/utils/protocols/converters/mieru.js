/**
 * Mieru 配置转换为 URL
 * 输出 mieru 官方的简单分享链接（mierus://），同时保留 host:port 形式方便 MiSub 内部处理。
 * 官方解析取 url.Hostname()，authority 中的端口不会影响 mieru 客户端导入。
 */
export function convertMieruToUrl(proxy) {
    try {
        const server = proxy.server;
        const username = proxy.username || '';
        const password = proxy.password || '';
        if (!server || !username || !password) {
            return null;
        }

        const portRange = proxy['port-range'] || proxy.portRange || '';
        const hasPortRange = /^\d+-\d+$/.test(String(portRange));
        const port = Number.parseInt(String(proxy.port ?? ''), 10);
        if (!hasPortRange && !(port >= 1 && port <= 65535)) {
            return null;
        }

        // 端口范围时用起始端口填充 authority，与 mihomo 自身的地址推导保持一致
        const authorityPort = hasPortRange
            ? Number.parseInt(String(portRange).split('-')[0], 10)
            : port;
        const transport = String(proxy.transport || '').trim().toUpperCase() === 'UDP' ? 'UDP' : 'TCP';

        const params = new URLSearchParams();
        params.set('profile', proxy.profile || 'misub');
        // mieru 要求 port 与 protocol 成对出现且数量一致
        params.set('port', hasPortRange ? String(portRange) : String(port));
        params.set('protocol', transport);
        if (proxy.multiplexing) params.set('multiplexing', proxy.multiplexing);
        const handshakeMode = proxy['handshake-mode'] || proxy.handshakeMode;
        if (handshakeMode) params.set('handshake-mode', handshakeMode);
        const trafficPattern = proxy['traffic-pattern'] || proxy.trafficPattern;
        if (trafficPattern) params.set('traffic-pattern', trafficPattern);

        let serverAddr = String(server);
        if (serverAddr.includes(':') && !serverAddr.startsWith('[')) {
            serverAddr = `[${serverAddr}]`;
        }

        const auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}`;
        let url = `mierus://${auth}@${serverAddr}:${authorityPort}?${params.toString()}`;

        if (proxy.name) {
            url += `#${encodeURIComponent(proxy.name)}`;
        }

        return url;
    } catch (e) {
        console.error('Mieru转换失败:', e);
        return null;
    }
}
