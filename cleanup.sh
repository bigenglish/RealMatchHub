#!/bin/bash
# Cleanup script to kill any Node.js processes
ps aux | grep node | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || echo "No node processes found"
echo "Cleanup complete"