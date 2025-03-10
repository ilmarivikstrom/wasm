let pyodideReady;
let commandHistory = [];
let commandHistoryIndex = -1;

function initEasterEgg() {
  pyodideReady.FS.writeFile("/not_an_easter_egg.txt", "Qlfh#rqh/#|rx#fohyhu#forg$#P|#vhfuhwB#L#vsloohg#friihh#rq#p|#nh|erdug#dqg#wklv#phvv#lv#wkh#uhvxow1#Erz#wr#|rxu#fdiihlqh0vrdnhg#ylfwru|$", { encoding: "utf-8" });
}

async function initPort() {
  pyodideReady = await loadPyodide();

  initEasterEgg(pyodideReady);

  document.addEventListener("click", function(e) {
    console.log(e);
    if (e.target == "a") {
      e.preventDefault();
      document.getElementById("input").focus();
    }
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

    def asNewTabUrl(url: str, text: str):
      return f'<a href="{url}" target="_blank" rel="noopener noreferrer">{text}</a>'

    splash = '''
    ██████╗  ██████╗ ██████╗ ████████╗
    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
    ██████╔╝██║   ██║██████╔╝   ██║   
    ██╔═══╝ ██║   ██║██╔══██╗   ██║   
    ██║     ╚██████╔╝██║  ██║   ██║   
    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝    v0.1
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
            return f'Email: {asNewTabUrl(url="mailto:alex@example.com", text="alex@example.com")} | GitHub: {asNewTabUrl(url="https://github.com/alex", text="github.com/alex")}'

        def secret(self):
            return "There is more to explore here... 🔍"

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
  if (event?.key === "ArrowUp" || event?.key === "ArrowDown") {
    let input = document.getElementById("input");

    if (event.key === "ArrowUp") {
      if (currentHistoryIndex < commandHistory.length - 1) {
        currentHistoryIndex++;
        input.value = commandHistory[commandHistory.length - 1 - currentHistoryIndex];
      }
    } else if (event.key === "ArrowDown") {
      if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        input.value = commandHistory[commandHistory.length - 1 - currentHistoryIndex];
      } else if (currentHistoryIndex === 0) {
        currentHistoryIndex = -1;
        input.value = '';
      }
    }
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = input.value.length;
    }, 0);

    return;
  }
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

    if (!manualCommand && command && (commandHistory.length === 0 || command !== commandHistory[commandHistory.length - 1])) {
      commandHistory.push(command);
    }
    currentHistoryIndex = -1;

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

initPort();
