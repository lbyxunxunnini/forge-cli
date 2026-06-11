/**
 * Skill 管理器
 * 支持本地和远程 skill 安装、更新
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

export interface SkillInfo {
  name: string;
  description: string;
  version: string;
  source: 'local' | 'remote';
  path: string;
  triggers?: string[];
  autoInvoke?: boolean;
  remoteUrl?: string;
}

export interface SkillUpdate {
  name: string;
  currentVersion: string;
  latestVersion: string;
  remoteUrl: string;
}

export class SkillManager {
  private skillsDir: string;
  private projectSkillsDir: string;

  constructor(projectRoot?: string) {
    this.skillsDir = join(homedir(), '.forge-cli', 'skills');
    this.projectSkillsDir = projectRoot ? join(projectRoot, '.forge', 'skills') : '';

    // 确保目录存在
    if (!existsSync(this.skillsDir)) {
      mkdirSync(this.skillsDir, { recursive: true });
    }
  }

  /**
   * 获取所有已安装的 skill
   */
  getInstalledSkills(): SkillInfo[] {
    const skills: SkillInfo[] = [];

    // 全局 skills
    if (existsSync(this.skillsDir)) {
      skills.push(...this.loadSkillsFromDir(this.skillsDir, 'local'));
    }

    // 项目级 skills
    if (this.projectSkillsDir && existsSync(this.projectSkillsDir)) {
      skills.push(...this.loadSkillsFromDir(this.projectSkillsDir, 'local'));
    }

    return skills;
  }

  /**
   * 从目录加载 skills
   */
  private loadSkillsFromDir(dir: string, source: 'local' | 'remote'): SkillInfo[] {
    const skills: SkillInfo[] = [];

    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const skillDir = join(dir, entry);
        const stat = statSync(skillDir);

        if (stat.isDirectory()) {
          const skillFile = join(skillDir, 'SKILL.md');
          if (existsSync(skillFile)) {
            const skill = this.parseSkillFile(skillFile, source);
            if (skill) {
              skills.push(skill);
            }
          }
        }
      }
    } catch (error) {
      // 忽略读取错误
    }

    return skills;
  }

  /**
   * 解析 SKILL.md 文件
   */
  private parseSkillFile(filePath: string, source: 'local' | 'remote'): SkillInfo | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

      if (!frontmatterMatch) return null;

      const frontmatter = this.parseYaml(frontmatterMatch[1]);
      const dirName = basename(join(filePath, '..'));

      return {
        name: frontmatter.name || dirName,
        description: frontmatter.description || '',
        version: frontmatter.version || '1.0.0',
        source,
        path: filePath,
        triggers: frontmatter.triggers,
        autoInvoke: frontmatter.autoInvoke,
        remoteUrl: frontmatter.remoteUrl,
      };
    } catch {
      return null;
    }
  }

  /**
   * 简单的 YAML 解析
   */
  private parseYaml(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // 处理数组
        if (value.startsWith('[') && value.endsWith(']')) {
          result[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
        }
        // 处理布尔值
        else if (value === 'true') result[key] = true;
        else if (value === 'false') result[key] = false;
        // 处理字符串
        else result[key] = value.replace(/^["']|["']$/g, '');
      }
    }

    return result;
  }

  /**
   * 安装 skill（从远程仓库）
   */
  async installSkill(url: string, name?: string): Promise<{ success: boolean; message: string }> {
    try {
      // 解析仓库 URL
      const repoInfo = this.parseGitHubUrl(url);
      if (!repoInfo) {
        return { success: false, message: '无效的 GitHub URL' };
      }

      // 下载 SKILL.md
      const skillUrl = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/main/SKILL.md`;
      const response = await fetch(skillUrl);

      if (!response.ok) {
        // 尝试其他分支
        const skillUrl2 = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/master/SKILL.md`;
        const response2 = await fetch(skillUrl2);
        if (!response2.ok) {
          return { success: false, message: '无法下载 SKILL.md 文件' };
        }
        return await this.saveSkillFromResponse(response2, name || repoInfo.repo, url);
      }

      return await this.saveSkillFromResponse(response, name || repoInfo.repo, url);
    } catch (error: any) {
      return { success: false, message: `安装失败: ${error.message}` };
    }
  }

  /**
   * 解析 GitHub URL
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    return null;
  }

  /**
   * 从响应保存 skill
   */
  private async saveSkillFromResponse(
    response: Response,
    name: string,
    remoteUrl: string
  ): Promise<{ success: boolean; message: string }> {
    const content = await response.text();
    const skillDir = join(this.skillsDir, name);

    // 创建目录
    if (!existsSync(skillDir)) {
      mkdirSync(skillDir, { recursive: true });
    }

    // 添加 remoteUrl 到 frontmatter
    const updatedContent = content.replace(
      /^(---\n)/,
      `$1remoteUrl: ${remoteUrl}\n`
    );

    // 保存文件
    writeFileSync(join(skillDir, 'SKILL.md'), updatedContent, 'utf-8');

    return { success: true, message: `已安装 skill: ${name}` };
  }

  /**
   * 检查 skill 更新
   */
  async checkUpdates(): Promise<SkillUpdate[]> {
    const skills = this.getInstalledSkills();
    const updates: SkillUpdate[] = [];

    for (const skill of skills) {
      if (!skill.remoteUrl) continue;

      try {
        const repoInfo = this.parseGitHubUrl(skill.remoteUrl);
        if (!repoInfo) continue;

        // 获取远程 SKILL.md
        const skillUrl = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/main/SKILL.md`;
        const response = await fetch(skillUrl);

        if (!response.ok) continue;

        const remoteContent = await response.text();
        const remoteSkill = this.parseSkillContent(remoteContent);

        if (remoteSkill && remoteSkill.version !== skill.version) {
          updates.push({
            name: skill.name,
            currentVersion: skill.version,
            latestVersion: remoteSkill.version,
            remoteUrl: skill.remoteUrl,
          });
        }
      } catch {
        // 忽略检查错误
      }
    }

    return updates;
  }

  /**
   * 解析 skill 内容
   */
  private parseSkillContent(content: string): { version: string } | null {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const versionMatch = frontmatterMatch[1].match(/version:\s*(.+)/);
    return versionMatch ? { version: versionMatch[1].trim() } : null;
  }

  /**
   * 更新 skill
   */
  async updateSkill(name: string): Promise<{ success: boolean; message: string }> {
    const skills = this.getInstalledSkills();
    const skill = skills.find(s => s.name === name);

    if (!skill) {
      return { success: false, message: `未找到 skill: ${name}` };
    }

    if (!skill.remoteUrl) {
      return { success: false, message: `skill ${name} 没有远程源，无法更新` };
    }

    return await this.installSkill(skill.remoteUrl, name);
  }

  /**
   * 删除 skill
   */
  removeSkill(name: string): { success: boolean; message: string } {
    const skillDir = join(this.skillsDir, name);

    if (!existsSync(skillDir)) {
      return { success: false, message: `未找到 skill: ${name}` };
    }

    try {
      const { rmSync } = require('fs');
      rmSync(skillDir, { recursive: true, force: true });
      return { success: true, message: `已删除 skill: ${name}` };
    } catch (error: any) {
      return { success: false, message: `删除失败: ${error.message}` };
    }
  }

  /**
   * 获取 skill 内容（用于注入到 prompt）
   */
  getSkillContent(name: string): string | null {
    const skills = this.getInstalledSkills();
    const skill = skills.find(s => s.name === name);

    if (!skill) return null;

    try {
      return readFileSync(skill.path, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * 获取触发词匹配的 skills
   */
  getTriggeredSkills(input: string): SkillInfo[] {
    const skills = this.getInstalledSkills();
    const inputLower = input.toLowerCase();

    return skills.filter(skill => {
      if (!skill.triggers || skill.triggers.length === 0) return false;
      return skill.triggers.some(trigger => inputLower.includes(trigger.toLowerCase()));
    });
  }
}

export const skillManager = new SkillManager();
