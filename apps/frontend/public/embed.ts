import iframeResizer from 'iframe-resizer/js/iframeResizer';

if (document.currentScript?.parentNode) {
  const id = 'beabee-embed-' + Math.random().toString(36).substring(7);
  const url = document.currentScript.getAttribute('data-url');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', '__appUrl__/' + url);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('webkitallowfullscreen', '');
  iframe.setAttribute('mozallowfullscreen', '');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('id', id);
  document.currentScript.parentNode.insertBefore(
    iframe,
    document.currentScript
  );

  iframeResizer({ heightCalculationMethod: 'lowestElement' }, '#' + id);
}
