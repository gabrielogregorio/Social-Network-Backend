module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@/controllers': './src/controllers',
          '@/factories': './src/factories',
          '@/middlewares': './src/middlewares',
          '@/models': './src/models',
          '@/services': './src/services',
          '@/util': './src/util',
          '@/interfaces': './src/interfaces',
          '@/locales': './src/locales',
          '@/handlers': './src/handlers',
        },
      },
    ],
  ],
  ignore: ['**/*.spec.ts', '**/*.test.ts'],
};
