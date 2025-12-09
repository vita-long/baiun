import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    sourcemap: true,
    clean: false, // 禁用自动清理，避免删除类型文件
    format: ['esm', 'cjs'], // 同时支持ES模块和CommonJS
    dts: false, // 使用tsc单独生成类型文件
    outDir: 'dist',
    // 处理外部依赖，不打包axios等
    external: ['axios'],
  }
})