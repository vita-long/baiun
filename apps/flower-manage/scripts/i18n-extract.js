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
    console.error('请提供文件路径作为参数');
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
 * 确保输出目录存在
 * @param {string} outputDir 输出目录
 */
function ensureOutputDir(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

// 移除了版本号管理逻辑

/**
 * 初始化配置文件
 * @param {string} outputDir 输出目录
 * @returns {Object} 配置文件对象
 */
function initializeConfigs(outputDir) {
  const zhCNPath = path.join(outputDir, 'zh-CN.json');

  let zhCNConfig = {};

  if (fs.existsSync(zhCNPath)) {
    zhCNConfig = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
  }

  return { zhCNConfig, zhCNPath };
}

/**
 * 移除文件内容中的所有注释
 * @param {string} content 文件内容
 * @returns {string} 移除注释后的内容
 */
function removeComments(content) {
  // 移除多行注释 /* ... */
  let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // 移除单行注释 // ...
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  // 移除JSDoc注释 /** ... */
  cleaned = cleaned.replace(/\/\*\*[\s\S]*?\*\//g, '');
  return cleaned;
}

/**
 * 解析文件路径，生成配置键的路径部分
 * @param {string} filePath 文件路径
 * @returns {Array<string>} 路径部分数组
 */
function parseFilePath(filePath) {
  const parsedPath = path.parse(filePath);
  let pathParts = parsedPath.dir.split(path.sep);

  // 找到 pages 目录的位置
  const pagesIndex = pathParts.indexOf('pages');
  if (pagesIndex !== -1) {
    pathParts = pathParts.slice(pagesIndex); // 包含 pages 目录
  } else {
    // 如果没有 pages 目录，使用默认结构
    pathParts = ['pages'];
  }

  return pathParts;
}

/**
 * 从文件内容中提取中文文本
 * @param {string} content 文件内容
 * @returns {Array<Object>} 中文文本匹配项数组
 */
function extractChineseTexts(content) {
  // 提取中文文本 - 严格按照从上到下的顺序
  const chineseRegex = /([\u4e00-\u9fa5][\u4e00-\u9fa5，。！？；：,.!?:;\s]*)/g;

  // 提取所有匹配项，保持原始顺序
  const matches = [];
  let match;
  while ((match = chineseRegex.exec(content)) !== null) {
    // 清理文本 - 去除多余的空格和换行
    let cleanedText = match[1].trim().replace(/\s+/g, ' ');
    if (cleanedText) {
      matches.push({
        text: cleanedText,
        index: match.index // 保存匹配位置，用于排序
      });
    }
  }

  // 按照在文件中出现的顺序排序
  return matches.sort((a, b) => a.index - b.index);
}

/**
 * 处理中文文本 - 去重和过滤
 * @param {Array<Object>} matches 中文文本匹配项数组
 * @returns {Array<string>} 处理后的中文文本数组
 */
function processChineseTexts(matches) {
  // 去重并过滤掉被包含的短文本，严格保持原始顺序
  const filteredTexts = [];
  const seenTexts = new Set();

  for (const matchItem of matches) {
    const text = matchItem.text;
    
    // 跳过重复文本
    if (seenTexts.has(text)) {
      continue;
    }
    seenTexts.add(text);
    
    // 检查当前文本是否包含已添加的任何文本，如果包含则移除已添加的
    const toRemove = [];
    for (let i = 0; i < filteredTexts.length; i++) {
      const existingText = filteredTexts[i];
      if (text.includes(existingText)) {
        toRemove.push(i);
      }
    }
    
    // 从后往前移除，避免索引错乱
    for (let i = toRemove.length - 1; i >= 0; i--) {
      filteredTexts.splice(toRemove[i], 1);
    }
    
    // 检查当前文本是否被已添加的任何文本包含
    const isContained = filteredTexts.some(existingText => existingText.includes(text));
    if (!isContained) {
      filteredTexts.push(text);
    }
  }

  return filteredTexts;
}

/**
 * 更新中文配置文件
 * @param {Array<string>} filteredTexts 处理后的中文文本数组
 * @param {Object} zhCNConfig 中文配置文件
 * @param {Array<string>} pathParts 路径部分数组
 */
function updateConfigFiles(filteredTexts, zhCNConfig, pathParts) {
  for (const [index, text] of filteredTexts.entries()) {
    const key = `index_${index}`;
    let currentObjZh = zhCNConfig;

    // 创建嵌套结构
    pathParts.forEach(part => {
      if (!currentObjZh[part]) {
        currentObjZh[part] = {};
      }
      currentObjZh = currentObjZh[part];
    });

    // 设置中文值
    if (!currentObjZh[key]) {
      currentObjZh[key] = text;
    }
  }
}

// 移除了差异文件生成逻辑

/**
 * 保存最终的中文配置文件
 * @param {Object} zhCNConfig 中文配置文件
 * @param {string} zhCNPath 中文配置文件路径
 */
function saveFinalConfig(zhCNConfig, zhCNPath) {
  // 只保存最终的中文配置文件
  fs.writeFileSync(zhCNPath, JSON.stringify(zhCNConfig, null, 2), 'utf8');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 解析命令行参数
    const filePath = parseArgs();

    // 确保输出目录存在
    const outputDir = path.join(__dirname, 'files');
    ensureOutputDir(outputDir);

    // 初始化配置文件
    const zhCNPath = path.join(outputDir, 'zh-CN.json');
    let zhCNConfig = {};
    if (fs.existsSync(zhCNPath)) {
      zhCNConfig = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
    }

    // 读取目标文件内容并移除注释
    let fileContent = fs.readFileSync(filePath, 'utf8');
    fileContent = removeComments(fileContent);

    // 解析文件路径，生成配置键的路径部分
    const pathParts = parseFilePath(filePath);

    // 提取中文文本
    const matches = extractChineseTexts(fileContent);

    // 处理中文文本
    const filteredTexts = processChineseTexts(matches);

    // 更新配置文件
    updateConfigFiles(filteredTexts, zhCNConfig, pathParts);

    // 保存最终配置文件
    saveFinalConfig(zhCNConfig, zhCNPath);

    // 输出结果
    console.log(`成功处理文件: ${filePath}`);
    console.log(`生成的中文配置文件位于: ${zhCNPath}`);
    console.log(`提取了 ${filteredTexts.length} 个中文文本`);
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
main();
