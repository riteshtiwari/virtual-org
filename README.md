# Virtual Org — Multi‑Agent Design Critique (POC)

A proof-of-concept application that simulates a virtual software company panel focused on **Design Critique**. It runs 3-5 AI agents with different roles (Senior Designer, Accessibility Specialist, Devil's Advocate PM, etc.) who analyze your design, debate findings, and produce structured recommendations.

## What it does

The application orchestrates a design review panel that:
1. **Individual Reviews** - Each AI persona analyzes your design independently
2. **Debate Round** - Agents discuss and challenge each other's findings
3. **Synthesis** - A final report with actionable recommendations

**Output includes:**
- Summary of findings
- Top issues with severity levels
- Open questions for clarification
- Action items with assigned owners
- Full transcript of the panel discussion

## Prerequisites

- Node.js 18 or higher
- OpenAI API account with billing set up
- Project-based API key (starts with `sk-proj-`)

## Setup Instructions

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd virtual-org-poc
npm install
```

### 2. Configure API Keys
You need to set up your OpenAI project credentials:

1. **Get your API credentials:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key (it will start with `sk-proj-`)
   - Note your Project ID and Organization ID

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```bash
   # Copy these values from your OpenAI dashboard
   OPENAI_API_KEY="your-api-key-here"
   OPENAI_PROJECT_ID="your-project-id-here"
   OPENAI_ORG_ID="your-org-id-here"
   
   # Optional settings
   OPENAI_MODEL=gpt-4o-mini
   PORT=5173
   ```

### 3. Run the Application
```bash
npm run dev
# or
node server.js
```

The application will be available at: **http://localhost:5173**

## How to Use

1. **Open the web interface** at http://localhost:5173
2. **Fill in the form:**
   - **Figma URL** (optional) - Paste your Figma design link
   - **Context** - Describe what you want reviewed
   - **Sources** (optional) - Add any reference materials
   - **Personas** - Select which AI agents to include (3-5 recommended)
   - **Sliders** - Adjust review style (harshness, innovation bias, time horizon)

3. **Submit** and wait for the AI panel to complete their analysis

4. **Review results** - The page will display the structured output with findings, recommendations, and action items

## Troubleshooting

**"Incorrect API key" error:**
- Make sure you're using a project key (starts with `sk-proj-`)
- Verify your Project ID and Organization ID are correct
- Ensure billing is set up in your OpenAI account

**"Quota exceeded" error:**
- Check your OpenAI usage at https://platform.openai.com/usage
- Add billing information if you haven't already
- Consider reducing the number of personas to lower costs

## Project Structure

```
virtual-org-poc/
├── src/
│   ├── orchestrator.js    # Main orchestration logic
│   ├── personas.js        # AI agent definitions
│   └── providers/
│       └── openai.js      # OpenAI API integration
├── public/
│   └── index.html         # Web interface
├── server.js              # Express server
└── .env                   # Environment variables
```

## Cost Optimization

- **Use 3 personas** for quick, low-cost reviews
- **Add more personas** only when you need specialized expertise
- **Monitor usage** in your OpenAI dashboard

## Next Steps

This is a proof-of-concept. Future enhancements could include:
- Figma plugin integration
- Voice/meeting simulation
- Integration with project management tools
- Export to various formats (PDF, Markdown, etc.)

---

For demo and testing purposes only.
