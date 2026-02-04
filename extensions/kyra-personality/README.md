# ✨ Kyra Personality Extension

This OpenClaw extension provides the Kyra AI personality, system prompt, and conversation hooks.

## Features

- **System Prompt**: Defines Kyra's personality, capabilities, and communication style
- **Slash Commands**: `/help`, `/status`, `/upgrade`
- **Personality Modes**: Friendly, Professional, Casual, Formal
- **Tier Awareness**: Adapts memory context based on user subscription tier

## Installation

```bash
openclaw extensions install ./extensions/kyra-personality
```

## Configuration

Add to your OpenClaw config:

```yaml
extensions:
  kyra-personality:
    assistantName: "Kyra"
    tagline: "Your Intelligent Companion"
    personality: "friendly"  # friendly | professional | casual | formal
    welcomeMessage: "Hi! I'm Kyra, your intelligent companion. How can I help you today?"
    enableCommands: true
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands and capabilities |
| `/status` | Check subscription status and usage |
| `/upgrade` | Learn about plan upgrade options |

## Personality Modes

### Friendly (Default)
Warm and approachable, uses conversational language.

### Professional
Clear and precise, maintains appropriate boundaries.

### Casual
Relaxed and fun, uses casual expressions.

### Formal
Respectful and thorough, uses proper vocabulary.

## API

### `registerSystemPrompt(callback)`
Provides the Kyra system prompt to the AI model.

### `registerMessagePreprocessor(callback)`
Intercepts messages to handle slash commands.

### `registerConversationHook(event, callback)`
Hooks into conversation lifecycle events.

## Example

```typescript
import type { OpenClawPluginApi } from "openclaw";

export default function register(api: OpenClawPluginApi) {
  api.registerSystemPrompt(() => {
    return "You are Kyra, an intelligent AI companion...";
  });
}
```

## License

MIT
