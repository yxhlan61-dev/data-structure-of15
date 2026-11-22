"""核对两域名的 DNS、HTTPS、生产提交与全部静态资源；不需要 Cloudflare 密钥。"""
import concurrent.futures
import hashlib
import json
import re
import subprocess
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COMMIT = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
DOMAINS = ['buaalearningplatform415.top', 'www.buaalearningplatform415.top']


def request(url, accept=None):
    headers = {'User-Agent': 'DS-Review-Release-Verification/1.0', 'Cache-Control': 'no-cache'}
    if accept:
        headers['Accept'] = accept
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=15) as response:
                assert response.status == 200, (url, response.status)
                return response.read()
        except (OSError, urllib.error.URLError):
            if attempt == 3:
                raise
            time.sleep(1)


def verify(domain):
    dns = json.loads(request('https://cloudflare-dns.com/dns-query?name=' + domain + '&type=A', 'application/dns-json'))
    assert dns['Status'] == 0 and dns.get('Answer'), (domain, dns)
    base = 'https://' + domain + '/'
    manifest = json.loads(request(base + 'revision.json?verify=' + COMMIT))
    assert manifest['commit'] == COMMIT, (domain, 'commit mismatch', manifest['commit'], COMMIT)
    tracked = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=ROOT, text=True).splitlines()
    expected = {p for p in tracked if p in ('index.html', 'favicon.svg') or p.startswith(('src/', 'styles/', 'assets/'))}
    assert set(manifest['assets']) == expected, (domain, 'manifest asset set mismatch')

    def asset(item):
        path, digest = item
        # 以 Git blob 比较，排除 Windows 工作区 CRLF 与生产 LF 的差异。
        blob = subprocess.check_output(['git', 'show', 'HEAD:' + path], cwd=ROOT)
        assert hashlib.sha256(blob).hexdigest() == digest, (path, 'manifest differs from commit')
        data = request(base + ('' if path == 'index.html' else path) + '?verify=' + COMMIT)
        if path == 'index.html':
            # Cloudflare 已有 Web Analytics 自动注入；只去除此固定来源的信标。
            # 不忽略其他新增脚本/HTML 或任意内容差异。
            data = re.sub(rb'<script\b[^>]*\bsrc="https://static\.cloudflareinsights\.com/beacon\.min\.js/[^"<>]+"[^>]*></script>\r?\n?', b'', data)
        assert hashlib.sha256(data).hexdigest() == digest, (domain, path, 'served content mismatch')
        return path

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        verified = list(pool.map(asset, manifest['assets'].items()))
    return {'domain': domain, 'dns': dns['Answer'], 'https': 200, 'commit': COMMIT, 'verifiedAssets': len(verified)}


if __name__ == '__main__':
    for hostname in DOMAINS:
        print(json.dumps(verify(hostname), ensure_ascii=False), flush=True)
