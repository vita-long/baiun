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
 * 从文件内容中提取中文文本（排除注释中的文本）
 * @param {string} content 文件内容
 * @returns {Array<Object>} 中文文本匹配项数组
 */
function extractChineseTexts(content) {
  // 先处理单行和多行注释，用占位符替换
  const commentPlaceholders = [];
  let contentWithoutComments = content;
  
  // 替换单行注释
  contentWithoutComments = contentWithoutComments.replace(/\/\/.*$/gm, (match) => {
    const placeholder = `__COMMENT_PLACEHOLDER_${commentPlaceholders.length}__`;
    commentPlaceholders.push({ placeholder, content: match });
    return placeholder;
  });
  
  // 替换多行注释
  contentWithoutComments = contentWithoutComments.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const placeholder = `__COMMENT_PLACEHOLDER_${commentPlaceholders.length}__`;
    commentPlaceholders.push({ placeholder, content: match });
    return placeholder;
  });
  
  // 提取中文文本
  const matches = [];
  
  // 1. 匹配引号中的中文（JSX属性和字符串）
  const quotedChineseRegex = /(['"`])([\u4e00-\u9fa5][\u4e00-\u9fa5，。！？；：,.!?:;\s]*[\u4e00-\u9fa5])\1/g;
  let match;
  
  while ((match = quotedChineseRegex.exec(contentWithoutComments)) !== null) {
    const cleanedText = match[2].trim().replace(/\s+/g, ' ');
    if (cleanedText) {
      const preContext = contentWithoutComments.substring(0, match.index);
      const isJSXAttribute = /[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*$/.test(preContext);
      
      let actualIndex = match.index;
      for (const { placeholder, content } of commentPlaceholders) {
        if (match.index > contentWithoutComments.indexOf(placeholder)) {
          actualIndex += (content.length - placeholder.length);
        }
      }
      
      matches.push({
        text: cleanedText,
        originalText: match[0],
        isJSXAttribute: isJSXAttribute,
        index: actualIndex
      });
    }
  }
  
  // 2. 匹配JSX内容中的中文（如 <h2>中文</h2>）
  const jsxContentChineseRegex = />([^<>]*[\u4e00-\u9fa5][\u4e00-\u9fa5，。！？；：,.!?:;\s]*[\u4e00-\u9fa5][^<>]*)<\//g;
  
  while ((match = jsxContentChineseRegex.exec(contentWithoutComments)) !== null) {
    const cleanedText = match[1].trim().replace(/\s+/g, ' ');
    if (cleanedText && /[\u4e00-\u9fa5]/.test(cleanedText)) {
      const preContext = contentWithoutComments.substring(0, match.index);
      const isJSXAttribute = false;
      
      let actualIndex = match.index + 1; // +1 to get inside the tag
      for (const { placeholder, content } of commentPlaceholders) {
        if (match.index > contentWithoutComments.indexOf(placeholder)) {
          actualIndex += (content.length - placeholder.length);
        }
      }
      
      matches.push({
        text: cleanedText,
        originalText: match[1],
        isJSXAttribute: isJSXAttribute,
        index: actualIndex
      });
    }
  }
  
  // 按位置排序
  return matches.sort((a, b) => a.index - b.index);
}

/**
 * 处理中文文本 - 去重
 * @param {Array<Object>} matches 中文文本匹配项数组
 * @returns {Array<Object>} 处理后的中文文本数组
 */
function processChineseTexts(matches) {
  // 去重，严格保持原始顺序
  const filteredTexts = [];
  const seenTexts = new Set();

  for (const matchItem of matches) {
    const text = matchItem.text;
    
    // 跳过重复文本
    if (seenTexts.has(text)) {
      continue;
    }
    seenTexts.add(text);
    filteredTexts.push(matchItem);
  }

  return filteredTexts;
}

/**
 * 生成配置文件中的key
 * @param {Array<string>} pathParts 路径部分数组
 * @param {number} index 索引
 * @returns {string} 配置文件中的key
 */
function generateKey(pathParts, index) {
  return pathParts.join('.') + `.index_${index}`;
}

/**
 * 替换文件中的中文文本为t('key')语法
 * @param {string} content 文件内容
 * @param {Array<Object>} filteredTexts 处理后的中文文本数组
 * @param {Array<string>} pathParts 路径部分数组
 * @returns {string} 替换后的文件内容
 */
function replaceChineseWithTFunction(content, filteredTexts, pathParts) {
  let result = content;
  // 从后往前替换，避免索引错乱
  for (let i = filteredTexts.length - 1; i >= 0; i--) {
    const matchItem = filteredTexts[i];
    const key = generateKey(pathParts, i);
    const tFunctionCall = `t('${key}')`;
    
    // 判断是否在JSX标签内（包括属性和内容）
    const isInJSX = matchItem.isJSXAttribute || 
                    (content.substring(matchItem.index - 1, matchItem.index) === '>' && 
                     content.substring(matchItem.index + matchItem.originalText.length, matchItem.index + matchItem.originalText.length + 1) === '<');
    
    if (matchItem.isJSXAttribute) {
      // 对于JSX属性（如 title="中文"），替换为 title={t('key')}
      result = result.substring(0, matchItem.index) + `{${tFunctionCall}}` + result.substring(matchItem.index + matchItem.originalText.length);
    } else if (isInJSX) {
      // 对于JSX内容（如 <Button>中文</Button>），替换为 <Button>{t('key')}</Button>
      result = result.substring(0, matchItem.index) + `{${tFunctionCall}}` + result.substring(matchItem.index + matchItem.originalText.length);
    } else {
      // 对于普通JavaScript字符串（如 const text = "中文"），替换为 const text = t('key')
      result = result.substring(0, matchItem.index) + tFunctionCall + result.substring(matchItem.index + matchItem.originalText.length);
    }
  }
  return result;
}

/**
 * 检查文件是否已经导入了useTranslation hook
 * @param {string} content 文件内容
 * @returns {boolean} 是否已导入
 */
function hasUseTranslationImport(content) {
  // 检查是否有从 react-i18next 导入 useTranslation 的语句
  return /import.*useTranslation.*from.*react-i18next/.test(content);
}

/**
 * 检查文件是否已经声明了t函数
 * @param {string} content 文件内容
 * @returns {boolean} 是否已声明
 */
function hasTFunctionDeclaration(content) {
  // 检查是否有 const { t } = useTranslation(); 语句
  return /const\s+\{\s*t\s*\}\s*=\s*useTranslation\(\)/.test(content);
}

/**
 * 添加useTranslation hook导入
 * @param {string} content 文件内容
 * @returns {string} 添加导入后的文件内容
 */
function addUseTranslationImport(content) {
  // 检查是否有import语句
  const importRegex = /^import.*from.*$/gm;
  const matches = content.match(importRegex);
  
  if (matches && matches.length > 0) {
    // 在最后一个import语句后添加useTranslation导入
    const lastImportIndex = content.lastIndexOf(matches[matches.length - 1]);
    const importEndIndex = content.indexOf(';', lastImportIndex) + 1;
    
    const importStatement = "\nimport { useTranslation } from 'react-i18next';";
    return content.substring(0, importEndIndex) + importStatement + content.substring(importEndIndex);
  } else {
    // 在文件开头添加useTranslation导入
    return "import { useTranslation } from 'react-i18next';\n\n" + content;
  }
}

/**
 * 在组件函数顶部添加t函数声明
 * @param {string} content 文件内容
 * @returns {string} 添加声明后的文件内容
 */
function addTFunctionDeclaration(content) {
  // 查找组件函数声明（如 const ComponentName: React.FC = () => {）
  const componentRegex = /(const\s+\w+:\s+React\.FC\s*=\s*\(\)\s*=>\s*\{)|(function\s+\w+\s*\(\)\s*\{)/;
  const match = componentRegex.exec(content);
  
  if (match) {
    // 在组件函数开始处添加t函数声明
    const componentStartIndex = match.index + match[0].length;
    const tDeclaration = "\n  const { t } = useTranslation();\n";
    return content.substring(0, componentStartIndex) + tDeclaration + content.substring(componentStartIndex);
  } else {
    // 如果没有找到组件函数声明，返回原内容
    console.warn('未找到组件函数声明，无法添加t函数声明');
    return content;
  }
}

/**
 * 主函数
 */
function main() {
  try {
    // 解析命令行参数
    const filePath = parseArgs();
    
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 解析文件路径，生成配置键的路径部分
    const pathParts = parseFilePath(filePath);
    
    // 提取中文文本
    const matches = extractChineseTexts(content);
    
    // 处理中文文本
    const filteredTexts = processChineseTexts(matches);
    
    // 替换中文文本为t('key')语法
    const contentWithTFunction = replaceChineseWithTFunction(content, filteredTexts, pathParts);
    
    // 添加useTranslation导入（如果需要）
    let finalContent = hasUseTranslationImport(contentWithTFunction) 
      ? contentWithTFunction 
      : addUseTranslationImport(contentWithTFunction);
    
    // 添加t函数声明（如果需要）
    finalContent = hasTFunctionDeclaration(finalContent) 
      ? finalContent 
      : addTFunctionDeclaration(finalContent);
    
    // 保存修改后的文件
    fs.writeFileSync(filePath, finalContent, 'utf8');
    
    console.log(`成功处理文件: ${filePath}`);
    console.log(`替换了 ${filteredTexts.length} 个中文文本`);
    
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
main();
