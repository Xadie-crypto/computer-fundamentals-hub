/* Study notes, exam blueprint, essays, and bonus pool. Content is distilled from the
   six provided sources plus standard exam-level explanations. */

window.COMPF_CONTENT = {
  meta: {
    course: "Computer Fundamentals",
    examDateLabel: "November 24",
    examDateISO: "2026-11-24T12:30:00",
    examTime: "12:30 PM to 2:30 PM",
    room: "MM 25",
    totalPoints: 60,
    bonusPoints: 5,
    durationMinutes: 120,
    sections: [
      { key: "id", numeral: "I", name: "Identification", items: 10, pointsEach: 1, total: 10, hint: "Write the term, law, or concept being described." },
      { key: "mc", numeral: "II", name: "Multiple Choice", items: 20, pointsEach: 1, total: 20, hint: "Choose the best answer from four options." },
      { key: "tf", numeral: "III", name: "Modified True or False", items: 10, pointsEach: 2, total: 20, hint: "Write TRUE, or replace the underlined word or phrase to make the statement correct." },
      { key: "essay", numeral: "IV", name: "Essay", items: 1, pointsEach: 10, total: 10, hint: "Answer in complete sentences with concrete examples from the lessons." }
    ],
    blueprint: {
      id: { systems: 2, apps: 2, programming: 2, networks: 2, trends: 1, laws: 1 },
      mc: { systems: 4, apps: 3, programming: 3, networks: 4, trends: 3, laws: 3 },
      tf: { systems: 2, apps: 2, programming: 1, networks: 2, trends: 1, laws: 2 }
    }
  },

  topics: [
    {
      id: "systems",
      name: "Systems Software",
      label: "Systems",
      source: "6-Systems-Software.pdf",
      accent: "#3257c7",
      minutes: 16,
      blurb: "The layer that runs the machine: operating systems, firmware, translators, drivers, and utilities.",
      pointers: [
        "Define system software and its middle-layer role",
        "Name and explain the five types",
        "Compare MS-DOS, Windows, Linux, Solaris, Symbian, Android, and iOS",
        "Match each OS to a real deployment scenario"
      ],
      notes: [
        {
          id: "what",
          title: "What system software is",
          html: `
            <p>System software is designed for <strong>running the computer hardware and the application programs</strong>. It acts as a <strong>middle layer between user applications and hardware</strong>, letting the user and the machine function and interact. In plain terms, it manages hardware behavior so the computer can provide the basic functionality users need.</p>
            <ul>
              <li><strong>It is not a task app.</strong> You do not use it to type an essay; you use it so the essay app can run at all.</li>
              <li><strong>It is foundational.</strong> The operating system is the most basic type; without it, other software cannot work.</li>
              <li><strong>It sits between layers.</strong> User application &rarr; system software &rarr; hardware.</li>
            </ul>
            <div class="callout"><strong>Exam pointer.</strong> The middle-layer definition is a common identification item. If the question mentions "running the hardware" or "middle layer," the answer is system software, not application software.</div>`
        },
        {
          id: "types",
          title: "The five types",
          html: `
            <table class="note-table">
              <thead><tr><th>Type</th><th>What it does</th><th>Examples / details</th></tr></thead>
              <tbody>
                <tr><td><strong>Operating system</strong></td><td>Most basic system software. Manages other programs and provides access and security to users.</td><td>Windows, Linux, macOS, Android, iOS, MS-DOS</td></tr>
                <tr><td><strong>Firmware</strong></td><td>Software permanently etched into a hardware device, stored in <strong>Read-Only Memory</strong>.</td><td>Written once by the manufacturer; found in routers, printers, and controllers</td></tr>
                <tr><td><strong>Programming language translators</strong></td><td>Mediator programs that translate high-level code into simpler machine-level code.</td><td>Compilers, interpreters, assemblers</td></tr>
                <tr><td><strong>Device drivers</strong></td><td>Control, operate, and manage a particular device at the hardware level; interface between device and OS.</td><td>Graphics driver, printer driver, network adapter driver</td></tr>
                <tr><td><strong>System utilities</strong></td><td>Maintenance and configuration of the computer system.</td><td>Anti-virus, disk cleaner, disk compression, defragmentation, reformatting</td></tr>
              </tbody>
            </table>
            <div class="callout"><strong>Do not mix these up:</strong> firmware is <em>inside a device</em>; a driver is the <em>OS-side translator</em> for a device; a utility is a <em>maintenance tool</em>; a translator turns <em>code</em> into machine code.</div>`
        },
        {
          id: "os",
          title: "Operating systems at a glance",
          html: `
            <table class="note-table compact">
              <thead><tr><th>OS</th><th>Lineage / maker</th><th>Key strengths</th><th>Watch-outs</th></tr></thead>
              <tbody>
                <tr><td><strong>MS-DOS</strong></td><td>Microsoft; IBM-compatible x86</td><td>Lightweight; simple command line; single-user</td><td>No GUI (no mouse), no multi-user, no multiprogramming: only one process in RAM</td></tr>
                <tr><td><strong>Windows</strong></td><td>Microsoft; x86 Intel and AMD</td><td>GUI; preloaded productivity tools; huge user base and software selection; backward compatible; automatic hardware detection</td><td>Paid license; high RAM, disk, and graphics requirements; slows with many programs; virus target</td></tr>
                <tr><td><strong>Linux</strong></td><td>Linus Torvalds; UNIX-based, open source</td><td>Free; portable across devices; multi-user and multitasking; symbol of open-source collaboration</td><td>Fewer mainstream apps; patchier driver support; help forums may not match your skill level</td></tr>
                <tr><td><strong>Solaris</strong></td><td>Sun (SunOS), now Oracle Solaris; SPARC and Intel</td><td>Scalability for large workloads; crash resistance; advanced security; historically dominant for web servers</td><td>Expensive enterprise licensing; no free updates; weak GUI; limited hardware support</td></tr>
                <tr><td><strong>Symbian</strong></td><td>Symbian Ltd partnership: Psion, Motorola, Ericsson, Nokia; ARM</td><td>Low power for battery devices and ROM systems; easy interface; runs Python, Java ME, Flash Lite, Ruby, .NET; stable</td><td>Not smooth; virus-prone; no virtual memory; discontinued in <strong>2014</strong></td></tr>
                <tr><td><strong>Android</strong></td><td>Google; open source; touch screen focus</td><td>Free and customizable; huge Play Store catalog; Android SDK for developers; low power consumption</td><td>Java dependency complicates modern UI; background apps drain battery; overheating under heavy load</td></tr>
                <tr><td><strong>iOS</strong></td><td>Apple; iPhone, iPad, iPod only</td><td>Intuitive, fluid interface; strong performance; default apps; SDK; safer with fewer breaches; regular security patches</td><td>Closed source and slow beta testing; large app storage; little customization; no third-party installs; resource intensive on old devices</td></tr>
              </tbody>
            </table>
            <p><strong>Scenario logic.</strong> Free and open source with old hardware: Linux. Enterprise server with scale and security regardless of price: Solaris. Closed, security-first mobile ecosystem: iOS. Low-cost customizable mobile: Android. Legacy single-user command line: MS-DOS. Discontinued mobile OS: Symbian.</p>`
        },
        {
          id: "quick",
          title: "Fast contrasts worth memorizing",
          html: `
            <ul class="two-col">
              <li><strong>Single-user:</strong> MS-DOS. <strong>Multi-user:</strong> Linux.</li>
              <li><strong>GUI:</strong> Windows, Android, iOS. <strong>CLI only:</strong> MS-DOS.</li>
              <li><strong>Open source:</strong> Linux, Android. <strong>Closed:</strong> Windows, iOS, Solaris.</li>
              <li><strong>Backward compatible:</strong> Windows. <strong>No virtual memory:</strong> Symbian.</li>
              <li><strong>SPARC heritage:</strong> Solaris. <strong>ARM smartphone heritage:</strong> Symbian.</li>
              <li><strong>Play Store and SDK:</strong> Android. <strong>Apple-only devices:</strong> iOS.</li>
            </ul>
            <div class="callout"><strong>Common trap.</strong> "Open source" does not automatically mean "no apps." The lesson says Linux has fewer apps because it does not dominate the market. Android is also open source but has a massive app store.</div>`
        }
      ]
    },
    {
      id: "apps",
      name: "Application Software",
      label: "Applications",
      source: "7-Application-Software.pdf",
      accent: "#c2560f",
      minutes: 15,
      blurb: "End-user programs, the ten categories, and the licensing family: freeware, open source, shareware, and its variants.",
      pointers: [
        "Define application software and application suite",
        "Classify the ten categories with examples",
        "Distinguish freeware, open source, and shareware",
        "Tell adware, donationware, nagware, freemium, crippleware, and trialware apart"
      ],
      notes: [
        {
          id: "what",
          title: "What application software is",
          html: `
            <p>Application software is also called <strong>end-user programs</strong> or <strong>productivity programs</strong>. It is designed so users can <strong>perform specific tasks</strong>, and every application has a <strong>user interface</strong> so people can use it easily.</p>
            <ul>
              <li>Applications may be bundled into an <strong>application suite</strong>. Microsoft Office is the classic example.</li>
              <li>Typical tasks include playing games, designing graphics, listening to music, watching videos, writing documents, and computing budgets.</li>
              <li>If the software exists to help a person do a task, it is application software. If it exists to run the machine, it is system software.</li>
            </ul>
            <div class="callout"><strong>Exam pointer.</strong> "Windows" and "Linux" are system software; "MS Word," "Excel," and "Chrome" are application software. A single question often asks you to spot the odd one out.</div>`
        },
        {
          id: "categories",
          title: "The ten categories",
          html: `
            <table class="note-table">
              <thead><tr><th>Category</th><th>Purpose</th><th>Examples from the lesson</th></tr></thead>
              <tbody>
                <tr><td><strong>Word processors</strong></td><td>Documentation: storing, formatting, and printing documents</td><td>MS Word, Apple Pages, Google Docs</td></tr>
                <tr><td><strong>Database software (DBMS)</strong></td><td>Create and manage a database; organize data</td><td>MS Access, MySQL, dBase</td></tr>
                <tr><td><strong>Multimedia software</strong></td><td>Play, create, or record images, audio, or video; editing, animation, graphics</td><td>iMovie, VLC Media Player, Adobe Premiere Pro</td></tr>
                <tr><td><strong>Education and reference (academic)</strong></td><td>Facilitate learning on a particular subject</td><td>Microsoft Encarta, Canvas, MindPlay</td></tr>
                <tr><td><strong>Graphics software</strong></td><td>Edit or change visual data; picture editors and illustration tools</td><td>Adobe Photoshop, AutoCAD, Blender</td></tr>
                <tr><td><strong>Web browsers</strong></td><td>Browse the internet; locate and retrieve data across the web</td><td>Google Chrome, Internet Explorer, Mozilla Firefox</td></tr>
                <tr><td><strong>Email programs</strong></td><td>Send and receive email</td><td>MS Outlook, Gmail, Apple Mail</td></tr>
                <tr><td><strong>Communications software</strong></td><td>Two computers with modems communicate through audio, video, and/or chat</td><td>LINE, Messenger, Zoom</td></tr>
                <tr><td><strong>Spreadsheet software</strong></td><td>Number-intensive problems: budgeting, forecasting; plots graphs</td><td>MS Excel, Google Sheets, Apple Numbers</td></tr>
                <tr><td><strong>Presentation software</strong></td><td>Multimedia stacks of cards/screens for a lesson or sales pitch; click to advance</td><td>MS PowerPoint, Google Slides, Apple Keynote</td></tr>
              </tbody>
            </table>`
        },
        {
          id: "free",
          title: "Free software models",
          html: `
            <table class="note-table">
              <thead><tr><th>Model</th><th>Cost</th><th>Source code?</th><th>Key idea</th></tr></thead>
              <tbody>
                <tr><td><strong>Freeware</strong></td><td>Free</td><td>No</td><td>Completely free, never requires payment <em>as long as it is not modified</em>.</td></tr>
                <tr><td><strong>Open source</strong></td><td>Free</td><td>Yes</td><td>Similar to freeware, but the source code is available to everyone.</td></tr>
                <tr><td><strong>Shareware / trial</strong></td><td>Free for a trial</td><td>Usually no</td><td>Try for a few days; after expiry, enter a code or register.</td></tr>
              </tbody>
            </table>
            <p><strong>Freemium</strong> is related but distinct: the basic version is free, while premium features require payment.</p>`
        },
        {
          id: "shareware",
          title: "The shareware family",
          html: `
            <table class="note-table">
              <thead><tr><th>Variant</th><th>How it earns or limits</th><th>Remember it by</th></tr></thead>
              <tbody>
                <tr><td><strong>Adware</strong></td><td>Displays unwanted advertisements to earn revenue</td><td>Advertising-supported</td></tr>
                <tr><td><strong>Donationware</strong></td><td>Full-featured version; asks for an optional payment</td><td>Donation, not a demand</td></tr>
                <tr><td><strong>Nagware</strong></td><td>Continuously reminds the user to pay via alerts or dialogue boxes</td><td>Also called begware, annoyware, begscreen</td></tr>
                <tr><td><strong>Freemium</strong></td><td>Basic features free; special features paid</td><td>Free + premium</td></tr>
                <tr><td><strong>Demoware</strong></td><td>A trial or demonstration version; the umbrella term</td><td>Splits into two types below</td></tr>
                <tr><td><strong>Crippleware</strong></td><td>Only a certain number of features, with a time limit</td><td>Features are crippled</td></tr>
                <tr><td><strong>Trialware</strong></td><td>All features within a time limit</td><td>Full features, limited time</td></tr>
              </tbody>
            </table>
            <div class="callout"><strong>Most common confusion.</strong> Crippleware limits <em>features</em>; trialware limits <em>time</em>. Both are demoware. Nagware nags; adware advertises; donationware asks nicely; freemium keeps premium features behind a paywall.</div>`
        }
      ]
    },
    {
      id: "programming",
      name: "Programming Languages",
      label: "Programming",
      source: "8-Programming-Languages.pdf",
      accent: "#6d48c8",
      minutes: 12,
      blurb: "The third software category, five generations of languages, and how translators turn source into something a CPU can run.",
      pointers: [
        "Define programming language and syntax",
        "Order and describe 1GL to 5GL",
        "Match example languages to generations",
        "Explain assembler, compiler, and interpreter"
      ],
      notes: [
        {
          id: "what",
          title: "What a programming language is",
          html: `
            <p>A programming language is the <strong>third category of computer software</strong>. Programmers use it to write <strong>programs, scripts, and instructions</strong> that a computer can execute. Languages are similar in purpose; the main difference is <strong>syntax</strong>, the rules for writing valid code.</p>
            <ul>
              <li><strong>Source code</strong> is the human-readable text a programmer writes.</li>
              <li><strong>Machine code</strong> is the binary form (zeros and ones) the processor can execute.</li>
              <li>A <strong>translator</strong> is the bridge between the two.</li>
            </ul>`
        },
        {
          id: "generations",
          title: "The five generations",
          html: `
            <table class="note-table compact">
              <thead><tr><th>Generation</th><th>Level</th><th>Description</th><th>Examples</th><th>Translator</th></tr></thead>
              <tbody>
                <tr><td><strong>1GL</strong></td><td>Low</td><td>Machine language written as binary code (0s and 1s)</td><td>Raw machine code</td><td>None; directly executable</td></tr>
                <tr><td><strong>2GL</strong></td><td>Low</td><td>Assembly language using structured commands instead of binary; popular in the late 1950s; used in kernels and hardware drivers</td><td>Assembly</td><td>Assembler</td></tr>
                <tr><td><strong>3GL</strong></td><td>High</td><td>High-level code with English-type words; must be translated before execution</td><td>Pascal, C, C++, Java, BASIC, JavaScript</td><td>Compiler or interpreter</td></tr>
                <tr><td><strong>4GL</strong></td><td>Very high</td><td>English-type statements similar to human language; used mainly in database programming and scripting</td><td>Perl, Python, Ruby, SQL, MATLAB</td><td>Compiler or interpreter</td></tr>
                <tr><td><strong>5GL</strong></td><td>Very high</td><td>Visual tools to develop a program</td><td>Mercury, OPS5, Prolog</td><td>Environment-dependent</td></tr>
              </tbody>
            </table>
            <p>The higher the generation, the more the language hides hardware detail and the more English-like the code becomes.</p>`
        },
        {
          id: "translate",
          title: "Translation: assembler, compiler, interpreter",
          html: `
            <table class="note-table">
              <thead><tr><th>Tool</th><th>Input</th><th>How it works</th></tr></thead>
              <tbody>
                <tr><td><strong>Assembler</strong></td><td>Assembly (2GL)</td><td>Converts structured assembly statements into machine language.</td></tr>
                <tr><td><strong>Compiler</strong></td><td>High-level source (3GL/4GL)</td><td>Translates the whole program into binary before execution.</td></tr>
                <tr><td><strong>Interpreter</strong></td><td>High-level source</td><td>Translates and executes line by line.</td></tr>
              </tbody>
            </table>
            <div class="callout"><strong>Scenario mapping.</strong> Hardware driver or kernel work &rarr; 2GL assembly. Direct CPU control &rarr; 1GL. General software with readable code &rarr; 3GL. Database queries and scripts &rarr; 4GL. Visual or logic-based AI tools &rarr; 5GL.</div>`
        }
      ]
    },
    {
      id: "networks",
      name: "Computer Networks",
      label: "Networks",
      source: "9-Importance-of-Computer-Networks.pdf",
      accent: "#0f7a78",
      minutes: 18,
      blurb: "Components, devices, network types, topologies, the client-server model, and the protocols that move data.",
      pointers: [
        "Define a network and its components",
        "Identify end devices and intermediary devices",
        "Compare LAN, MAN, and WAN",
        "Draw and compare the five topologies",
        "Explain HTTP, TCP, and IP roles"
      ],
      notes: [
        {
          id: "what",
          title: "What a network is",
          html: `
            <p>A <strong>computer network</strong> is a set of computers connected together for the purpose of <strong>sharing resources</strong>. Networks support games, shared databases, email, video conferencing, and file transfer.</p>
            <h3>Components</h3>
            <ul>
              <li><strong>End devices</strong> are computing devices that interconnect and each have a <strong>unique IP address</strong>: laptops, phones, servers, printers.</li>
              <li><strong>Intermediary devices</strong> provide connectivity, connect individual networks, and connect segments within the same network. Subtypes: network access devices, internetworking devices, communication servers and modems, and security devices.</li>
            </ul>
            <div class="callout"><strong>Exam pointer.</strong> A router is an intermediary device. A laptop is an end device. A modem is an intermediary device that brings ISP service.</div>`
        },
        {
          id: "devices",
          title: "Common network devices",
          html: `
            <table class="note-table">
              <thead><tr><th>Device</th><th>Function</th><th>Typical clue in a question</th></tr></thead>
              <tbody>
                <tr><td><strong>Ethernet hub</strong></td><td>Connects multiple computers so they act as a single segment</td><td>"single segment"</td></tr>
                <tr><td><strong>Switch</strong></td><td>Connects devices together on a computer network</td><td>"connects devices within a LAN"</td></tr>
                <tr><td><strong>Router</strong></td><td>Small electronic device that joins multiple networks via wired or wireless links</td><td>"joins networks" or "best path"</td></tr>
                <tr><td><strong>Network card (NIC)</strong></td><td>Hardware that connects a computer with the network</td><td>"interface between PC and network"</td></tr>
                <tr><td><strong>Modem</strong></td><td>Enables a computer to transmit data; brings internet service from an ISP</td><td>"ISP" or "signal conversion"</td></tr>
              </tbody>
            </table>`
        },
        {
          id: "types",
          title: "LAN, MAN, WAN",
          html: `
            <table class="note-table">
              <thead><tr><th>Type</th><th>Scope</th><th>Key idea</th></tr></thead>
              <tbody>
                <tr><td><strong>LAN</strong> (Local Area Network)</td><td>Single geographical area</td><td>Individual network providing services to people in one organizational structure.</td></tr>
                <tr><td><strong>MAN</strong> (Metropolitan Area Network)</td><td>Between cities / metro area</td><td>Interconnects LANs with a high-capacity backbone and provides uplinks to WANs and the internet.</td></tr>
                <tr><td><strong>WAN</strong> (Wide Area Network)</td><td>Large geographic distance</td><td>Connects two or more LANs; a gateway handles communication between the LAN and other networks.</td></tr>
              </tbody>
            </table>
            <p><strong>Client-server model:</strong> servers have software that lets them <em>provide</em> information and services; clients have software that lets them <em>request and display</em> information from the server.</p>`
        },
        {
          id: "topologies",
          title: "Network topologies",
          html: `
            <p>A topology is the <strong>arrangement of the computers in a network</strong>.</p>
            <table class="note-table">
              <thead><tr><th>Topology</th><th>How it works</th><th>Strength</th><th>Weakness</th></tr></thead>
              <tbody>
                <tr><td><strong>Bus</strong></td><td>Every computer and device connects to a single cable.</td><td>Simple and cable-efficient.</td><td>One cable break can disrupt the segment; harder to troubleshoot.</td></tr>
                <tr><td><strong>Ring</strong></td><td>Each computer connects to another; the last connects to the first.</td><td>Orderly, predictable flow.</td><td>A break can affect the loop; adding nodes interrupts it.</td></tr>
                <tr><td><strong>Star</strong></td><td>All computers connect to a single central hub through a cable.</td><td>Easy to manage; one failed link affects one device.</td><td>The central hub is a single point of failure.</td></tr>
                <tr><td><strong>Mesh</strong></td><td>All nodes cooperate to distribute data among each other.</td><td>Redundant paths and resilience.</td><td>More cabling and configuration effort.</td></tr>
                <tr><td><strong>Hybrid</strong></td><td>Combines two or more topologies so the result does not exhibit one standard topology.</td><td>Flexible for large or mixed networks.</td><td>More complex to design and maintain.</td></tr>
              </tbody>
            </table>`
        },
        {
          id: "protocols",
          title: "Protocols and communication",
          html: `
            <p><strong>Protocols</strong> are the rules that govern communications. A group of related protocols needed to communicate electronically is a <strong>protocol suite</strong>. Networking protocols describe the message format or structure, how devices share information, how and when errors are passed, and how data transfer sessions are set up and determined.</p>
            <table class="note-table">
              <thead><tr><th>Protocol</th><th>Role</th><th>Memory hook</th></tr></thead>
              <tbody>
                <tr><td><strong>HTTP</strong></td><td>Governs interaction between a web server and a web client</td><td>Web pages</td></tr>
                <tr><td><strong>TCP</strong></td><td>Handles individual conversations between servers and clients; splits HTTP messages into <strong>segments</strong></td><td>Conversation and segmentation</td></tr>
                <tr><td><strong>IP</strong></td><td>Used by routers to select the best path to the destination host</td><td>Routing and addressing</td></tr>
              </tbody>
            </table>
            <p>A message usually contains <strong>multiple protocols plus the actual data</strong>, and the application header (for example HTTP) may or may not exist.</p>
            <div class="callout"><strong>Scenario:</strong> You open a webpage. HTTP defines the request and response with the server, TCP breaks the message into segments and manages the conversation, and IP lets routers choose the path across networks.</div>`
        }
      ]
    },
    {
      id: "trends",
      name: "Emerging Trends",
      label: "Trends",
      source: "TRENDS AND LAWS NOTES.docx",
      accent: "#bb2d5e",
      minutes: 20,
      blurb: "Philippine and global digital statistics, social media forms and trust, the 1G-to-5G timeline, and 2022's biggest technology shifts.",
      pointers: [
        "Recall the Philippine and global digital statistics",
        "Classify the six forms of social media",
        "Explain the 1G to 5G evolution and speeds",
        "Describe 5G, autonomous driving, and edge computing",
        "Identify online risks and responsible use"
      ],
      notes: [
        {
          id: "stats",
          title: "Digital Philippines, January 2022",
          html: `
            <table class="note-table">
              <thead><tr><th>Metric</th><th>January 2022</th><th>Year-on-year change</th></tr></thead>
              <tbody>
                <tr><td>Population</td><td><strong>111.8 million</strong> (48.0% urban)</td><td>+1.3% (+1.5 million)</td></tr>
                <tr><td>Cellular mobile connections</td><td><strong>156.5 million</strong> (140.0% of population)</td><td>+6.9 million (+4.6%)</td></tr>
                <tr><td>Internet users</td><td><strong>76.01 million</strong> (68.0%)</td><td>+2.1 million (+2.8%)</td></tr>
                <tr><td>Social media users</td><td><strong>92.05 million</strong> (82.4%)</td><td>+3.1 million (+3.4%)</td></tr>
              </tbody>
            </table>
            <p>Mobile connections can exceed the population because many people use more than one connection, such as one for personal use and one for work. GSMA Intelligence supplied the mobile figures.</p>
            <p><strong>Global snapshot, April 2022:</strong> 7.93 billion people; 5.32 billion mobile users (67%); 5.00 billion internet users (63%); 4.65 billion social media users (58.7%). Roughly three-quarters of people aged 13 and above who can use social media already do.</p>
            <div class="callout"><strong>Exam pointer.</strong> Keep the four Philippine numbers straight: 111.8M population, 156.5M mobile connections, 76.01M internet users, 92.05M social media users. The percentages are 68.0% and 82.4% for internet and social media.</div>`
        },
        {
          id: "social",
          title: "Social media: definition and forms",
          html: `
            <p><strong>Social media</strong> is a platform where interaction can be made by both the machine and the users in order to share data or information that can be beneficial to various users. It was created and designed for public use, whether free or paid.</p>
            <table class="note-table">
              <thead><tr><th>Form</th><th>What it does</th><th>Examples</th></tr></thead>
              <tbody>
                <tr><td><strong>Social networking</strong></td><td>Casual form for socializing with friends, classmates, and others</td><td>Facebook, LinkedIn</td></tr>
                <tr><td><strong>Forums and message boards</strong></td><td>Hobby sites where visitors interact with opinions, advice, and help</td><td>Reddit-style communities</td></tr>
                <tr><td><strong>Microblogging</strong></td><td>Short posts, usually 160 to 280 characters, sent from a phone or computer</td><td>Twitter</td></tr>
                <tr><td><strong>Blogging</strong></td><td>Longer posts with comment sections that become interactive hubs</td><td>Medium, Tumblr</td></tr>
                <tr><td><strong>Bookmarking</strong></td><td>Personalized identifiers to save and identify network sites</td><td>Digg, Mix, Pinterest</td></tr>
                <tr><td><strong>Media sharing</strong></td><td>Watch, view, and upload images and videos, with comments and profiles</td><td>YouTube, Instagram</td></tr>
              </tbody>
            </table>`
        },
        {
          id: "trust",
          title: "News, trust, and generations",
          html: `
            <p>Television networks, radio stations, and newspapers, the triad of <strong>traditional media</strong>, remain the most trusted media channels among Filipinos, far surpassing trust in social media sites. Only about <strong>49% of Filipinos</strong> were said to have access to social media, and those online still trust the media as an institution more than social media.</p>
            <p>Trust in specific sources differs by generation. Gen Z trusts YouTube more (67% vs. 63% for Millennials), while Millennials trust Twitter (58% vs. 36%), Facebook (53% vs. 41%), Instagram (55% vs. 40%), and Reddit (53% vs. 37%) more than Gen Z. Relative trust shapes where each generation gets its news.</p>
            <div class="callout"><strong>Careful reading.</strong> "Trust in a platform" is not the same as "use of a platform." The data compares stated trust in sources for accurate information.</div>`
        },
        {
          id: "mobile",
          title: "Mobile technology timeline",
          html: `
            <table class="note-table">
              <thead><tr><th>Generation</th><th>Years</th><th>Key change</th><th>Speed (chart)</th><th>Limitations / notes</th></tr></thead>
              <tbody>
                <tr><td><strong>1G</strong></td><td>1987 to 1991</td><td>Analog voice only; brick phones; SIM cards introduced</td><td>2.4 Kb/s</td><td>Poor voice quality; no security</td></tr>
                <tr><td><strong>2G</strong></td><td>1991 to 2001</td><td>Digital GSM; SMS and MMS; encrypted, clearer calls</td><td>64 Kb/s</td><td>Text and basic multimedia</td></tr>
                <tr><td><strong>3G</strong></td><td>2001 to 2009</td><td>Data transfer four times faster than 2G; streaming; large downloads; powered smartphones</td><td>2 Mb/s</td><td>Better capacity and advanced services</td></tr>
                <tr><td><strong>4G</strong></td><td>Between 3G and 5G</td><td>High-speed mobile data</td><td>100 Mb/s</td><td>Foundation for modern mobile apps</td></tr>
                <tr><td><strong>5G</strong></td><td>2019 and beyond</td><td>10 to 100 times faster than 4G; IoT at scale; low latency</td><td>More than 1 Gb/s; peak 20 Gb/s</td><td>Downloading a 5 GB DVD: about 13 minutes at 50 MB/s, about 2 seconds on 5G</td></tr>
              </tbody>
            </table>
            <p><strong>5G goals:</strong> amplified broadband for mobile communication, object-specific transformation with increased connectivity, unlimited scope for IoT enhancement, and increased flexibility and support. Huawei claims 5G supports 1,000-fold capacity, 100 billion devices, and a 10 Gb/s individual experience.</p>`
        },
        {
          id: "trends2022",
          title: "Trends to watch in 2022 and beyond",
          html: `
            <ul>
              <li><strong>5G:</strong> faster, lower-latency connectivity that unlocks IoT, smart cities, AR/VR, and self-driving cars.</li>
              <li><strong>Autonomous driving:</strong> Tesla, Alphabet, and Waymo build vehicles with automated braking, lane-changing, and other in-car automation using data capture and analytics.</li>
              <li><strong>Edge computing:</strong> brings data storage and computation closer to businesses and data sources. It improves response times, saves bandwidth, reduces latency, lowers the cost of retaining data, and helps with local compliance, privacy, and data sovereignty. It is fueled by IoT and distributed cloud services.</li>
            </ul>
            <p><strong>Mentioned but not discussed in detail:</strong> human augmentation, distributed cloud, AI products, and medical upgrade through 3D printing.</p>
            <p><strong>Adoption speed for 50 million users:</strong> mobile phones 10 years, internet 7 years, Facebook 4 years, WeChat 1 year, Pokemon Go 19 days.</p>
            <p><strong>Market context:</strong> IDC estimated 2.3 trillion dollars in global technology and services spending, with digital transformation spending growing at a 17.1% CAGR from 2019 to 2023. Philippine e-commerce was estimated at 1.49 billion dollars in 2018.</p>`
        },
        {
          id: "risks",
          title: "Risks and responsible use",
          html: `
            <ul>
              <li><strong>Privacy:</strong> social media can invade privacy through catfishing, fraud, phishing, hacking, threats, plagiarism, stalking, and copyright violations.</li>
              <li><strong>Health:</strong> excessive use is linked to poor eyesight, brain damage (temporary or lifetime), and back problems.</li>
              <li><strong>Cyberbullying:</strong> can lead to depression and suicidal tendencies, especially among millennials.</li>
              <li><strong>Productivity:</strong> reliance on online information encourages copying, while distraction reduces focus on schoolwork and household tasks.</li>
              <li><strong>Commerce risks:</strong> fake products, tricks that fool customers, and meet-up crimes make e-commerce a risky medium if used carelessly.</li>
            </ul>
            <div class="callout"><strong>Exam pointer.</strong> Do not confuse "emerging trend" with "benefit." Edge computing and 5G are trends with benefits; misinformation and cyberbullying are risks that accompany social media adoption.</div>`
        }
      ]
    },
    {
      id: "laws",
      name: "Computer Technology Laws",
      label: "Laws",
      source: "TRENDS AND LAWS NOTES.docx",
      accent: "#a06a12",
      minutes: 22,
      blurb: "The five Philippine laws on the pointers, the offenses they punish, and the rights and agencies they create.",
      pointers: [
        "Match each Republic Act to its title and purpose",
        "Identify the cybercrime offenses and enforcement rules",
        "List the rights of a data subject",
        "Apply the right law to a scenario"
      ],
      notes: [
        {
          id: "register",
          title: "The law register",
          html: `
            <table class="note-table compact">
              <thead><tr><th>Republic Act</th><th>Title</th><th>Year</th><th>Core focus</th></tr></thead>
              <tbody>
                <tr><td><strong>R.A. 10175</strong></td><td>Cybercrime Prevention Act of 2012</td><td>2012</td><td>Defines and punishes cybercrime; prevention, investigation, suppression, penalties</td></tr>
                <tr><td><strong>R.A. 10173</strong></td><td>Data Privacy Act of 2012</td><td>2012</td><td>Protects personal information in government and private ICT systems; creates the NPC</td></tr>
                <tr><td><strong>R.A. 9775</strong></td><td>Anti-Child Pornography Act of 2009</td><td>2009</td><td>Defines and punishes child pornography in all media; protects children</td></tr>
                <tr><td><strong>R.A. 9995</strong></td><td>Anti-Photo and Video Voyeurism Act of 2009</td><td>2010</td><td>Prohibits secret capture and sharing of private areas</td></tr>
                <tr><td><strong>R.A. 10844</strong></td><td>Department of Information and Communications Technology Act of 2015</td><td>2016</td><td>Creates the DICT as the primary ICT policy and planning agency</td></tr>
              </tbody>
            </table>
            <div class="callout"><strong>Number trap.</strong> 10175 is cybercrime, 10173 is privacy. The higher number is not the newer privacy law. 9775 (2009) protects children; 9995 (2009) protects private areas.</div>`
        },
        {
          id: "cybercrime",
          title: "R.A. 10175: cybercrime offenses",
          html: `
            <p>The Cybercrime Prevention Act declares that the State must protect the integrity of computer systems, networks, and databases, and the confidentiality, integrity, and availability of information. Its offenses fall into four groups:</p>
            <table class="note-table">
              <thead><tr><th>Group</th><th>Offenses</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><strong>Against confidentiality, integrity, availability</strong></td><td>Illegal access; illegal interception; data interference; system interference; misuse of devices</td><td>Breaking into systems, intercepting transmissions, altering or deleting data, disrupting systems, and producing tools for these acts.</td></tr>
                <tr><td><strong>Computer-related</strong></td><td>Computer-related forgery; computer-related fraud; computer-related identity theft</td><td>Using a computer to create inauthentic data, commit fraud, or steal and misuse identifying information.</td></tr>
                <tr><td><strong>Content-related</strong></td><td>Cybersex; child pornography; unsolicited commercial communications</td><td>Paid sexual acts via computer, child sexual abuse material, and spam.</td></tr>
                <tr><td><strong>Other</strong></td><td>Libel committed through a computer system</td><td>Online defamation, commonly called cyber libel.</td></tr>
              </tbody>
            </table>
            <p><strong>Also covered:</strong> crimes defined in the Revised Penal Code when committed through ICT, plus attempts, and aiding or abetting. <strong>Cybersquatting</strong> is the bad-faith acquisition of a domain name to profit, mislead, destroy reputation, or deprive others.</p>
            <p><strong>Enforcement.</strong> Real-time collection of traffic data requires due cause and a court order; the <em>content</em> of communications requires a warrant. Computer data can be preserved by order, generally for six months and renewable. The <strong>DOJ Office of Cybercrime</strong> and the <strong>CICC</strong> coordinate enforcement, and the law provides for international cooperation.</p>`
        },
        {
          id: "privacy",
          title: "R.A. 10173: data privacy",
          html: `
            <p>The Data Privacy Act protects the fundamental human right of privacy of communication while ensuring the free flow of information. It applies to personal information in government and private sector ICT systems and creates the <strong>National Privacy Commission (NPC)</strong>.</p>
            <h3>The eight data subject rights</h3>
            <ul class="two-col">
              <li><strong>To be informed</strong> whether and how data is processed</li>
              <li><strong>To object</strong> to processing</li>
              <li><strong>To access</strong> the data held about you</li>
              <li><strong>To rectify</strong> inaccurate or incomplete data</li>
              <li><strong>To erasure or blocking</strong> of data</li>
              <li><strong>To damages</strong> for harm suffered</li>
              <li><strong>To file a complaint</strong> with the NPC</li>
              <li><strong>To data portability</strong> to another service</li>
            </ul>
            <p><strong>Key concepts.</strong> <em>Personal information</em> is any information from which identity is apparent or can be reasonably ascertained. <em>Sensitive personal information</em> includes health, race, ethnic origin, marital status, age, religion, political affiliation, education, genetic data, sexual life, and legal proceedings. <em>Processing</em> covers collection, recording, storage, use, consolidation, blocking, erasure, and destruction.</p>
            <p><strong>Roles.</strong> The <em>personal information controller</em> decides how and why data is processed. The <em>personal information processor</em> processes on the controller's behalf. A <em>Data Protection Officer</em> oversees compliance. Consent must be <strong>freely given, specific, and informed</strong>. Breaches are generally notified to the NPC within <strong>72 hours</strong>.</p>`
        },
        {
          id: "others",
          title: "R.A. 9775, 9995, and 10844",
          html: `
            <ul>
              <li><strong>R.A. 9775, Anti-Child Pornography Act of 2009.</strong> A child is below 18. Child pornography includes any representation, whether visual, audio, or written, by electronic, mechanical, digital, optical, magnetic, or other means, of a child engaged in real or simulated explicit sexual activities, or any representation of a child's sexual parts primarily for sexual purposes. The law punishes production, distribution, publication, sale, and related acts, and requires internet service providers to install blocking or filtering software and report violations. It created an inter-agency council against child pornography.</li>
              <li><strong>R.A. 9995, Anti-Photo and Video Voyeurism Act of 2009.</strong> Prohibits capturing or recording a person's private area without consent in a place where there is a reasonable expectation of privacy, and prohibits reproducing, broadcasting, sharing, or publishing such recordings. A private area includes naked or undergarment-clad genitals, buttocks, or breasts. The penalty is 3 to 7 years imprisonment and a fine of 100,000 to 500,000 pesos.</li>
              <li><strong>R.A. 10844, DICT Act of 2015.</strong> Creates the Department of Information and Communications Technology as the primary policy, planning, coordinating, implementing, and administrative entity for ICT in the executive branch.</li>
            </ul>
            <div class="callout"><strong>Scenario matching.</strong> Hacked account &rarr; 10175. Leaked student records &rarr; 10173. Child sexual abuse material online &rarr; 9775. Secret video in a private room &rarr; 9995. ICT policy and infrastructure &rarr; 10844.</div>`
        }
      ]
    }
  ],

  essays: [
    {
      id: "essay-systems",
      topic: "systems",
      title: "The middle layer",
      prompt: "Explain how systems software mediates between user applications and computer hardware. In your answer, define system software and discuss at least three of its five types, giving a concrete example of each. Conclude by explaining what would happen to a computer without an operating system.",
      model: "Systems software is the layer that runs the hardware and supports applications. It sits between the user application and the physical machine. Five types exist: the operating system, which manages programs and provides access and security; firmware, permanently stored in ROM by the manufacturer; programming language translators, which convert high-level code to machine code; device drivers, which let the OS control specific hardware; and system utilities, which handle maintenance such as antivirus scans and defragmentation. For example, a word processor cannot print without the OS, a printer driver, and the printer's firmware cooperating. Without an operating system, applications would have no way to request memory, access storage, or share the CPU, so the machine could not run general-purpose software at all.",
      outline: ["Define system software and the middle-layer role", "Explain OS, firmware, translator, driver, utility with examples", "Use one end-to-end example such as printing a document", "Conclude: no OS means no shared resource management or app platform"],
      rubric: [
        { criterion: "Definition and thesis", points: 2 },
        { criterion: "Three or more types explained accurately", points: 4 },
        { criterion: "Concrete examples and end-to-end reasoning", points: 2 },
        { criterion: "Organization, clarity, and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-os-choice",
      topic: "systems",
      title: "Choosing an operating system",
      prompt: "A public school has a limited budget, a laboratory of aging desktop computers, and a set of tablets for students. The administration also needs a server to host its website. Recommend an operating system for each situation, using the strengths and drawbacks discussed in the lesson. Justify why the alternatives are less suitable.",
      model: "For the aging laboratory, Linux is the strongest choice because it is free, open source, portable, and can run on varied hardware, which lowers licensing and upgrade costs. Its main risks are fewer mainstream applications and patchier driver support, so the school should standardize on hardware with known Linux support. For the tablets, Android is appropriate because it is open source, customizable, low power, and supported by a large Play Store catalog; iOS would be safer and smoother but is closed, expensive, and restricts third-party installation. For the website server, Solaris is designed for scalability and security, but its cost and weak GUI make it a poor fit for a public school unless enterprise support is required; a Linux server is the pragmatic alternative. Windows is familiar and backward compatible but carries license costs and high resource requirements, which strain an aging lab.",
      outline: ["State constraints: budget, old PCs, tablets, server", "Linux for old PCs: free, portable, but driver/app limits", "Android for tablets: open, cheap, large app store; iOS tradeoffs", "Server: Solaris strengths vs. cost; Linux alternative", "Recommend and acknowledge tradeoffs"],
      rubric: [
        { criterion: "Clear recommendation for all three cases", points: 2 },
        { criterion: "Accurate use of OS strengths and drawbacks", points: 4 },
        { criterion: "Comparison with alternatives", points: 2 },
        { criterion: "Organization and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-apps",
      topic: "apps",
      title: "The small business toolkit",
      prompt: "A small online shop needs to write proposals, track sales and expenses, store customer records, design product posters, present to investors, and communicate with suppliers abroad. Identify the application software category for each need with an example, then explain which free software models the owner should understand before downloading tools, including the risks of adware and crippleware.",
      model: "Proposals require a word processor such as Google Docs or MS Word. Sales and expenses fit spreadsheet software such as Excel or Google Sheets because it computes numbers and plots graphs. Customer records need database software or a DBMS such as MS Access or MySQL. Posters require graphics software such as Photoshop or Blender. Investor updates require presentation software such as PowerPoint or Google Slides. Supplier communication is best served by communications software such as Zoom and an email program such as Outlook. Before downloading tools, the owner should understand freeware, open source, and shareware. Freeware is free but closed; open source also provides source code; shareware is a time-limited trial. Adware displays unwanted advertisements and can distract or expose users, while crippleware restricts features and can force a purchase mid-project. The owner should prefer reputable open-source or paid tools for business-critical work.",
      outline: ["Map each business need to a category and example", "Explain freeware vs. open source vs. shareware", "Warn about adware, crippleware, and trial limits", "Recommend a responsible toolkit"],
      rubric: [
        { criterion: "Correct category mapping", points: 4 },
        { criterion: "Accurate licensing model explanations", points: 3 },
        { criterion: "Risk awareness and practical advice", points: 1 },
        { criterion: "Organization and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-programming",
      topic: "programming",
      title: "From source to machine",
      prompt: "Describe the five generations of programming languages. Then explain how a programmer's source code becomes something the processor can execute, using the terms assembler, compiler, and interpreter. Finally, match three tasks (a hardware driver, a database report, and a beginner programming class) to the most appropriate generation and justify each choice.",
      model: "First generation languages are machine language written in binary. Second generation languages are assembly, using structured commands and an assembler. Third generation languages are high-level, readable languages such as C, C++, Java, and Pascal, translated by a compiler or interpreter. Fourth generation languages use English-like statements for database programming and scripting, such as SQL and Python. Fifth generation languages use visual tools, such as Prolog and Mercury. Source code must be translated because the CPU executes binary machine code. An assembler converts assembly to machine language. A compiler translates the whole program before execution, while an interpreter translates and runs it line by line. A hardware driver is best written in assembly (2GL) for direct hardware control. A database report fits SQL (4GL) because it expresses queries declaratively. A beginner class fits a readable 3GL such as Java or Pascal, where English-like syntax teaches core logic without hardware detail.",
      outline: ["Order and define 1GL through 5GL with examples", "Explain source, machine code, and the three translators", "Match driver to 2GL, report to 4GL, class to 3GL", "Conclude with the tradeoff between control and readability"],
      rubric: [
        { criterion: "Accurate generation descriptions and examples", points: 4 },
        { criterion: "Correct translator explanations", points: 2 },
        { criterion: "Task-to-generation justification", points: 2 },
        { criterion: "Organization and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-network",
      topic: "networks",
      title: "Designing a two-campus network",
      prompt: "A college has one campus in Cebu and another in Manila. Each campus has classrooms, a computer laboratory, and a small server room. Design a network plan that connects the campuses and supports shared databases, email, video conferencing, and file transfer. Identify the network types, the devices you would deploy, the topology for each laboratory, and the protocols involved. Justify your choices.",
      model: "Each campus should have a LAN connecting classrooms, the laboratory, and the server room. The two campuses should be joined by a WAN over a large distance, with gateways at each site; a MAN could interconnect LANs within a metropolitan area but not between cities. In each laboratory, a star topology with a central switch is practical because one failed cable affects only one workstation, while the switch becomes the critical point to protect. A router joins the campus LAN to the WAN, NICs connect each computer, and modems or ISP links provide external connectivity. A hub is not preferred because it treats all computers as one segment. Shared databases and file servers sit in the server room, with clients requesting data and servers providing it. HTTP supports web-based services, TCP segments and manages conversations for reliable delivery, and IP lets routers choose paths between Cebu and Manila. FTP moves large files, while video conferencing apps depend on low latency and sufficient bandwidth.",
      outline: ["Separate LANs per campus, WAN between cities", "Devices: switch, router, NIC, modem, gateway", "Topology: star per lab with justification", "Protocols: HTTP, TCP, IP, FTP", "Client-server roles and reliability"],
      rubric: [
        { criterion: "Correct network types and scope", points: 2 },
        { criterion: "Appropriate devices with roles", points: 3 },
        { criterion: "Topology choice and justification", points: 2 },
        { criterion: "Protocols and client-server explanation", points: 1 },
        { criterion: "Organization and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-protocols",
      topic: "networks",
      title: "What happens when you open a webpage",
      prompt: "Trace what happens when a student types a website address into a browser and presses Enter. Explain the roles of the client, the server, HTTP, TCP, and IP, and explain why the message is split into segments. Then describe two things that could go wrong in this process and how the network design reduces the impact.",
      model: "The student's device acts as the client, requesting information. The browser sends an HTTP request to the web server, which provides the page. TCP manages the conversation between client and server and divides the HTTP message into smaller segments so it can be transmitted reliably and reassembled. IP lets routers select the best path to the destination host across interconnected networks. The server responds with HTTP content, which the browser displays. Two failures could occur: a link or device could fail, and congestion could delay segments. A star topology limits a broken cable to one workstation, mesh or redundant paths keep traffic moving, and TCP's segmentation and conversation management allow retransmission and correct ordering. Routers also choose alternate paths when one route is unavailable.",
      outline: ["Client requests, server responds", "HTTP defines the request and response", "TCP segments and manages the conversation", "IP routes across networks", "Failure modes and design mitigations"],
      rubric: [
        { criterion: "Accurate client-server and HTTP explanation", points: 3 },
        { criterion: "Accurate TCP segmentation and IP routing", points: 3 },
        { criterion: "Failure analysis with network design links", points: 2 },
        { criterion: "Organization and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-trends",
      topic: "trends",
      title: "5G and edge computing for MSMEs",
      prompt: "Discuss how 5G and edge computing could help Philippine micro, small, and medium enterprises. Use the statistics and concepts from the lesson. Then evaluate two risks, including the digital divide, and recommend how a small business should adopt these technologies responsibly.",
      model: "The Philippines had 92.05 million social media users and 76.01 million internet users in January 2022, showing a large digital market but also a gap: only about 68% used the internet and only 49% were said to have social media access. 5G promises speeds 10 to 100 times faster than 4G, peak rates around 20 Gb/s, lower latency, and support for many IoT devices. For an MSME, that enables faster mobile sales, real-time inventory sensors, and smoother video consultations. Edge computing brings storage and computation closer to the business, improving response times, saving bandwidth, reducing latency, and supporting local compliance and data sovereignty. The risks are unequal access, since rural and low-income users may lack devices or connectivity, and security/privacy exposure as more devices connect. A small business should start with a clear use case, budget for devices and training, protect customer data under the Data Privacy Act, and avoid collecting more data than necessary. Government and industry should invest in affordable connectivity so the benefits are not limited to urban firms.",
      outline: ["Use at least three lesson statistics", "Explain 5G benefits and edge computing benefits", "Discuss digital divide and privacy/security risks", "Recommend a staged, data-protective adoption plan"],
      rubric: [
        { criterion: "Accurate statistics and trend concepts", points: 3 },
        { criterion: "Clear MSME benefits", points: 3 },
        { criterion: "Risk analysis including digital divide", points: 2 },
        { criterion: "Organization, recommendation, and conclusion", points: 2 }
      ]
    },
    {
      id: "essay-laws",
      topic: "laws",
      title: "The online case file",
      prompt: "A student's private video is secretly recorded in a dormitory, edited into a fake scandal, and posted with the student's name and address. The post is shared widely, strangers send threats, and a school employee leaks the student's grades to the thread. Identify the Philippine laws that apply, the specific offenses or rights involved, the agencies that can help, and the remedies available. Explain why each law is the correct fit.",
      model: "R.A. 9995 applies because the private video was captured without consent in a place with a reasonable expectation of privacy; secret recording, editing, and sharing of a private area are prohibited. R.A. 10175 applies to the online threats, identity-based harassment, and any illegal access or interception, and cyber libel may apply to the fake scandal published as fact. R.A. 10173 applies to the school employee's leak of grades, which are personal information; the student's rights to be informed, object, access, rectify, erase or block, damages, complaint, and portability are relevant, and the NPC can investigate. R.A. 9775 would apply only if the material sexualizes a minor; it is not the right fit for an adult victim. The student should preserve evidence, report to the PNP or NBI cybercrime units and the CICC, file a complaint with the NPC for the data leak, and seek damages and erasure. The school should act on the employee's breach under its data protection obligations.",
      outline: ["9995 for the secret private video", "10175 for threats, harassment, and cyber libel", "10173 for the grades leak and data subject rights", "Agencies: PNP/NBI, CICC, NPC; remedies", "Explain why 9775 does not fit"],
      rubric: [
        { criterion: "Correct law-to-fact matching", points: 4 },
        { criterion: "Accurate offenses and rights", points: 2 },
        { criterion: "Agencies and remedies", points: 2 },
        { criterion: "Organization and conclusion", points: 2 }
      ]
    }
  ],

  bonus: [
    { id: "bo-01", q: "Who created the Linux operating system?", a: ["linus torvalds", "torvalds"], topic: "systems" },
    { id: "bo-02", q: "In what year was Symbian discontinued?", a: ["2014"], topic: "systems" },
    { id: "bo-03", q: "What is the peak speed expected from 5G, in Gb/s?", a: ["20", "20 gb/s", "20 gbps"], topic: "trends" },
    { id: "bo-04", q: "Which Republic Act created the National Privacy Commission?", a: ["10173", "ra 10173", "r.a. 10173"], topic: "laws" },
    { id: "bo-05", q: "Which database query language is a fourth generation language?", a: ["sql"], topic: "programming" },
    { id: "bo-06", q: "Which topology connects all computers to a single central hub?", a: ["star", "star topology"], topic: "networks" },
    { id: "bo-07", q: "Which protocol governs interaction between a web server and a web client?", a: ["http", "hypertext transfer protocol"], topic: "networks" },
    { id: "bo-08", q: "How many billion social media users were there worldwide in April 2022?", a: ["4.65", "4.65 billion"], topic: "trends" },
    { id: "bo-09", q: "What is the Android app store called?", a: ["play store", "google play", "google play store"], topic: "apps" },
    { id: "bo-10", q: "What is the internet penetration rate in the Philippines as of January 2022, in percent?", a: ["68", "68%", "68.0%"], topic: "trends" },
    { id: "bo-11", q: "Which systems software type is permanently stored in ROM by the manufacturer?", a: ["firmware"], topic: "systems" },
    { id: "bo-12", q: "What does CICC stand for?", a: ["cybercrime investigation and coordination center"], topic: "laws" }
  ]
};
