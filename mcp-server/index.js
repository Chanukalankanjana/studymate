#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const API_URL = process.env.STUDYMATE_API_URL || 'http://localhost:5000/api/notes'

const server = new McpServer({
  name: 'studymate',
  version: '1.0.0',
})

server.registerTool(
  'list_notes',
  {
    title: 'List Notes',
    description:
      'Fetch all StudyMate notes by calling the local Express API. Use this when the user asks what notes they have.',
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      const notes = await response.json()

      return {
        content: [
          {
            type: 'text',
            text:
              Array.isArray(notes) && notes.length === 0
                ? 'No notes found.'
                : JSON.stringify(notes, null, 2),
          },
        ],
      }
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Failed to list notes: ${error.message}. Is the Express server running on port 5000?`,
          },
        ],
      }
    }
  },
)

server.registerTool(
  'create_note',
  {
    title: 'Create Note',
    description:
      'Create a new StudyMate note. Requires title, subject, and content.',
    inputSchema: z.object({
      title: z.string().describe('Short title for the note'),
      subject: z.string().describe('Subject or course name'),
      content: z.string().describe('Full note content / study text'),
    }),
  },
  async ({ title, subject, content }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subject, content }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || `API responded with status ${response.status}`)
      }

      return {
        content: [
          {
            type: 'text',
            text: `Note created successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      }
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Failed to create note: ${error.message}. Is the Express server running on port 5000?`,
          },
        ],
      }
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('StudyMate MCP server running on stdio')
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error)
  process.exit(1)
})
