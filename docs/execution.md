# Runtime Execution Model

Input composition: system role declares node type; user role carries serialized node context plus aggregated upstream outputs separated by a delimiter block.

Progress lifecycle events:
start → node_start → node_complete / node_error (repeated) → complete.

Data captured per node: input context snapshot, output text, start/end timestamps, provider/model used, success or error state.

Session persistence: execution results remain in memory until page reload; export manually if a record is needed.

Prompt hygiene recommendations: remove orphan edges and obsolete nodes prior to long executions to reduce prompt cost and noise.

Performance considerations: very large aggregated upstream contexts can inflate token usage; trim verbose narrative fields after finalizing structure.

