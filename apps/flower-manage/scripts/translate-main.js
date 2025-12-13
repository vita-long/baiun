#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateText, getTranslationApiCallCount } from './translate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 解析命令行参数
 * @returns {string} 文件路径
 */
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('请提供zh-CN.json文件路径作为参数');
    process.exit(1);
  }

  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }

  return filePath;
}

// 移除了版本号管理逻辑

// 移除了差异文件生成逻辑

/**
 * 递归翻译JSON对象中的中文文本
 * @param {Object} zhObj 中文JSON对象
 * @param {Object} enObj 英文JSON对象
 * @returns {Promise<Object>} 翻译后的英文JSON对象
 */
async function translateJson(zhObj, enObj = {}) {
  for (const [key, value] of Object.entries(zhObj)) {
    if (typeof value === 'object' && value !== null) {
      // 如果目标对象中没有该键，创建一个空对象
      if (!enObj[key]) {
        enObj[key] = {};
      }
      // 递归翻译子对象
      await translateJson(value, enObj[key]);
    } else if (typeof value === 'string' && value) {
      // 如果已经有翻译，跳过
      if (!enObj[key]) {
        // 翻译文本
        const translatedText = await translateText(value);
        enObj[key] = translatedText;
        console.log(`翻译完成: ${value} -> ${translatedText}`);
      } else {
        console.log(`跳过已翻译文本: ${value}`);
      }
    }
  }
  return enObj;
}

/**
 * 保存最终的英文配置文件
 * @param {Object} enUSConfig 英文配置文件
 * @param {string} enUSPath 英文配置文件路径
 */
function saveFinalConfig(enUSConfig, enUSPath) {
  // 只保存最终的英文配置文件
  fs.writeFileSync(enUSPath, JSON.stringify(enUSConfig, null, 2), 'utf8');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 解析命令行参数
    const zhCNPath = parseArgs();
    
    // 确保输出目录存在
    const outputDir = path.join(__dirname, 'files');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 初始化配置文件
    const enUSPath = path.join(outputDir, 'en-US.json');
    let enUSConfig = {};

    if (fs.existsSync(enUSPath)) {
      enUSConfig = JSON.parse(fs.readFileSync(enUSPath, 'utf8'));
    }

    // 读取中文配置文件
    const zhCNConfig = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));

    // 翻译中文文本
    console.log('开始翻译中文文本...');
    const translatedConfig = await translateJson(zhCNConfig, enUSConfig);

    // 保存最终配置文件
    saveFinalConfig(translatedConfig, enUSPath);

    // 输出结果
    console.log('\n=== 翻译完成 ===');
    console.log(`成功生成英文配置文件: ${enUSPath}`);
    console.log(`翻译API调用次数: ${getTranslationApiCallCount()}`);
    console.log('✅ 翻译任务完成！');

  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
main();
