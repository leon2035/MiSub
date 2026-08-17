import { describe, it, expect } from 'vitest';
import { extractNodeName, extractHostAndPort } from '../../src/lib/utils.js';
import { parseNodeInfo } from '../../functions/modules/utils/geo-utils.js';

describe('mieru 节点名称提取', () => {
    it('优先使用 #fragment 作为节点名称', () => {
        expect(extractNodeName('mierus://user:pass@211.136.162.182?port=3455&profile=JP-NB-CM#jptest')).toBe('jptest');
    });

    it('没有 fragment 时回退到 profile', () => {
        expect(extractNodeName('mierus://user:pass@211.136.162.182?udp=1&transport=tcp&port=3455&profile=JP-NB-CM')).toBe('JP-NB-CM');
        expect(extractNodeName('mieru://user:pass@211.136.162.182:3455?profile=%E6%97%A5%E6%9C%AC%2001')).toBe('日本 01');
    });

    it('既无 fragment 也无 profile 时回退到服务器地址', () => {
        expect(extractNodeName('mierus://user:pass@211.136.162.182?port=3455')).toBe('211.136.162.182');
        expect(extractNodeName('mieru://user:pass@mieru.example.com:3455')).toBe('mieru.example.com');
    });
});

describe('mieru 主机与端口提取', () => {
    it('端口只写在 port 查询参数里时也能取到', () => {
        expect(extractHostAndPort('mierus://user:pass@211.136.162.182?udp=1&transport=tcp&port=3455&profile=JP-NB-CM#jptest'))
            .toEqual({ host: '211.136.162.182', port: '3455' });
    });

    it('端口写在 authority 里时正常解析', () => {
        expect(extractHostAndPort('mierus://user:pass@mieru.example.com:2999?profile=misub'))
            .toEqual({ host: 'mieru.example.com', port: '2999' });
    });

    it('端口范围取起始端口', () => {
        expect(extractHostAndPort('mierus://user:pass@1.2.3.4?port=2090-2099&protocol=TCP'))
            .toEqual({ host: '1.2.3.4', port: '2090' });
    });

    it('支持 IPv6 地址', () => {
        expect(extractHostAndPort('mierus://user:pass@[2001:db8::1]?port=3455'))
            .toEqual({ host: '2001:db8::1', port: '3455' });
        expect(extractHostAndPort('mieru://user:pass@[2001:db8::1]:3455'))
            .toEqual({ host: '2001:db8::1', port: '3455' });
    });
});

describe('mieru 节点信息解析（后端预览与去重）', () => {
    it('端口只写在查询参数里时仍能解析出服务器与端口', () => {
        expect(parseNodeInfo('mierus://0NxbOr28zU:BTBgs2XDue@211.136.162.182?udp=1&transport=tcp&port=3455&profile=JP-NB-CM#jptest'))
            .toMatchObject({ protocol: 'mierus', name: 'jptest', server: '211.136.162.182', port: '3455' });
    });

    it('端口范围取起始端口，缺少名称时回退到服务器地址而不是用户名', () => {
        expect(parseNodeInfo('mierus://user:pass@1.2.3.4?port=2090-2099&protocol=TCP'))
            .toMatchObject({ name: '1.2.3.4', server: '1.2.3.4', port: '2090' });
    });

    it('端口写在 authority 里时保持原有解析结果', () => {
        expect(parseNodeInfo('mierus://user:pass@jp.example.com:2999?profile=misub#JP'))
            .toMatchObject({ name: 'JP', server: 'jp.example.com', port: '2999' });
    });
});
