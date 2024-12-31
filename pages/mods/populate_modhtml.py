import os

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[MOD TITLE] - Doki Doki Modding Central</title>
    <link rel="stylesheet" href="../../../../assets/css/styles.css">
    <link rel="stylesheet" href="../../../../components/header/header.css">
    <link rel="stylesheet" href="../../../../components/footer/footer.css">
    <link rel="stylesheet" href="../../../../assets/css/mod_style.css">
    <link rel="icon" href="../../../../assets/gui/favicon.ico" type="image/x-icon">
</head>
<body>

    <main>
        <section id="mod-container">
            <div class="mod-content">
                <h1>[MOD TITLE]</h1>
                <img src="../../../../assets/mod_prevs/[image].webp" alt="Mod Preview" class="mod-image">
                <p><strong>Author:</strong> [AUTHOR]</p>
                <p><strong>Submitted By:</strong> [SUBMITTER]</p>
                <p><strong>Description:</strong></p>
                <p>[insert description here]</p>
                <div class="mod-download">
                    <a href="link_to_download" class="download-button">[DOWNLOAD BUTTON]</a>
                </div>
            </div>
        </section>
    </main>

    <script src="../../../../components/addComponents.js"></script>
    <script src="../../../../assets/js/main.js"></script>
    <script src="../../../../pages/mods/populateMod.js"></script>
</body>
</html>
"""

BASE_DIR = "."

def populate_empty_mods(base_dir):
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file == "mod.html":
                file_path = os.path.join(root, file)
                # empty the file
                with open(file_path, "w") as f:
                    f.write("")
                # Check if the file is empty
                if os.path.getsize(file_path) == 0:
                    print(f"Populating empty file: {file_path}")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(HTML_TEMPLATE)

if __name__ == "__main__":
    populate_empty_mods(BASE_DIR)
    print("Script execution complete.")
