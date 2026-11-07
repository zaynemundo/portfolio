<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Delegation

- Do one-off content and writing work (docs, prompts, copy, Markdown files) in the main session, or with one `subagent` call that carries all the context. Do not spawn a durable teammate for it and then block on `wait_agent`.
- Use Agent Teams only when the work genuinely splits into independent parts that can run in parallel, and keep each teammate's scope small. Put every fact the teammate needs in the spawn prompt so it does not re-explore the workspace.
- Prefer one finished pass over iterative polishing. A fresh teammate re-reads files and runs at the profile's configured reasoning effort, so thorough content work can take 20+ minutes.
- Wait efficiently: use `wait_agent` with short timeouts (60–120 s) and do useful work or check `list_agents` / the task board in between. Only block on a teammate when its output is actually needed, and never hold the final answer on a wait that has already produced its result.
- Stopping the Lead's turn cancels the wait, not the teammate. To actually stop a teammate, use `interrupt_agent`.
