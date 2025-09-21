import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getShareV1AppWidgetInfo } from './request/ShareApp';
import { middleware as homeMiddleware } from './middleware/home';

const proxyShare = async (request: NextRequest) => {
  // 转发到 process.env.TARGET
  const kb_id = request.headers.get('x-kb-id') || process.env.DEV_KB_ID || '';

  const targetOrigin = process.env.TARGET!;
  const targetUrl = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    targetOrigin,
  );
  // 构造 fetch 选项
  const fetchHeaders = new Headers();
  
  // 只复制必要的请求头，避免复制可能导致问题的头字段
  const allowedHeaders = [
    'accept',
    'accept-language',
    'accept-encoding',
    'user-agent',
    'content-type',
    'authorization',
    'x-forwarded-for',
    'x-real-ip',
    'x-forwarded-proto',
    'x-forwarded-host',
    'x-forwarded-port',
    'x-requested-with',
    'referer',
    'origin',
    'cache-control',
    'pragma',
    'if-modified-since',
    'if-none-match',
    'if-match',
    'if-unmodified-since',
    'range',
    'if-range',
  ];
  
  // 复制允许的请求头
  for (const header of allowedHeaders) {
    const value = request.headers.get(header);
    if (value) {
      fetchHeaders.set(header, value);
    }
  }
  
  // 设置必要的自定义头
  fetchHeaders.set('x-kb-id', kb_id);

  const fetchOptions: RequestInit = {
    method: request.method,
    headers: fetchHeaders,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  };
  const proxyRes = await fetch(targetUrl.toString(), fetchOptions);
  const nextRes = new NextResponse(proxyRes.body, {
    status: proxyRes.status,
    headers: proxyRes.headers,
    statusText: proxyRes.statusText,
  });
  return nextRes;
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  if (pathname.startsWith('/widget')) {
    const widgetInfo: any = await getShareV1AppWidgetInfo();
    if (widgetInfo) {
      if (!widgetInfo?.settings?.widget_bot_settings?.is_open) {
        return NextResponse.rewrite(new URL('/not-fount', request.url));
      }
    }
    return;
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key] = value;
  }

  let sessionId = request.cookies.get('x-pw-session-id')?.value || '';
  let needSetSessionId = false;

  if (!sessionId) {
    sessionId = uuidv4();
    needSetSessionId = true;
  }

  let response: NextResponse;

  if (pathname.startsWith('/share/')) {
    response = await proxyShare(request);
  } else {
    response = await homeMiddleware(request, headers, sessionId);
  }

  if (needSetSessionId) {
    response.cookies.set('x-pw-session-id', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365, // 1 年
    });
  }
  if (!pathname.startsWith('/share')) {
    response.headers.set('x-current-path', pathname);
    response.headers.set('x-current-search', url.search);
  }
  return response;
}

export const config = {
  matcher: [
    '/',
    '/share/:path*',
    '/chat/:path*',
    '/widget',
    '/welcome',
    '/auth/login',
    '/node/:path*',
    // '/client/:path*',
  ],
};
