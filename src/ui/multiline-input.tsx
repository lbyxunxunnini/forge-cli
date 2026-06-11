/**
 * 多行输入组件（Ink）
 * 支持粘贴大段文字、Shift+Enter 换行
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useStdin } from 'ink';

export interface MultilineInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  focus?: boolean;
  multiline?: boolean;
}

export function MultilineInput({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  focus = true,
  multiline = true,
}: MultilineInputProps) {
  const [cursorPos, setCursorPos] = useState(value.length);
  const [lines, setLines] = useState<string[]>(value.split('\n'));
  const [currentLine, setCurrentLine] = useState(0);

  // 同步外部 value 变化
  useEffect(() => {
    const newLines = value.split('\n');
    setLines(newLines);
    setCursorPos(value.length);
    if (currentLine >= newLines.length) {
      setCurrentLine(Math.max(0, newLines.length - 1));
    }
  }, [value]);

  // 处理键盘输入
  useInput((input, key) => {
    if (!focus) return;

    // 提交：Enter（不按 Shift）
    if (key.return && !key.shift) {
      onSubmit(value);
      return;
    }

    // 换行：Shift+Enter
    if (key.return && key.shift && multiline) {
      const newLines = [...lines];
      newLines[currentLine] = lines[currentLine].slice(0, cursorPos) + '\n' + lines[currentLine].slice(cursorPos);
      const newValue = newLines.join('\n');
      onChange(newValue);
      setCursorPos(cursorPos + 1);
      return;
    }

    // 退格
    if (key.backspace || key.delete) {
      if (cursorPos > 0) {
        const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos);
        onChange(newValue);
        setCursorPos(cursorPos - 1);
      } else if (currentLine > 0) {
        // 合并到上一行
        const newLines = [...lines];
        const prevLineLength = newLines[currentLine - 1].length;
        newLines[currentLine - 1] = newLines[currentLine - 1] + newLines[currentLine];
        newLines.splice(currentLine, 1);
        const newValue = newLines.join('\n');
        onChange(newValue);
        setCurrentLine(currentLine - 1);
        setCursorPos(prevLineLength);
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
    if (key.upArrow && multiline) {
      if (currentLine > 0) {
        setCurrentLine(currentLine - 1);
        setCursorPos(Math.min(cursorPos, lines[currentLine - 1].length));
      }
      return;
    }
    if (key.downArrow && multiline) {
      if (currentLine < lines.length - 1) {
        setCurrentLine(currentLine + 1);
        setCursorPos(Math.min(cursorPos, lines[currentLine + 1].length));
      }
      return;
    }

    // 普通字符输入
    if (input && !key.ctrl && !key.meta) {
      const newValue = value.slice(0, cursorPos) + input + value.slice(cursorPos);
      onChange(newValue);
      setCursorPos(cursorPos + input.length);
    }
  }, { isActive: focus });

  // 渲染当前行
  const renderCurrentLine = () => {
    const line = lines[currentLine] || '';
    const beforeCursor = line.slice(0, cursorPos);
    const afterCursor = line.slice(cursorPos);

    if (!value && placeholder) {
      return (
        <Box>
          <Text dimColor>{placeholder}</Text>
        </Box>
      );
    }

    return (
      <Box>
        <Text>{beforeCursor}</Text>
        <Text inverse> </Text>
        <Text>{afterCursor}</Text>
      </Box>
    );
  };

  // 渲染所有行（用于粘贴内容显示）
  const renderAllLines = () => {
    if (lines.length <= 1) {
      return renderCurrentLine();
    }

    return (
      <Box flexDirection="column">
        {lines.map((line, i) => (
          <Box key={i}>
            <Text>{line || ' '}</Text>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      {lines.length > 1 ? renderAllLines() : renderCurrentLine()}
    </Box>
  );
}

export default MultilineInput;
