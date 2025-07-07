The new and improved site for Doki Doki Modding Central (ModCen/DDMC)

# DEVELOPER INSTRUCTIONS

## Setting Up Your Fork
1. Fork this repository to your local machine and GitHub account
   - You can do this by clicking the "Fork" button at the top right of the repository page
   - This will create a copy of the repository under your GitHub account
   - Clone your fork to your local machine using:
     ```bash
     git clone <your-fork-url>
     ```
2. Be sure that your fork is public and has all the files
3. ALWAYS be sure that your fork is up to date and synced with the main repository
4. Repeat 3 for all changes you make
5. If you make changes, be sure to test them locally before pushing a pull request

## Setting Up Your Local Environment
### Prerequisites
- Modern web browser (Chrome, Firefox, etc.)
- Basic knowledge of HTML, CSS, and JavaScript
- A code editor (VSCode, Sublime Text, Vim, etc.)
- Node.js and npm OR VSCode with Live Server extension (for local testing)
1. Open the repository in your preferred code editor or IDE
2. Set up the local server.
    - If using Node.js, install dependencies:
        ```bash
        npm install
        ```
    - If using VSCode, install the Live Server extension for easy local testing.
3. Start the local server:
   - If using Node.js, run:
        ```bash
        npm run dev
        ```
   - If using VSCode, right-click on `index.html` and select "Go Live" at the bottom right corner.
### localhost will be at http://localhost:3000. Enter this URL in your browser to view the site.
4. You're all set!

## Making Changes
1. Does this need explaining?
2. Prepare a pull request with a clear description of the changes made
    - Ensure your changes are well-tested and do not break existing functionality. I will haunt you if you break the site.
3. Run the commands
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main (or just git push if you are on the main branch of your fork)
   ```
4. Go to your fork on GitHub and create a pull request against the main repository
5. Provide a clear description of the changes and why they are needed
6. Wait for review and feedback from the admin.

## Adding Mods
1. Instructions WIP

## Adding Assets
1. Same general idea as adding mods, but different json layouts.

## Adding Template Addons
1. Instructions WIP