# InkStrokes - Clone Instructions

## Quick Clone (Recommended)

Use this HTTPS URL to clone the repository:

```bash
git clone https://github.com/utkarsh-brainstorm/InkStrokes.git
```

## If You're Getting Username Prompts

If Git is asking for username/password even though the repo is public, try these solutions:

### Solution 1: Disable credential helper temporarily
```bash
# Disable GitHub CLI credential helper
git config --global --unset credential.https://github.com.helper

# Then clone
git clone https://github.com/utkarsh-brainstorm/InkStrokes.git
```

### Solution 2: Force anonymous clone
```bash
GIT_TERMINAL_PROMPT=0 git clone https://github.com/utkarsh-brainstorm/InkStrokes.git
```

### Solution 3: Use curl to download (if Git issues persist)
```bash
curl -L https://github.com/utkarsh-brainstorm/InkStrokes/archive/refs/heads/main.zip -o InkStrokes.zip
unzip InkStrokes.zip
mv InkStrokes-main InkStrokes
```

## Repository Information
- **Repository**: https://github.com/utkarsh-brainstorm/InkStrokes
- **Visibility**: Public
- **Clone URL (HTTPS)**: https://github.com/utkarsh-brainstorm/InkStrokes.git
- **Clone URL (SSH)**: git@github.com:utkarsh-brainstorm/InkStrokes.git

## After Cloning
1. Navigate to the project directory: `cd InkStrokes`
2. Follow the setup instructions in `SETUP.md`
3. Install dependencies: `npm install`
4. Set up Python dependencies: `pip install -r requirements.txt`

## Troubleshooting
- Make sure you're using the HTTPS URL, not SSH
- Clear any cached Git credentials if prompted for authentication
- Ensure your Git version is up to date: `git --version`
