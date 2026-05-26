declare module "*.json" {
  const value: {
    [key: string]: string | { [key: string]: string } | string[];
  };
  export default value;
}

declare global {
  function initYM(): void;
}

export {};
