# TFM2 Champion Creator — Mod Builder

A premium, visual desktop application powered by **Electron** designed to easily create, configure, and export custom champion mods for **Teamfight Manager 2**. 

With this tool, you can build full-fledged data-only mods with custom statistics, advanced skill effects, projectile bindings, sprite sheet animations, and multi-language translations without writing complex JSON files by hand.

---

## 🌟 Key Features

* **Visual Action Editor**: Build complex skill actions (Basic Attack, Skill 1, Skill 2, Ultimate) using a visual interface. Supports nesting effects (`Combine`, `Branch`, etc.).
* **Effect Recipes**: Instantly apply common game mechanics (like Crowd Control, Buffs, Shields, or AP/AD Damage scaling) using pre-built templates or save your own custom recipes.
* **Sprite Sheet & Animation Builder**: Drag and drop your character sprite sheet PNG, configure frame sizes (e.g., 40x40), define animation ranges, and generate `.fanim` files on the fly.
* **Champion Sheet Preview**: Includes a live animation player to view your sprite ranges (Idle, Attack, etc.) and a **Translation Engine** that parses your custom JSON effects into human-readable skill descriptions.
* **Compatibility & Merger**: Drag and drop existing `champion_view.champion_view` or `champion.i18n` files to merge your new champion into them, keeping your mod fully compatible with other mods.
* **Integrity Validation**: Runs real-time safety checks on your mod configurations before export to ensure no critical data is missing.
* **One-Click Export**: Downloads a ready-to-use `.zip` archive containing the correct directory structures needed by the game.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (which includes `npm`) installed on your computer.

### Installation

1. Clone or download this repository.
2. Open your terminal or Command Prompt in the project root folder.
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the App Locally

To start the desktop application in development mode:
```bash
npm start
```

### Packaging (Building the Executable)

To build a standalone executable (`.exe` for Windows) under the `dist/` directory:
```bash
npm run package
```
*(Note: The `dist/` directory is automatically ignored by Git to keep the repository clean).*

---

## 📖 How to Use the Creator

1. **Configure Mod Metadata**: In the **Mod Info** tab, set a unique `Mod ID` (use `lowercase_snake_case` like `my_champion_mod`), name, author, and description.
2. **Define Champion Stats**: Set up stats at Level 1 and set the level growth rates in the **Stats & Growth** tab.
3. **Build Actions & Skills**: Go to **Actions & Skills** and edit each ability. You can use the **Recipes** tab to quickly paste common effects (like stun, shield, or physical slash) or create complex behaviors by editing timing, ranges, and casting rules.
4. **Upload Sprites**: In the **Sprite Sheet** tab, drop your character PNG sheet. Set your frame size, preview grid borders, and define frame ranges (e.g. frames 1–4 for Idle, frames 5–8 for Attack).
5. **Add Localized Text**: Fill in the champion and skill descriptions in the **Descriptions** tab (supports English and Portuguese).
6. **Preview Your Champion**: Switch to the **Champion Sheet** to see a mock of the in-game preview, watch your animations run in real-time, and check if your visual effects description reads naturally.
7. **Export**: Under **Export Files**, check if there are any validation warnings. Click **Download All (ZIP)**. Extract the contents directly into your Teamfight Manager 2 `mods/` directory and test in-game!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

## ⚔️ Credits
Developed with ❤️ by **RayTatsu**.
