declare const parse: (
    text: string,
    reviver?: ((this: any, key: string, value: any) => any) | undefined
  ) => any,
  stringify: {
    (
      value: any,
      replacer?: ((this: any, key: string, value: any) => any) | undefined,
      space?: string | number | undefined
    ): string;
    (
      value: any,
      replacer?: (string | number)[] | null | undefined,
      space?: string | number | undefined
    ): string;
  };
export { parse, stringify };
declare const _default: {
  parse: (text: string, reviver?: ((this: any, key: string, value: any) => any) | undefined) => any;
  stringify: {
    (
      value: any,
      replacer?: ((this: any, key: string, value: any) => any) | undefined,
      space?: string | number | undefined
    ): string;
    (
      value: any,
      replacer?: (string | number)[] | null | undefined,
      space?: string | number | undefined
    ): string;
  };
};
export default _default;
