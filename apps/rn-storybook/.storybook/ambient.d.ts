// The generated storybook.requires.ts refers to `global`, which React Native provides at runtime but
// whose typing lives in @types/node. Declare it here rather than pull in Node's types for one name.
declare var global: typeof globalThis & Record<string, unknown>;
