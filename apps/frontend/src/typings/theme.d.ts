declare module 'virtual:theme' {
  interface BaseTheme {
    fontSize: { [k: string]: [string, string] };
    borderRadius: { [k: string]: string };
    spacing: { [k: string]: string };
    lineHeight: { [k: string]: string };
  }
  const theme: BaseTheme;
  export default theme;
}
