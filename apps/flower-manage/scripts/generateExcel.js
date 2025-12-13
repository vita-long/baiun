#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

/**
 * 递归遍历JSON对象，提取所有键值对
 * @param {Object} obj JSON对象
 * @param {Array<string>} path 当前路径
 * @param {Array<Array<string>>} result 结果数组
 */
function traverseJson(obj, path = [], result = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];
    if (typeof value === 'object' && value !== null) {
      traverseJson(value, currentPath, result);
    } else {
      result.push([currentPath.join('.'), value]);
    }
  }
  return result;
}

/**
 * 生成CSV文件
 * @param {Array<Array<string>>} data 数据数组
 * @param {string} outputPath 输出文件路径
 */
function generateCSV(data, outputPath) {
  // 创建CSV头部
  const header = 'key|中文|英文';
  
  // 创建CSV内容
  const rows = data.map(([key, zhValue]) => {
    // CSV转义：如果值包含|或"，需要用"包裹并转义内部的"为""
    const escapedKey = key.includes('|') || key.includes('"') ? `"${key.replace(/"/g, '""')}"` : key;
    const escapedZhValue = zhValue.includes('|') || zhValue.includes('"') ? `"${zhValue.replace(/"/g, '""')}"` : zhValue;
    return `${escapedKey}|${escapedZhValue}|`; // 英文部分留空
  });
  
  // 合并头部和内容
  const csvContent = [header, ...rows].join('\n');
  
  // 写入文件
  fs.writeFileSync(outputPath, csvContent, 'utf8');
}

/**
 * 主函数
 */
function main() {
  try {
    // 解析命令行参数
    const zhCNPath = parseArgs();
    
    // 读取zh-CN.json文件
    const zhCNContent = fs.readFileSync(zhCNPath, 'utf8');
    const zhCNConfig = JSON.parse(zhCNContent);
    
    // 遍历JSON对象，提取所有键值对
    const data = traverseJson(zhCNConfig);
    
    // 生成输出文件路径
    const outputDir = path.join(__dirname, 'files');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'translation.csv');
    
    // 生成CSV文件
    generateCSV(data, outputPath);
    
    console.log(`成功生成翻译文件: ${outputPath}`);
    console.log(`共处理了 ${data.length} 条翻译`);
    
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
main();
