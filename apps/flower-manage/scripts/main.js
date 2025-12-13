#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 解析命令行参数
 * @returns {string} 文件路径
 */
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('请提供要处理的文件路径作为参数');
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
 * 执行命令并显示输出
 * @param {string} command 要执行的命令
 * @param {string} description 命令描述
 */
function executeCommand(command, description) {
  console.log(`\n=== ${description} ===`);
  console.log(`执行命令: ${command}`);
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    console.log(`✅ ${description} 完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 失败`);
    console.error(`错误信息: ${error.message}`);
    console.error(`命令输出: ${error.stdout}`);
    console.error(`错误输出: ${error.stderr}`);
    return false;
  }
}

/**
 * 主协调函数
 */
function main() {
  console.log('=== 开始执行 i18n 自动化脚本 ===');
  
  try {
    // 解析命令行参数
    const filePath = parseArgs();
    console.log(`要处理的文件: ${filePath}`);
    
    // 步骤 1: 提取中文文本，生成 zh-CN.json
    const extractSuccess = executeCommand(
      `node ${path.join(__dirname, 'i18n-extract.js')} ${filePath}`,
      '步骤 1: 提取中文文本，生成 zh-CN.json'
    );
    
    if (!extractSuccess) {
      console.error('步骤 1 失败，终止执行');
      process.exit(1);
    }
    
    // 步骤 2: 替换中文文本为 t('key') 语法
    const formatSuccess = executeCommand(
      `node ${path.join(__dirname, 'formatLanguage.js')} ${filePath}`,
      '步骤 2: 替换中文文本为 t(\'key\') 语法'
    );
    
    if (!formatSuccess) {
      console.error('步骤 2 失败，终止执行');
      process.exit(1);
    }
    
    // 步骤 3: 生成 Excel 文件
    const zhCNPath = path.join(__dirname, 'files', 'zh-CN.json');
    const generateExcelSuccess = executeCommand(
      `node ${path.join(__dirname, 'generateExcel.js')} ${zhCNPath}`,
      '步骤 3: 生成 Excel 文件'
    );
    
    if (!generateExcelSuccess) {
      console.error('步骤 3 失败，终止执行');
      process.exit(1);
    }
    
    // 步骤 4: 翻译中文文本为英文，生成 en-US.json
    const translateSuccess = executeCommand(
      `node ${path.join(__dirname, 'translate-main.js')} ${zhCNPath}`,
      '步骤 4: 翻译中文文本为英文，生成 en-US.json'
    );
    
    if (!translateSuccess) {
      console.error('步骤 4 失败，终止执行');
      process.exit(1);
    }
    
    console.log('\n=== 所有步骤执行完成 ===');
    console.log('✅ i18n 自动化脚本执行成功！');
    
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
main();