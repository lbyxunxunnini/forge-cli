/**
 * 命令面板组件（Ink）
 * 输入 / 时显示命令提示，支持上下键选择和 Tab 补全
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

export interface Command {
  command: string;
  description: string;
  args?: string;
}

export interface CommandPaletteProps {
  commands: Command[];
  query: string;
  visible: boolean;
  selectedIndex: number;
  onSelect: (command: Command) => void;
  onEscape: () => void;
}

export function CommandPalette({
  commands,
  query,
  visible,
  selectedIndex,
  onSelect,
  onEscape,
}: CommandPaletteProps) {
  // 过滤命令
  const filteredCommands = useMemo(() => {
    if (!query.startsWith('/')) return [];

    const search = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.command.toLowerCase().startsWith(search) ||
      cmd.description.toLowerCase().includes(search.slice(1))
    ).slice(0, 8); // 最多显示 8 个
  }, [commands, query]);

  if (!visible || filteredCommands.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="round" borderColor="cyan" flexDirection="column" padding={1}>
        <Text bold dimColor>命令提示 (↑↓ 选择, Tab 补全, Esc 取消)</Text>
        <Box marginTop={1} flexDirection="column">
          {filteredCommands.map((cmd, i) => (
            <Box key={cmd.command}>
              <Text>
                {i === selectedIndex ? <Text cyan>❯ </Text> : <Text>  </Text>}
                <Text bold={i === selectedIndex} color={i === selectedIndex ? 'cyan' : 'white'}>
                  {cmd.command}
                </Text>
                {cmd.args && <Text dimColor> {cmd.args}</Text>}
                <Text dimColor> - {cmd.description}</Text>
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default CommandPalette;
