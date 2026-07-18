# Marketing Research Skill for Claude

A structured, practitioner-grade marketing research system that runs inside Claude. Covers competitor analysis, product positioning, avatar profiling, market awareness mapping, value proposition development, and mental model reframing.

Built for founders, marketers, and copywriters who need deep research before writing a single word of copy.

## What This Skill Does

When installed, Claude automatically loads this skill whenever you say things like "research my product," "profile my avatar," "competitor analysis," or "develop my value proposition."

The skill runs you through a structured sequence:

| Module | What It Produces |
|--------|-----------------|
| **Module 0: Competitor Research** | Landscape map, gap analysis, differentiation pressure test, comparison table |
| **Module 1: Product** | Feature/benefit table, Unique Mechanism name and story |
| **Module 2: Avatar** | 6 desires, 6 problems, primary conflict, master avatar table |
| **Module 3: Market** | Awareness stage table, sophistication claims table, primary target |
| **Module 4: Value Proposition** | 4 full-length value propositions with usage matrix |
| **Module 5: Mental Models** | 3-4 psychological/strategic reframes with priority copy angles |
| **Output Templates** | Avatar Profile, Positioning Canvas, Competitor Comparison Table |

## Writing Quality

The skill enforces strict writing rules on all output:

- Zero em dashes. Periods, commas, and colons instead.
- Zero parenthetical asides. If it matters, it gets a sentence. If not, it gets cut.
- Active voice. Short paragraphs. Plain language.
- Tables over prose for all structured content.
- Point-first writing. The sharpest insight leads every section.

## Installation

### Claude.ai (Web / Mobile / Desktop)

1. Download the `marketing-research.skill` file from [Releases](../../releases)
2. Go to **Settings > Capabilities** and enable **Code execution and file creation**
3. Go to **Customize > Skills**
4. Click the upload button and select the `.skill` file
5. Toggle it on

Claude will now automatically detect and use this skill when you request marketing research.

### Claude Code (Terminal)

**Option 1: Install from this repository**

```bash
# Clone the repo
git clone https://github.com/ishwarjha/marketing-research-skill.git

# Copy the skill to your personal skills directory
cp -r marketing-research-skill/marketing-research ~/.claude/skills/
```

**Option 2: Install directly**

```bash
mkdir -p ~/.claude/skills/marketing-research
curl -o ~/.claude/skills/marketing-research/SKILL.md \
  https://raw.githubusercontent.com/ishwarjha/marketing-research-skill/main/marketing-research/SKILL.md
```

**Option 3: Install as a project skill**

```bash
cd your-project
mkdir -p .claude/skills/marketing-research
cp /path/to/marketing-research/SKILL.md .claude/skills/marketing-research/
```

### Manual Paste

If you do not want to install the skill, copy the contents of `marketing-research/SKILL.md` and paste it at the start of any Claude conversation as instructions.

## Usage

Start a new conversation and say any of these:

- "Research my product"
- "Run a full marketing research"
- "Do a competitor analysis for my product"
- "Profile my ideal customer avatar"
- "Develop my value proposition"
- "Help me understand my market positioning"

Claude will begin with an intake interview, asking five questions about your product, features, avatar, competitors, and research stage. After that, it runs the relevant modules automatically.

### Running Individual Modules

You can also request specific modules:

- "Run Module 0: Competitor Research"
- "Run Module 2: Avatar profiling"
- "Just do the value proposition development"

### Example Output

A full research run for a SaaS product produces a single markdown file with approximately 300-350 lines covering all eight deliverables. Each module uses tables for structured data and concise prose for strategic narrative.

## Repository Structure

```
marketing-research-skill/
├── README.md                          # This file
├── LICENSE                            # Apache 2.0
├── marketing-research/
│   └── SKILL.md                       # The skill file (this is the only required file)
├── examples/
│   └── sample-output.md               # Example of a full research run
├── scripts/
│   └── install.sh                     # Quick install script
└── .gitignore
```

## How It Works

The skill uses a progressive disclosure system:

1. **Metadata** (name + description): Always visible to Claude. Used to decide whether to load the skill.
2. **SKILL.md body**: Loaded when the skill activates. Contains all module instructions, output format rules, and writing rules.

Claude reads the instructions and follows them as a structured research workflow. It uses web search for competitor data and delivers each module as a formatted markdown file.

## Customizing

Fork this repository and edit `marketing-research/SKILL.md` to customize:

- **Writing rules**: Adjust tone, formatting, or length targets in the WRITING RULES section
- **Module structure**: Add, remove, or reorder modules
- **Output templates**: Modify the Avatar Profile, Positioning Canvas, or Comparison Table formats
- **Mental models**: Add your own psychological or strategic frameworks to Module 5

After editing, either re-upload the `.skill` file to Claude.ai or copy the updated `SKILL.md` to your Claude Code skills directory.

## Building the .skill Package

The `.skill` file is a ZIP archive containing the skill folder. To rebuild after editing:

```bash
cd marketing-research-skill
zip -r marketing-research.skill marketing-research/
```

Or if you have the Anthropic skill packager:

```bash
python -m scripts.package_skill marketing-research/ ./
```

## Contributing

Contributions welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-improvement`
3. Edit `marketing-research/SKILL.md`
4. Test by installing the modified skill and running a full research
5. Submit a pull request with a description of what changed and why

**Writing standards for contributions:**
- Zero em dashes in the SKILL.md file
- Minimal parenthetical content
- Active voice throughout
- Tables over prose for structured content

## License

Apache 2.0. See [LICENSE](LICENSE) for details.

## Credits

Created by [Your Name]. Built with Claude by Anthropic.

Follows the [Agent Skills](https://agentskills.io) open standard.
