
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
      .command-section
        .command
          label
          input(
            :class="{'invalid': invalid}",
            type="text",
            :value="command",
            @keydown.enter="handleChangeGuess",
          )
        .content(v-show="winnerResult || message")
          h3 {{ message ? message : `Bạn nhận được ${winnerResult?.text}` }}
    .action
      h1 Magic wheel 😎
      .hint
        .hint-content
          .hint-item(v-for="hint, index in currentHint" :key="index")
            span {{ index + 1 }}.
            MaskText(:text="hint")
  p Ô chữ gồm {{ currentWord.length }} chữ cái
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
  { color: '#BFFE81', value: 'open', text: 'Open a block' },
  { color: '#80FE81', value: 'hop', text: 'Hop' },
  { color: '#80FEBF', value: 'guess', text: 'Guess a letter' },
  { color: '#80FFFF', value: 'skip', text: 'Skip' },
  { color: '#80BFFF', value: 'hint', text: 'Hint' },
  { color: '#8080FF', value: 'guess', text: 'Guess a letter' },
  { color: '#BF80FF', value: 'skip', text: 'Skip' },
  { color: '#FA80FF', value: 'guess', text: 'Guess a letter' },
  { color: '#FA80BF', value: 'reverse', text: 'Reverse' },
  { color: '#ffa59c', value: 'extra', text: 'Extra turn' },
  { color: '#ff8f83', value: 'hop', text: 'Hop' },
];

const currentWord = ref('');

