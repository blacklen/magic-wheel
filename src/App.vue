
<template lang="pug">
.app(:key="currentWord")
  .main-content
    .wheel
      ShiningDots(
        shine-color="#ffd800"
        :border-width="30"
        :size="8"
        :count="60"
      )
        VueWheelSpinner(
          ref="spinnerRef"
          :slices="slices"
          :sounds="sounds"
          :cursor-angle="0"
          cursor-position="edge"
          :cursor-distance="0"
          @spin-start="onSpinStart"
          @spin-end="onSpinEnd"
          :spin-duration="duration"
        )
          template(#cursor)
            img.cursor-img(:src="cursorImage" alt="Cursor")
          template(#default)
            button.spin-button(
              :disabled="isSpinning"
              @click="handleSpinButtonClick"
              @mouseover="handleSpinButtonHover"
              @mouseleave="handleSpinButtonLeave"
            ) Spin
    .action
      h1 Magic wheel 😎
      .hint
        .hint-content
          .hint-item(v-for="hint, index in currentHint" :key="index")
            span {{ index + 1 }}.
            MaskText(:text="hint")
        .command
          label
          input(
            :class="{'invalid': invalid}",
            type="text",
            :value="command",
            @keydown.enter="handleChangeGuess",
          )
      .action-content(v-if="winnerResult")
        h2(@click="hintActive = !hintActive") You've got {{ winnerResult?.text }}!
  WordBox(
    :word="currentWord",
  )
</template>

<script setup>
import VueWheelSpinner from 'vue-wheel-spinner';
import ShiningDots from "./components/ShiningDots.vue";
import WordBox from "./components/WordBox.vue";
import MaskText from "./components/MaskText.vue";

import cursorImage from './assets/cursor.svg';
import wonSound from './sounds/won.mp3';
import clickSound from './sounds/click.mp3';
import hoverSound from './sounds/hover.mp3';
import leaveSound from './sounds/leave.mp3';
import spinningSound from './sounds/spinning.mp3';
import { computed, onMounted, provide, ref } from 'vue';

const slices = [
  { color: '#FCBF80', value: 'hint', text: 'Hint' },
  { color: '#FFFE80', value: 'guess', text: 'Guess a letter' },
  { color: '#BFFE81', value: 'remote', text: 'Remote' },
  { color: '#80FE81', value: 'next-3', text: 'Next 3 turn' },
  { color: '#80FEBF', value: 'guess', text: 'Guess a letter' },
  { color: '#80FFFF', value: 'guess', text: 'Guess a letter' },
  { color: '#80BFFF', value: 'hint', text: 'Hint' },
  { color: '#8080FF', value: 'guess', text: 'Guess a letter' },
  { color: '#BF80FF', value: 'next-2', text: 'Next 2 turn' },
  { color: '#FA80FF', value: 'next', text: 'Next 1 turn' },
  { color: '#FA80BF', value: 'reverse', text: 'Reverse' },
  { color: '#FA8080', value: 'next-5', text: 'Next 5 turn' }
];

const currentWord = ref('');

const hints = {
  "Shopify": [
    "Snowdevil: Shopify started as an online store for selling snowboards called 'Snowdevil.'",
    "$1.27 billion: Shopify's 2015 IPO was one of the largest tech IPOs in Canada, marking a significant moment for the Canadian tech landscape.",
    "2006: Shopify was officially launched in 2006 by Tobias Lütke, Daniel Weinand, and Scott Lake.",
    "Green: The primary color used in Shopify's branding is a unique shade of green known as 'Shopify Green.'",
    "Canada: Shopify's headquarters is in Ottawa, Canada, showcasing Canada's role in the tech industry.",
    "Support for Entrepreneurs: Shopify engages in initiatives like 'Shopify Capital' to help small businesses get funding based on sales performance.",
    "Annual Events: Shopify hosts events like 'Shopify Unite' for developers and partners to discuss new features and trends.",
  ],
  "Liquid": [
    "2006: Shopify's Liquid template language has been in use since 2006. It was developed by Shopify co-founder and CEO Tobias Lütke",
    "Ruby: Liquid is a flexible, open-source template language originally created for Ruby.",
    "Dynamic content: It is primarily used in web applications for rendering dynamic content.",
    "Jekyll: Commonly used in platforms such as Shopify, Jekyll, and other content management systems.",
    "Logic Controls: Supports control logic like loops and conditional statements, allowing for complex content manipulation.",
    "Data Access: Provides access to variables and objects, enabling the display of different data types.",
    "Strong community: Supported by a strong community that contributes to its development and provides extensive documentation.",
    "{%}: Utilizes a simple syntax with tags, filters, and objects to create reusable and customizable templates.",
  ],
  "DependencyInjection": [
    "Early 2000s: Martin Fowler introduced dependency injection (DI) in a blog post in the early 2000s.",
    "Do-nothing constructor: Dependency injection is basically providing the objects that an object needs (its dependencies) instead of having it construct them itself.",
    "Loose Coupling: Minimizes the need for tightly bound relationships among modules.",
    "Flexible Connections: Keeps components loosely connected and more flexible.",
    "Implementation Swapping: Enables the swapping of implementations without modifying dependent code.",
    "Easier Testing & Maintenance: Facilitates easier testing and maintenance of code.",
    "Reusability & Maintainability: Enhances code reusability and maintainability.",
    "Built-in Vue: Vue provides a built-in dependency injection mechanism using provide and inject.",
    "<a href='https://cdn.shopify.com/s/files/1/0683/1698/7643/files/Screenshot_2025-01-02_at_17.14.10.png?v=1735812881' target='_blank'>Link</a>",
  ],
  "Vite": [
    "2020: Vite released in April 2020",
    "~70k stars: <a href='https://github.com/vitejs/vite' target='_blank'>Link</a>",
    ">10m npm downloads / week: <a href='https://www.npmjs.com/package/vite' target='_blank'>Link</a>",
    "French name: Vite means 'fast' or 'quickly' in French",
    "Golang: Vite use Golang, Webpack use JS",
    "No Bundling: Imports are requested by the browser as native ES module imports - there's no bundling. <a href='https://x.com/youyuxi/status/1252173663199277058' target='_blank'>Link</a>",
    "Zero delay: Vite provides instant server start and fast hot module replacement",
    "Speed Optimization: Leverages modern browser features for faster performance.",
    "Native ES Modules: Utilizes ES modules for quick development and hot module replacement.",
    "Framework Support: Optimized for modern JavaScript frameworks like Vue and React.",
    "Immediate Feedback: Serves source files via native ESM, ensuring zero delays in code updates.",
  ],
  "Huongdoituong": [
    "1962: The first object-oriented languages were Simula 1 (1962) and Simula 67 (1967). The Norwegian Computing Center created Simula, which introduced the concept of objects and classes. OOPs became more popular in the 1990s due to the development of C++ by Bjarne Stroustrup.",
    "Object: Objects are the basic units of OOP",
    "Modularity, reusability, and extensibility",
    "Java, C++, and Python.",
    "<a href='https://cdn.shopify.com/s/files/1/0683/1698/7643/files/Screenshot_2025-01-02_at_17.21.04.png?v=1735813314' target='_blank'>Link</a>",
  ],
  "TypeScript": [
    "2012: TypeScript was released to the public in October 2012",
    "It helps catch errors at compile time",
    "Better tooling for large codebases",
    "Improve code quality and maintainability.",
    "Microsoft.",
    "open-source - large community of contributors.",
  ],
  "PersonalHomePage": [
    "1995: PHP was first introduced in 1995. It was developed by Lerdorf to manage his own personal website. ",
    "Open source",
    "Elephant: PHP mascot is a big blue elephant",
    "Over 244+ Million: websites use PHP.",
  ],
  "WorldWideWeb": [
    'vvvvvv: www',
    "1989: Created by Tim Berners-Lee in 1989, revolutionizing communication and information sharing.",
    "Interlinked System: A system of hypertext documents accessed via the Internet.",
    "Core Technologies: HTML, CSS, and JavaScript are essential for creating web content.",
    "Global Connectivity: Enables e-commerce, social networking, and more.",
    "Free name: Domain names were free until 1995 on the world wide web",
    "1.9 billion actives: The first-ever first website- <a href='http://info.cern.ch' target='_blank'>Link</a> was launched on August 6, 1991",
  ],
  "LinuxKernel": [
    "1991: Linus Torvalds created Linux in 1991 while he was a computer science student at the University of Helsinki.",
    "Open-Source: Developed by Linus Torvalds as an open-source operating system kernel.",
    "Wide Usage: Commonly used in servers, supercomputers, and embedded systems.",
    "Largest open-source project: There are 20,323,379 lines of code in the Linux kernel as of 2018.",
    "FreaX: A combination of “free”, “freak” and “Unix”. Thankfully, he was persuaded otherwise by the owner of the server hosting his early code, who happened to prefer the name “Linux” (a combination of “Linus” and “Unix”)",
    "Less than 1%: Though he wrote 100% of the first Linux release less than 1% of the latest kernel release includes code written by Linus Torvalds. The guy isn’t slacking though; Linus is now kept busy managing and merging code written by other developers.",
    "Penguin: the Linux mascot. Linus recounts a story in which he was bitten by an angry penguin",
    "Supercomputers: Linux totally dominates supercomputers. As of 2018 100% of the world’s 500 fastest supercomputers run Linux. Impressive!",
  ],
  "UnitTesting": [
    "Verification: Unit tests verify that each unit of code performs as expected.",
    "Early Bug Detection: Unit testing helps catch bugs early in the development process.",
    "Automation: Unit tests are typically automated and run frequently during development.",
    "Development Practices: Unit testing is a key practice in test-driven development (TDD) and agile software development.",
    "Focus Areas: Unit tests focus on small, specific parts of the codebase, such as functions or classes.",
    "Code Quality Improvement: Unit testing can improve code quality, maintainability, and developer productivity.",
    "Refactoring Support: Unit tests provide a safety net for refactoring and code changes."
  ],
  "CodeReview": [
    "Collaborative Process: A process where developers review each other's code to find bugs, improve quality, and share knowledge.",
    "Error Detection: Code reviews help catch errors, improve code readability, and ensure adherence to coding standards.",
    "Team Benefits: Promote collaboration, learning, and continuous improvement within a team.",
    "Early Issue Identification: Can identify potential issues early in the development process.",
    "Learning Opportunity: Code reviews can be a valuable learning experience for both the author and the reviewer.",
    "Consistency Maintenance: Helps maintain consistency and best practices across a codebase.",
    "Quality Improvement: Code reviews can improve code quality, reduce technical debt, and increase team efficiency.",
    "Feedback Culture: Can foster a culture of feedback, transparency, and accountability within a team."
  ],
  "Refactoring": [
    "Readability and Maintainability: Refactoring improves code readability, maintainability, and extensibility.",
    "Technical Debt Reduction: Helps remove duplication, enhance performance, and reduce technical debt.",
    "Different Levels: Refactoring can be done at various levels, from small changes to large-scale restructuring.",
    "Codebase Hygiene: An essential practice for maintaining clean and efficient codebases.",
    "Incremental Approach: Refactoring should be done incrementally and with proper testing to ensure correctness.",
    "Guided by Best Practices: Can be guided by code smells, design patterns, and best practices.",
    "Ongoing Process: Refactoring should be integrated into the development workflow as a continuous practice.",
    "Productivity and Collaboration: Can enhance developer productivity, collaboration, and code quality."
  ],
  "Caching": [
    "Data Storage: The process of storing frequently accessed data in a temporary storage area for quick retrieval.",
    "Performance Improvement: Caching helps reduce latency and improve performance by serving data from memory instead of disk or network.",
    "Resource Optimization: Helps reduce server load, bandwidth usage, and response times.",
    "Scalability: Caching is essential for scaling web applications and improving user experience.",
    "Trade-offs: Caching can involve a trade-off between performance and data consistency.",
    "Common Technique: Caching is a common technique used in web development, databases, and distributed systems.",
    "Latency Reduction",
  ],
  "CallbackFunction": [
    "Asynchronous Programming: Callback functions are commonly used in asynchronous programming to handle responses from tasks like fetching data or user input.",
    "Event and Error Handling: Callback functions can be used to implement event handling, error handling, and control flow in JavaScript.",
    "Chaining: Callback functions can be chained together to create complex behavior.",
    "Higher-Order Functions: Callback functions can be passed to higher-order functions that operate on functions.",
    "APIs and Libraries: Callback functions can be used to implement callbacks in APIs, libraries, and frameworks.",
    "Code Modularity: Callback functions can help make code more modular, reusable, and maintainable.",
    "JavaScript Mastery: Understanding callback functions is essential for mastering JavaScript and asynchronous programming."
  ],
  "CrossSiteScripting": [
    "A self-retweeting tweet: <a href='https://cdn.shopify.com/s/files/1/0683/1698/7643/files/Screenshot_2025-01-07_at_17.03.23_7186d50b-69ee-4c75-8a3c-e75c8d2c9366.png?v=1736244463' target='_blank'>Link</a>",
    "Payload Execution: XSS payloads can execute JavaScript code in the context of the victim's browser.",
    "Data Theft: Can be used to steal cookies, session tokens, or other sensitive data.",
    "Prevalence: XSS vulnerabilities are common in web applications with serious security implications.",
    "Prevention: Prevented by following secure coding practices and using security tools.",
    "7: Recognized as number 7 security risk in the OWASP Top 10 list of web application vulnerabilities.",
    "British Airways: In 2018, British Airways was attacked by Magecart, a high-profile hacker group famous for credit card skimming attacks. The group exploited an XSS vulnerability in a JavaScript library called Feedify, which was used on the British Airway website. Performing credit card skimming on 380,000 booking transactions. British Airways faced a £183 million fine for a data breach caused by XSS vulnerabilities.",
    "Fortnite:In 2019, the popular multiplayer game experienced an XSS vulnerability that over 200 million users. A retired, unsecured page went unnoticed by Fortnite developers. The page had an XSS vulnerability that allowed attackers to gain unauthorized access to the data of all Fornite users.",
    "eBay: In 2014, eBay was affected by an XSS vulnerability that allowed attackers to steal user credentials and access sensitive information. The website used a “url” parameter that redirected users to different pages on the platform, but the value of the parameter was not validated. This allowed attackers to inject malicious code into a page.",
  ],
  "SQLinjection": [
    "1: Recognized as the number 1 security risk in the OWASP Top 10 list of web application vulnerabilities.",
    "Stolen credentials: SQL injection attacks can steal sensitive data like usernames, passwords, and credit card numbers.",
    "GhostShell attack: hackers from APT group Team GhostShell targeted 53 universities using SQL injection, stole and published 36,000 personal records belonging to students, faculty, and staff.",
    "Code execution: SQL injection attacks can execute arbitrary code on the database server.",
    "Data manipulation: Attackers can manipulate or delete data in the database using SQL injection.",
    "Turkish government: another APT group, RedHack collective, used SQL injection to breach the Turkish government website and erase debt to government agencies.",
    "7-Eleven breach: a team of attackers used SQL injection to penetrate corporate systems at several companies, primarily the 7-Eleven retail chain, stealing 130 million credit card numbers.",
    "Tesla: in 2014, security researchers publicized that they were able to breach the website of Tesla using SQL injection, gain administrative privileges and steal user data.",
    "Cisco: in 2018, a SQL injection vulnerability was found in Cisco Prime License Manager. The vulnerability allowed attackers to gain shell access to systems on which the license manager was deployed. Cisco has patched the vulnerability",
    "Fortnite: Fortnite is an online game with over 350 million users. In 2019, a SQL injection vulnerability was discovered which could let attackers access user accounts. The vulnerability was patched.",
  ],
  "GithubCopilot": [
    "June 2021: GitHub Copilot was released in June 2021 as a technical preview.",
    "Context-Aware: It will analyze the surrounding code, comments, and even the function name to provide more accurate and relevant code suggestions. This context awareness is powered by OpenAI’s Codex model, which has been trained on a vast dataset of public code repositories.",
    "Language Support: Supports multiple programming languages and frameworks, including JavaScript, Python, and React.",
    "Time Savings: Provides code suggestions, refactoring tips, and documentation snippets to save time.",
    "Adapting Style: If you consistently use certain patterns or naming conventions, Copilot will start suggesting code that matches your style.",
    "Documentation: By analyzing the function names and code, it can generate inline comments and doc strings",
    "Improve Code Quality: Can help improve code quality by suggesting best practices and common patterns.",
    "Based on feedback: GitHub Copilot is continuously learning and improving based on user feedback and usage data.",
  ]
};

const isSpinning = ref(false);
const sounds = {
  won: wonSound,
  spinButtonClick: clickSound,
  spinButtonHover: hoverSound,
  spinButtonLeave: leaveSound,
  spinning: spinningSound
};
const buttonClickAudio = ref(null);
const buttonHoverAudio = ref(null);
const buttonLeaveAudio = ref(null);
const spinnerRef = ref(null);
const hintActive = ref(true);
const command = ref('');
const invalid = ref(false);

const winnerResult = ref(null);
const previousWinner = ref(null);

const duration = 5000;
const speed = 100;

const currentHint = computed(() => hints[currentWord.value] || []);

const handleChangeGuess = (e) => {
  invalid.value = false;
  const value = e.target.value;
  command.value = value;

  if (value === 'next') {
    const done = localStorage.getItem("done") || '';

    localStorage.setItem('guestList', '');
    localStorage.setItem('hintList', '');
    localStorage.setItem("done", `${done},${currentWord.value}`);

    randomWord();
    command.value = '';
    return;
  }

  if (value === 'all') {
    return;
  }

  if (!currentWord.value.toLowerCase().includes(command.value.toLowerCase())) {
    invalid.value = true;
    return;
  }
};

const playAudio = (audio) => {
  if (audio) {
    audio.volume = 0.5
    audio?.play();
  }
};

const handleSpinButtonClick = () => {
  hintActive.value = false;
  command.value = '';
  winnerResult.value = null;
  playAudio(buttonClickAudio.value);

  const position = Math.floor(Math.random() * slices.length);

  // const cycle = duration / speed + 1;
  // const position = ((previousWinner.value || 0) + cycle) % slices.length;
  // previousWinner.value = position;
  spinnerRef.value.spinWheel(position);
};

const handleSpinButtonHover = () => {
  playAudio(buttonHoverAudio.value)
};

const handleSpinButtonLeave = () => {
  playAudio(buttonLeaveAudio.value)
};

const onSpinStart = () => {
  winnerResult.value = null;
  isSpinning.value = true;
};

const onSpinEnd = (winnerIndex) => {
  isSpinning.value = false;
  winnerResult.value = slices[winnerIndex];
};

const randomWord = () => {
  const done = localStorage.getItem("done");
  let value = Object.keys(hints)[0];

  if (done) {
    const currentList = Object.keys(hints).filter(word => !done.includes(word));
    const random = Math.floor(Math.random() * currentList.length);

    value = currentList[random];
  }

  currentWord.value = value;
  localStorage.setItem("currentWord", value);
};

onMounted(() => {
  buttonHoverAudio.value = new Audio(hoverSound);
  buttonLeaveAudio.value = new Audio(leaveSound);
  buttonClickAudio.value = new Audio(clickSound);

  const currentW = localStorage.getItem("currentWord");

  if (currentW) {
    currentWord.value = currentW;
    return;
  }

  randomWord();
});

provide('command', command);
</script>

<style>
@import 'animate.css';

@keyframes shake {
  0% {
    margin-left: 0rem;
  }
  25% {
    margin-left: 0.5rem;
  }
  75% {
    margin-left: -0.5rem;
  }
  100% {
    margin-left: 0rem;
  }
}

.app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main-content {
  display: flex;
  justify-self: center;
  align-items: center;
  gap: 50px;
  margin-bottom: 20px;
}

.action {
  display: flex;
  flex-direction: column;
  width: 500px;
  justify-content: center;
}

.action h1 {
  padding: 0;
  margin: 0 0 20px;
}

.action-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.wheel {
  width: 500px;
}

.cursor-img {
  width: 50px;
  aspect-ratio: 1 / 1;
  filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.19));
}

.spin-button {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  font-size: 20px;
  cursor: pointer;
  background: #eb4d4b;
  border-radius: 50%;
  transition: all 150ms;
  border: 10px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white !important;
  box-shadow: inset -3px -3px 2px 2px rgba(0, 0, 0, 0.19), 3px 3px 2px 2px rgba(0, 0, 0, 0.19);
  z-index: 11;
  position: relative;
  user-select: none;

  &:hover {
    box-shadow: inset -5px -5px 2px 2px rgba(0, 0, 0, 0.19), 3px 3px 2px 2px rgba(0, 0, 0, 0.19);
  }

  &:active {
    box-shadow: inset 3px 3px 2px 2px rgba(0, 0, 0, 0.19), 3px 3px 2px 2px rgba(0, 0, 0, 0.19);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.action {
  margin: 20px 0;
}

.command {
  display: inline-flex;
  gap: 20px;
  justify-content: center;
  align-items: center;;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  width: 200px;
}

.hint-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

input.invalid {
  border: 1px solid #da3b0f !important;
  animation: shake 0.2s ease-in-out 0s 2;
  outline: none;
}
</style>
