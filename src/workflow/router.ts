import type { TaskClassification, TaskMode } from './types.js';

// 路由判断：根据用户输入判断任务类型
export function routeTask(userInput: string): TaskClassification {
  const input = userInput.toLowerCase().trim();

  // 直通模式：文档查询、环境配置、打包、CI/CD、闲聊
  if (isDirectMode(input)) {
    return {
      mode: 'direct',
      confidence: 'high',
      reason: '文档查询/环境配置/打包/闲聊等直接处理场景',
    };
  }

  // 从需求/设计起步
  if (isRequirementStart(input)) {
    if (isNewPageOrModule(input)) {
      return {
        mode: 'page',
        confidence: 'high',
        reason: '从需求/设计起步，涉及新页面或新模块',
      };
    }
    return {
      mode: 'feature',
      confidence: 'high',
      reason: '从需求/设计起步，需要完整流程',
    };
  }

  // 10 秒测试：可直接定位的轻量任务
  if (isLightweightTask(input)) {
    return {
      mode: 'lightweight',
      confidence: 'high',
      reason: '可直接定位到具体文件/组件，不涉及边界决策',
    };
  }

  // UI 优化
  if (isUIOptimization(input)) {
    return {
      mode: 'ui_optimize',
      confidence: 'medium',
      reason: '涉及 UI 视觉调整、样式优化',
    };
  }

  // 架构级任务
  if (isArchitectureTask(input)) {
    return {
      mode: 'architecture',
      confidence: 'medium',
      reason: '涉及迁移、重构、依赖治理等架构级变更',
    };
  }

  // 页面开发
  if (isPageDevelopment(input)) {
    return {
      mode: 'page',
      confidence: 'medium',
      reason: '新页面/新模块/页面结构设计',
    };
  }

  // 功能开发（默认）
  return {
    mode: 'feature',
    confidence: 'low',
    reason: '完整业务闭环/跨页面状态联动',
  };
}

function isDirectMode(input: string): boolean {
  const keywords = [
    '怎么', '如何', '为什么', '解释', '查看', '查询',
    '文档', '配置', '打包', '部署', 'ci', 'cd',
    '你好', '谢谢', '再见',
  ];
  return keywords.some(kw => input.includes(kw)) && !input.includes('改') && !input.includes('做');
}

function isRequirementStart(input: string): boolean {
  const keywords = [
    'prd', '需求', '设计', '规划', '方案',
    '先设计', '先拆', '先理解',
  ];
  return keywords.some(kw => input.includes(kw));
}

function isNewPageOrModule(input: string): boolean {
  const keywords = ['新页面', '新模块', '新建页面', '创建页面', '从0到1', '从零开始'];
  return keywords.some(kw => input.includes(kw));
}

function isLightweightTask(input: string): boolean {
  // 包含具体的页面名+控件名，或文件路径
  const hasPageAndComponent = /页面.*按钮|按钮.*页面|文案|颜色|字体|大小/.test(input);
  const hasFilePath = /\.(dart|yaml|json)/.test(input);
  const hasComponentName = /widget|组件|控件/.test(input);

  return (hasPageAndComponent || hasFilePath || hasComponentName) &&
    !input.includes('新') && !input.includes('重构');
}

function isUIOptimization(input: string): boolean {
  const keywords = [
    'ui', '样式', '颜色', '字体', '间距', '布局',
    '优化', '美化', '调整', '截图', '头像',
  ];
  return keywords.some(kw => input.includes(kw));
}

function isArchitectureTask(input: string): boolean {
  const keywords = [
    '迁移', '重构', '依赖', '治理', '性能',
    '优化', '简化', '抽取', '复用', '收敛',
    '架构', '模块化',
  ];
  return keywords.some(kw => input.includes(kw));
}

function isPageDevelopment(input: string): boolean {
  const keywords = [
    '页面', '列表', '详情', '表单', '登录', '注册',
    '首页', '设置', '个人中心',
  ];
  return keywords.some(kw => input.includes(kw));
}
