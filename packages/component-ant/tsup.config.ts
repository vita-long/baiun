import { defineConfig } from 'tsup';

export default defineConfig({
  // 仅指定主入口文件，避免遍历所有组件文件
  entry: ['src/index.tsx'],
  outDir: 'dist',
  dts: true,
  clean: true, // 构建前清理输出目录
  sourcemap: true, // 生成JS文件的源映射
  format: ['esm'], // 支持两种模块格式
  external: ['react', 'react-dom', 'antd'], // 外部依赖不打包
  splitting: false, // 不分割代码
  bundle: true, // 打包代码
  tsconfig: 'tsconfig.json', // 使用项目的tsconfig.json
})