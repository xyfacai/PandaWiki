// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// 只在生产环境下启用 Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://88c396fc9b383382005465cfc9120e5d@sentry.baizhi.cloud/5',

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],
    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}

// 只在生产环境下导出路由转换捕获函数
export const onRouterTransitionStart =
  process.env.NODE_ENV === 'production'
    ? Sentry.captureRouterTransitionStart
    : undefined;
