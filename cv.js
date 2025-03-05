let pyodideReady;

async function initPyodide() {
    pyodideReady = await loadPyodide();

    pyodideReady.FS.writeFile("/not_an_easter_egg.txt", "Qlfh#rqh/#|rx#fohyhu#forg$#P|#vhfuhwB#L#vsloohg#friihh#rq#p|#nh|erdug#dqg#wklv#phvv#lv#wkh#uhvxow1#Erz#wr#|rxu#fdiihlqh0vrdnhg#ylfwru|$", { encoding: "utf-8" });

    document.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("input").focus();
    });

    await pyodideReady.runPythonAsync(`
    import json
    import sys

    # Custom stdout to capture print output
    class OutputCapture:
        def __init__(self):
            self.buffer = ""
        def write(self, text):
            self.buffer += text
        def flush(self):
            pass
        def getvalue(self):
            return self.buffer

    sys.stdout = OutputCapture()

    splash = '''
    ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
    ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
    ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝  v0.1
    '''
    print(splash)

    # Python startup info
    version_info = f"Python {sys.version} on {sys.platform}\\nType \\"help\\", \\"copyright\\", \\"credits\\" or \\"license\\" for more information."
    print(version_info)
    `);
    document.getElementById("output").innerText = pyodideReady.globals.get('sys').stdout.getvalue();

    await pyodideReady.runPythonAsync(`

    class Alex:
        def __init__(self):
            self.name = "Alex Doe"
            self.title = "Full-Stack Developer"

        def skills(self):
            return ["Python", "JavaScript", "Node.js", "Linux", "Docker"]

        def experience(self):
            return json.dumps({
                "Tech Corp": "Software Engineer (2021-2023)",
                "Freelance": "Web Developer (2019-2021)"
            }, indent=2)

        def projects(self):
            return ["Pyodide CV", "Task Automation Script", "Personal Blog"]

        def contact(self):
            return "Email: alex@example.com | GitHub: github.com/alex"

    alex = Alex()
    `);

    setTimeout(() => {
        document.getElementById("prompt").innerText = ">>> ";
        let input = document.getElementById("input");
        input.disabled = false;
        input.value = "help(alex)";
        input.focus();
    }, 500);
}

async function runCommand(event, manualCommand = null) {
    // Handle both Enter keypress and manual calls
    if (event?.key === "Enter" || manualCommand !== null) {
        let input = document.getElementById("input");
        let command = manualCommand || input.value.trim(); // Use manualCommand if provided
        let output = document.getElementById("output");
        let terminal = document.getElementById("terminal");

        // Handle empty input...
        if (!command) {
            output.innerHTML += '\n<div class="command-line">>>> </div>';
            terminal.scrollTop = terminal.scrollHeight;
            return;
        }

        if (command.toLowerCase().includes("quit") || command.toLowerCase().includes("exit")) {
            output.innerHTML += `\n<div class="command-line">>>> ${command}</div>`;
            output.innerHTML += `<br>naughty naughty...<br>`;
            input.value = "";
            terminal.scrollTop = terminal.scrollHeight;
            return;
        }

        // Add command line with brighter green class
        output.innerHTML += `\n<div class="command-line">>>> ${command}</div>`;

        try {
            pyodideReady.globals.get('sys').stdout.buffer = "";
            let result;
            if (command.includes('=') || command.startsWith('import') || command.startsWith('def')) {
                await pyodideReady.runPythonAsync(command);
                let printed = pyodideReady.globals.get('sys').stdout.getvalue();
                if (printed) {
                    output.innerHTML += `\n${printed}`;
                }
            } else {
                result = await pyodideReady.runPythonAsync(`__result = ${command}; print(__result); __result`);
                let printed = pyodideReady.globals.get('sys').stdout.getvalue();
                if (printed) {
                    output.innerHTML += `\n${printed.trim()}<br>`;
                } else if (result !== undefined) {
                    output.innerHTML += `\n${result}`;
                }
            }
        } catch (e) {
            if (e.message.includes("MemoryError")) {
                output.innerHTML += `\n<div class="command-line">= = = = =\nNice try!<br>= = = = =</div>`;
                input.value = "";
            } else {
                output.innerHTML += `\nError: ${e.message}`;
            }
        }

        if (!manualCommand) {
            input.value = ""; // Clear input only for manual typing
        }

        requestAnimationFrame(() => {
            terminal.scrollTop = terminal.scrollHeight;
        });
    }
}

initPyodide();