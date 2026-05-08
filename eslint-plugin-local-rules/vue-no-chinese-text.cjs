/**
 * ESLint 规则：禁止 Vue 模板中出现未国际化的硬编码中文文本
 * 允许：HTML 注释、已包裹在 t()/$t() 中的表达式
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow uninternationalized Chinese text in Vue templates',
      category: 'Best Practices',
      recommended: false
    },
    schema: [],
    messages: {
      noChineseText: '模板中出现未国际化的中文文本: "{{text}}". 请使用 t() 或 $t() 包裹。'
    }
  },
  create(context) {
    const CHINESE_REGEX = /[\u4e00-\u9fff]/;
    const sourceCode = context.getSourceCode();

    function checkNode(node, text) {
      if (!text || !CHINESE_REGEX.test(text)) return;

      // 获取该节点所在源代码行
      const token = sourceCode.getFirstToken(node);
      if (!token) return;
      const line = token.loc.start.line;
      const lineText = sourceCode.lines[line - 1] || '';

      // 排除包含 t( 或 $t( 的行（已国际化）
      if (/\bt\s*\(|\$t\s*\(/.test(lineText)) return;

      // 排除 HTML 注释行
      if (/<!--/.test(lineText) && /-->/ .test(lineText)) return;

      context.report({
        node,
        messageId: 'noChineseText',
        data: { text: text.trim().slice(0, 30) }
      });
    }

    return context.parserServices.defineTemplateBodyVisitor({
      // 纯文本节点
      VText(node) {
        checkNode(node, node.value);
      },
      // 表达式容器 {{ ... }}
      VExpressionContainer(node) {
        if (typeof node.value === 'string') {
          checkNode(node, node.value);
        }
      }
    });
  }
};
