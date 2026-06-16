/**
 * 多行输入组件（Ink）
 * 支持粘贴大段文字、Shift+Enter 换行、粘贴摘要提示
 *
 * 使用 Ink 原生的 usePaste hook 处理粘贴事件，
 * 自动启用 bracketed paste 模式，粘贴内容作为完整字符串传递。
 *
 * 设计：
 * - value 只包含用户实际输入的文本（不包含摘要）
 * - pastedParts 存储粘贴的摘要和实际内容
 * - 渲染时，根据 pastedParts 的位置在正确的地方显示摘要
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput, usePaste } from 'ink';

export interface MultilineInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  focus?: boolean;
  multiline?: boolean;
  /** 粘贴摘要阈值：行数 */
  pasteLineThreshold?: number;
  /** 粘贴摘要阈值：字符数 */
  pasteCharThreshold?: number;
}

interface PastedPart {
  /** 摘要文本，如 "[Pasted ~5 lines]" */
  summary: string;
  /** 实际粘贴内容 */
  content: string;
  /** 在 value 中的插入位置 */
  position: number;
}

export function MultilineInput({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  focus = true,
  multiline = true,
  pasteLineThreshold = 3,
  pasteCharThreshold = 150,
}: MultilineInputProps) {
  const [cursorPos, setCursorPos] = useState(value.length);
  const [pastedParts, setPastedParts] = useState<PastedPart[]>([]);

  // 使用 ref 保存最新的值，避免闭包问题
  const valueRef = useRef(value);
  const cursorPosRef = useRef(cursorPos);
  const focusRef = useRef(focus);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    cursorPosRef.current = cursorPos;
  }, [cursorPos]);

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  const lines = value.split('\n');

  // 同步光标到末尾（value 变化时）
  useEffect(() => {
    setCursorPos(value.length);
  }, [value]);

  // 使用 Ink 原生的 usePaste hook 处理粘贴
  usePaste((pastedText: string) => {
    if (!focusRef.current) return;

    // 标准化换行符
    const normalizedText = pastedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const pastedContent = normalizedText.trim();
    if (!pastedContent) return;

    const lineCount = (pastedContent.match(/\n/g)?.length ?? 0) + 1;
    const shouldShowSummary = lineCount >= pasteLineThreshold || pastedContent.length > pasteCharThreshold;

    // 获取最新的值和光标位置
    const currentValue = valueRef.current;
    const currentCursorPos = cursorPosRef.current;

    if (shouldShowSummary) {
      // 显示摘要：在当前光标位置插入实际内容，但存储摘要信息
      const summary = `[Pasted ~${lineCount} lines]`;

      // 插入实际内容到 value 中
      const newValue = currentValue.slice(0, currentCursorPos) + pastedContent + currentValue.slice(currentCursorPos);
      onChange(newValue);
      setCursorPos(currentCursorPos + pastedContent.length);

      // 存储粘贴部分（摘要和位置），去重
      setPastedParts(prev => {
        const newPart = { summary, content: pastedContent, position: currentCursorPos };
        // 检查是否已有相同内容和位置的粘贴记录
        const isDuplicate = prev.some(
          p => p.content === newPart.content && p.position === newPart.position
        );
        if (isDuplicate) return prev;
        return [...prev, newPart];
      });
    } else {
      // 短内容直接插入
      const newValue = currentValue.slice(0, currentCursorPos) + pastedContent + currentValue.slice(currentCursorPos);
      onChange(newValue);
      setCursorPos(currentCursorPos + pastedContent.length);
    }
  }, { isActive: focus });

  // 处理键盘输入
  useInput((input, key) => {
    if (!focus) return;

    // 提交：Enter（不按 Shift）
    if (key.return && !key.shift) {
      // value 中已经是实际内容，直接提交
      onSubmit(value);
      // 清除粘贴状态
      setPastedParts([]);
      return;
    }

    // 换行：Shift+Enter
    if (key.return && key.shift && multiline) {
      const newValue = value.slice(0, cursorPos) + '\n' + value.slice(cursorPos);
      onChange(newValue);
      setCursorPos(cursorPos + 1);

      // 更新粘贴部分的位置
      setPastedParts(prev =>
        prev.map(part =>
          part.position >= cursorPos
            ? { ...part, position: part.position + 1 }
            : part
        )
      );
      return;
    }

    // 退格
    if (key.backspace || key.delete) {
      if (cursorPos > 0) {
        // 检查是否在粘贴区域内
        const partToDelete = pastedParts.find(
          p => cursorPos > p.position && cursorPos <= p.position + p.content.length
        );
        if (partToDelete) {
          // 删除整个粘贴内容
          const deleteLength = partToDelete.content.length;
          const newValue = value.slice(0, partToDelete.position) + value.slice(partToDelete.position + deleteLength);
          onChange(newValue);
          setCursorPos(partToDelete.position);
          setPastedParts(prev => prev.filter(p => p !== partToDelete)
            .map(p => p.position > partToDelete.position
              ? { ...p, position: p.position - deleteLength }
              : p
            )
          );
        } else {
          const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos);
          onChange(newValue);
          setCursorPos(cursorPos - 1);

          // 更新粘贴部分的位置（光标之后的粘贴区域需要偏移）
          setPastedParts(prev =>
            prev.map(part =>
              part.position >= cursorPos
                ? { ...part, position: part.position - 1 }
                : part
            )
          );
        }
      }
      return;
    }

    // 方向键
    if (key.leftArrow) {
      setCursorPos(Math.max(0, cursorPos - 1));
      return;
    }
    if (key.rightArrow) {
      setCursorPos(Math.min(value.length, cursorPos + 1));
      return;
    }
    if (key.upArrow) {
      // 移动到上一行
      let pos = 0;
      for (let i = 0; i < lines.length; i++) {
        if (pos + lines[i].length >= cursorPos) {
          if (i > 0) {
            const prevLineEnd = pos - 1;
            const prevLineStart = prevLineEnd - lines[i - 1].length;
            const offset = cursorPos - pos;
            setCursorPos(prevLineStart + Math.min(offset, lines[i - 1].length));
          }
          break;
        }
        pos += lines[i].length + 1;
      }
      return;
    }
    if (key.downArrow) {
      // 移动到下一行
      let pos = 0;
      for (let i = 0; i < lines.length; i++) {
        if (pos + lines[i].length >= cursorPos) {
          if (i < lines.length - 1) {
            const nextLineStart = pos + lines[i].length + 1;
            const offset = cursorPos - pos;
            setCursorPos(nextLineStart + Math.min(offset, lines[i + 1].length));
          }
          break;
        }
        pos += lines[i].length + 1;
      }
      return;
    }

    // 普通字符输入
    if (input && !key.ctrl && !key.meta) {
      const newValue = value.slice(0, cursorPos) + input + value.slice(cursorPos);
      onChange(newValue);
      setCursorPos(cursorPos + input.length);

      // 更新粘贴部分的位置（光标之后的粘贴区域需要偏移）
      setPastedParts(prev =>
        prev.map(part =>
          part.position >= cursorPos
            ? { ...part, position: part.position + input.length }
            : part
        )
      );
    }
  }, { isActive: focus });

  // 渲染内容（带摘要和光标）
  const renderContent = () => {
    if (!value && !pastedParts.length && placeholder) {
      return <Box><Text dimColor>{placeholder}</Text></Box>;
    }

    // 构建渲染片段
    const segments: Array<{ type: 'text' | 'summary'; content: string; position: number }> = [];

    // 按位置排序粘贴部分
    const sortedParts = [...pastedParts].sort((a, b) => a.position - b.position);

    let lastPos = 0;
    for (const part of sortedParts) {
      // 添加粘贴部分之前的文本
      if (part.position > lastPos) {
        segments.push({
          type: 'text',
          content: value.slice(lastPos, part.position),
          position: lastPos
        });
      }
      // 添加摘要
      segments.push({
        type: 'summary',
        content: part.summary,
        position: part.position
      });
      // 跳过粘贴的实际内容
      lastPos = part.position + part.content.length;
    }
    // 添加剩余的文本
    if (lastPos < value.length) {
      segments.push({
        type: 'text',
        content: value.slice(lastPos),
        position: lastPos
      });
    }

    // 如果没有内容，显示空行
    if (segments.length === 0) {
      return <Box><Text> </Text></Box>;
    }

    // 渲染每个片段
    return (
      <Box flexDirection="column">
        {segments.map((segment, index) => {
          if (segment.type === 'summary') {
            return (
              <Box key={`summary-${index}`}>
                <Text dimColor>{segment.content}</Text>
              </Box>
            );
          }

          // 文本片段，需要处理光标位置
          const segmentLines = segment.content.split('\n');
          return segmentLines.map((line, lineIndex) => {
            const lineStart = segment.position + segmentLines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);
            const lineEnd = lineStart + line.length;

            // 检查光标是否在这一行
            if (cursorPos >= lineStart && cursorPos <= lineEnd) {
              const offset = cursorPos - lineStart;
              const before = line.slice(0, offset);
              const charAtCursor = line[offset] || '';
              const after = line.slice(offset + 1);

              return (
                <Box key={`text-${index}-${lineIndex}`}>
                  <Text>{before}</Text>
                  <Text backgroundColor="white" color="black">{charAtCursor || ' '}</Text>
                  <Text>{after}</Text>
                </Box>
              );
            }

            return (
              <Box key={`text-${index}-${lineIndex}`}>
                <Text>{line || ' '}</Text>
              </Box>
            );
          });
        })}
      </Box>
    );
  };

  return renderContent();
}

export default MultilineInput;
