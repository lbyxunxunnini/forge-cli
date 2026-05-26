#!/usr/bin/env node

import { startREPL } from './cli/repl.js';

startREPL().catch(console.error);
