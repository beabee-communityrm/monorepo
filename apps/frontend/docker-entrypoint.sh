#!/bin/sh

if [ ! -f /.installed ]; then
  touch /.installed

  find /usr/share/nginx/html -type f -name '*.js' -exec \
    sed -i \
      -e s#__appUrl__#$APP_BASE_URL#g \
      -e s#__apiUrl__#$API_BASE_URL#g \
      -e s#__revision__#$APP_REVISION#g \
      -e s#__version__#$APP_VERSION#g \
      -e s#__appsignalKey__#$APPSIGNAL_KEY#g \
      -e s#__captchafoxKey__#$CAPTCHAFOX_KEY#g \
      -e s#__maptilerKey__#$MAPTILER_KEY#g \
      -e s#__cnrMode__#$CNR_MODE#g \
      -e s#__experimentalFeatures__#$EXPERIMENTAL_FEATURES#g \
    {} +
fi