const hints = {
  "Shopify": [
    "Snowdevil: Shopify bắt đầu là một cửa hàng online bán ván trượt tuyết có tên là 'Snowdevil.'",
    "$1.27 billion: IPO của Shopify vào năm 2015 là một trong những IPO công nghệ lớn nhất ở Canada, đánh dấu một khoảnh khắc quan trọng cho ngành công nghệ Canada.",
    "2006: Shopify được chính thức ra mắt vào năm 2006 bởi Tobias Lütke, Daniel Weinand và Scott Lake.",
    "Green: Màu sắc chính được sử dụng trong thương hiệu Shopify - Shopify Green",
    "Canada: Trụ sở của Shopify nằm ở Ottawa, Canada, thể hiện vai trò của Canada trong ngành công nghệ.",
    "Support for Entrepreneurs: Shopify tham gia vào các sáng kiến như 'Shopify Capital' để giúp các doanh nghiệp nhỏ nhận được tài trợ dựa trên hiệu suất bán hàng.",
    "Annual Events: Shopify tổ chức các sự kiện như 'Shopify Unite' cho các nhà phát triển và đối tác để thảo luận về các tính năng và xu hướng mới.",
  ],
  "EvanYou": [
    "2004: release Vue.js vào năm 2014 như 1 dự án cá nhân trong khi vẫn đang làm việc cho Google.",
    "Five Program: Mỗi năm Google Creative Lab tuyển 5 sinh viên mới thực tập để tạo ra 1 team nhỏ gồm: a copywriter, a creative technologist, a graphic designer, a strategist, and a wildcard.",
    "Wixi, China: Evan You quê ở Vô tích, Trung Quốc.",
    "Studio art and art history: chuyên ngành ở đại học tại US về nghệ thuật và thiết kế sau đó học thạc sĩ về Fine Arts for Design and Technology (nửa designer, nửa developer).",
    "Google and Meteor: làm việc tại Google và Meteor trước khi phát triển Vue.js.",
    "Wibu: Đọc rất nhiều manga và xem anime, Vue’s releases are code-named with anime names <a href='https://www.reddit.com/r/javascript/comments/6myygh/vuejs_version_naming/' target='_blank'>Link</a>",
    "Karaoke: Evan You thích hát karaoke",
    "TJ Holowaychuk: thần tượng và 'hero' của Evan You (founder and solo developer of Apex Software)"
  ],
  "ElonMusk": [
    "1971: Elon Musk sinh ngày 28 tháng 6 năm 1971 tại Pretoria, Nam Phi.",
    "PayPal: Musk là một trong những người sáng lập PayPal.",
    "SpaceX: Musk thành lập SpaceX vào năm 2002 với mục tiêu giảm chi phí du hành không gian và làm cho cuộc sống đa hành tinh trở thành hiện thực.",
    "Tesla: Musk gia nhập Tesla Motors vào năm 2004 và đã giúp công ty trở thành một trong những nhà sản xuất ô tô điện hàng đầu thế giới.",
    "SolarCity: Musk đồng sáng lập SolarCity, một công ty năng lượng mặt trời, vào năm 2006.",
    "Neuralink: Musk thành lập Neuralink vào năm 2016 để phát triển công nghệ giao tiếp giữa não và máy tính.",
    "The Boring Company: Musk sáng lập The Boring Company vào năm 2016 để phát triển công nghệ đào hầm.",
    "X: Musk đã mua lại Twitter vào năm 2022 với giá 44 tỷ USD.",
  ],
  "Liquid": [
    "2006: Liquid được phát triển bởi Tobias Lütke ra đời vào năm 2006.",
    "Ruby",
    "Dynamic content: sử dụng trong các ứng dụng web để hiển thị nội dung động.",
    "Jekyll: sử dụng trong các nền tảng như Shopify, Jekyll và các hệ thống quản lý nội dung khác.",
    "Logic Controls: Hỗ trợ thao tác nội dung phức tạp (loop và if-else).",
    "Data Access: Cung cấp quyền truy cập vào các biến và đối tượng, cho phép hiển thị các loại dữ liệu khác nhau.",
    "Strong community: Cộng đồng mạnh mẽ và nhiều tài liệu hỗ trợ.",
    "{%}: syntax",
  ],
  "DependencyInjection": [
    "Early 2000s: Martin Fowler đã giới thiệu Dependency Injection (DI) trong một bài viết trên blog vào đầu những năm 2000.",
    "Do-nothing constructor: Dependency injection là việc cung cấp các đối tượng mà một đối tượng cần (các phụ thuộc của nó) thay vì để nó tự tạo chúng.",
    "Loose Coupling: Giảm thiểu sự cần thiết phải có các mối quan hệ chặt chẽ giữa các module",
    "Flexible Connections: Giữ cho các thành phần được kết nối linh hoạt hơn.",
    "Reusability & Maintainability: Tăng cường khả năng tái sử dụng và dễ bảo trì",
    "Built-in Vue: Vue cung cấp build-in DI (provide và inject).",
    "<a href='https://cdn.shopify.com/s/files/1/0683/1698/7643/files/Screenshot_2025-01-02_at_17.14.10.png?v=1735812881' target='_blank'>Link</a>",
  ],
  "Webpack": [
    "2012: Webpack được phát triển bởi Tobias Koppers và ra mắt lần đầu tiên vào năm 2012.",
    "JavaScript: Webpack là một module bundler cho JavaScript.",
    "Module Bundling: Webpack giúp đóng gói các module JavaScript thành một hoặc nhiều tệp bundle.",
    "Code Splitting: Hỗ trợ chia nhỏ mã để tải nhanh hơn.",
    "Hot Module Replacement: Cho phép thay thế module mà không cần tải lại trang.",
    "Plugin System: Hỗ trợ hệ thống plugin mạnh mẽ cho việc mở rộng chức năng.",
    "Tree Shaking: Giúp loại bỏ mã không sử dụng để giảm kích thước bundle.",
  ],
  "Vite": [
    "2020: ra mắt tháng 4, 2020",
    "~70k stars: <a href='https://github.com/vitejs/vite' target='_blank'>Link</a>",
    ">10m npm downloads / week: <a href='https://www.npmjs.com/package/vite' target='_blank'>Link</a>",
    "French name: Vite có nghĩa 'fast' hoặc 'quickly' trong Tiếng Pháp",
    "Golang: sử dụng Golang",
    "No Bundling: Được import vào browser dùng native ES module imports <a href='https://x.com/youyuxi/status/1252173663199277058' target='_blank'>Link</a>",
    "Zero delay: Instant server start and fast hot module replacement ensuring zero delays in code updates.",
    "Speed Optimization: Leverages modern browser features for faster performance.",
    "Framework Support: Optimized for modern JavaScript frameworks like Vue and React.",
  ],
  "Huongdoituong": [
    "1962: The first object-oriented languages were Simula 1 (1962) and Simula 67 (1967). The Norwegian Computing Center created Simula, which introduced the concept of objects and classes. OOPs became more popular in the 1990s due to the development of C++ by Bjarne Stroustrup.",
    "Object: Objects are the basic units of OOP",
    "Modularity, reusability, and extensibility",
    "Java, C++, and Python.",
    "<a href='https://cdn.shopify.com/s/files/1/0683/1698/7643/files/Screenshot_2025-01-02_at_17.21.04.png?v=1735813314' target='_blank'>Link</a>",
  ],
  "TypeScript": [
    "2012: released Tháng 10, 2012",
    "Strict: It helps catch errors at compile time",
    "Maintainability: Better tooling for large codebases, improve code quality and maintainability.",
    "Microsoft",
    "Open-source: large community of contributors.",
  ],
  "PersonalHomePage": [
    "1995: PHP was first introduced in 1995. It was developed by Lerdorf to manage his own personal website. ",
    "Open source",
    "Elephant: PHP mascot is a big blue elephant",
    "Over 244+ Million: websites use PHP.",
  ],
  "WorldWideWeb": [
    'vvvvvv: www',
    "1989: Created by Tim Berners-Lee in 1989",
    "Interlinked System: A system of hypertext documents accessed via the Internet.",
    "HTML, CSS, and JavaScript: core technologies for creating web content.",
    "Global Connectivity: Enables e-commerce, social networking, and more.",
    "Free name: Domain names were free until 1995 on the world wide web",
    "1.9 billion actives: The first-ever first website- <a href='http://info.cern.ch' target='_blank'>Link</a> was launched on August 6, 1991",
  ],
  "LinuxKernel": [
    "1991: Linus Torvalds created Linux in 1991 trong khi đang là sinh viên ngành computer science ở University of Helsinki.",
    "Open-Source",
    "Wide Usage: Được sử dụng rộng rãi trong các hệ thống: servers, supercomputers, và nhúng.",
    "Largest open-source project: 20,323,379 lines of code tính đến năm 2018.",
    "FreaX: Kết hợp của “free”, “freak” and “Unix”. May mắn là Linus đã bị thuyết phục bởi chủ của server hosting để đặt tên là “Linux” (kết hợp của “Linus” and “Unix”)",
    "Less than 1%: Mặc dù Linus viết 100% bản release đầu tiền nhưng cho đến bản gần nhất thì chỉ còn dưới 1%. Hiện này thì Linus vẫn quản lý và merge code được viết bới các developer khác.",
    "Penguin: the Linux mascot. Tác giả bảo bị cắn bởi 1 con chim cánh cụt",
    "Supercomputers: Linux hoàn toàn thống trị supercomputers. As of 2018 100% of the world’s 500 fastest supercomputers run Linux. Impressive!",
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
const command = ref('');
const invalid = ref(false);

const winnerResult = ref(null);
const previousWinner = ref(null);
const message = ref('');

const duration = 2000;
const speed = 100;

const currentHint = computed(() => hints[currentWord.value] || []);

const handleChangeGuess = (e) => {
  invalid.value = false;
  const value = e.target.value;
  command.value = value;
  winnerResult.value = null;
  message.value = '';

  if (value.length === 1) {
    const regex = new RegExp(value,"gi");
    const counterExist = currentWord.value.match(regex)?.length || 0;

    message.value = `Có ${counterExist} chữ ${command.value.toUpperCase()} trong ô chữ`;
  }

  if (value === 'next') {
    const done = localStorage.getItem("done") || '';

    localStorage.setItem('guestList', '');
    localStorage.setItem('hintList', '');
    localStorage.setItem("done", `${done},${currentWord.value}`);

    randomWord();
    command.value = '';
    document.dispatchEvent(new CustomEvent('word-changed', {
      detail: { word: currentWord.value }
    }));
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
  command.value = '';
  winnerResult.value = null;
  message.value = '';
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
  message.value = '';
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
  width: 450px;
}

.cursor-img {
  width: 45px;
  aspect-ratio: 1 / 1;
  filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.19));
}

.spin-button {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  font-size: 15px;
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

.command-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: column;
  height: 100px;

  .command {
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .content {
    h3 {
      margin: 0;
      padding: 0;
    }
  }
}
</style>
