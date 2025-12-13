import https from 'https';
import crypto from 'crypto';

// 翻译API调用计数器
let translationApiCallCount = 0;

/**
 * 百度翻译API调用函数
 * @param {string} text 要翻译的中文文本
 * @param {string} [appid=''] 百度翻译APP ID
 * @param {string} [secretKey=''] 百度翻译密钥
 * @returns {Promise<string>} 翻译后的英文文本
 */
async function translateText(text, appid = '', secretKey = '') {
  // 真实百度翻译API调用逻辑
  if (!appid || !secretKey) {
    console.warn(`未提供百度翻译API凭证，使用默认翻译: ${text}`);
    return text; // 如果没有提供凭证，直接返回原文本
  }

  try {
    // 增加API调用计数器
    translationApiCallCount++;
    
    const salt = Date.now().toString();
    const sign = crypto.createHash('md5').update(appid + text + salt + secretKey).digest('hex');
    const params = new URLSearchParams({
      q: text,
      from: 'zh',
      to: 'en',
      appid: appid,
      salt: salt,
      sign: sign
    });

    const options = {
      hostname: 'fanyi-api.baidu.com',
      path: '/api/trans/vip/translate?' + params.toString(),
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.trans_result && result.trans_result.length > 0) {
              const translatedText = result.trans_result[0].dst;
              resolve(translatedText);
            } else {
              console.error('翻译API返回错误:', result.error_msg || '未知错误');
              resolve(text);
            }
          } catch (error) {
            console.error('解析翻译结果失败:', error);
            resolve(text);
          }
        });
      });

      req.on('error', (error) => {
        console.error('翻译请求失败:', error);
        resolve(text);
      });

      req.end();
    });
  } catch (error) {
    console.error('翻译过程中发生错误:', error);
    return text;
  }
}

/**
 * 获取翻译API调用次数
 * @returns {number} 翻译API调用次数
 */
function getTranslationApiCallCount() {
  return translationApiCallCount;
}

export { translateText, getTranslationApiCallCount };
