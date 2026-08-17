import { describe, it, expect } from 'vitest';
import { extractNodeName } from '../../src/lib/utils.js';

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
