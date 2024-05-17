/* eslint-disable no-console */
import Appsignal from '@appsignal/javascript';
import type { App } from 'vue';
import env from '../env';

export function init(app: App) {
  if (env.appsignalKey) {
    const appsignal = new Appsignal({
      key: env.appsignalKey,
      revision: env.revision,
    });

    // Copied from @appsignal/vue but with location tagged
    app.config.errorHandler = (err, instance, info) => {
      const span = appsignal.createSpan();

      span
        .setAction(
          instance?.$options.name ||
            instance?.$options.__name ||
            '[Unknown Vue component]'
        )
        .setTags({
          info,
          location: window.location.href,
          appUrl: env.appUrl,
        })
        .setError(err as Error);

      appsignal.send(span);

      if (
        typeof console !== 'undefined' &&
        typeof console.error === 'function'
      ) {
        console.error(err);
      }
    };
  }
}
