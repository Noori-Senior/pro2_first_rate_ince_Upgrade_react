# Getting Started with Create React App
<h1>React App With Mantine React Table, for more detail about Mantine React Table, Click <a href="https://www.mantine-react-table.com/docs/examples/editing-crud">Mantine React Table</a></h1>
<h1>Installation of this application</h1>

<ol>
  <li>
    <p>Clone the repository:</p>
     <code style="background-color: gray; color: lightcyan; font-weight: bold;">
       git <span class="hljs-built_in">clone</span> https://github.com/FirstRate/professional.git <br>
       <span>cd</span> professional<br>
     </code>
  </li>
  <li>
    <h3>currently we tested this app with AFG local WebFOCUS server, because VPN blocking local node.js and React server to start, for this you can test on your desired region</h3>
    <p>To prepare to work with your desired region, please update the following files:</p>
    <ul>
      <li><strong>.env: </strong> <i>change this file based on your desired region, like url, <b>REACT_APP_CLIENT,  REACT_APP_FRP_ROOT, REACT_APP_WEBFOCUS_IP</b></i>
      <li><strong>package.json: </strong> change the <b>"proxy": "https://afgpc82:8444"</b> to your desired url like <b>https://dev.firstrate.com</b></li>
      <li>React is using API and JSON data, Currently the FEX files are in CUST/PRO/DV2764 region, if you using diffrent region then copy the APIs from this folder</li>
    </ul>
  </li>
  <li>
   <h3> When your data is ready then go on testing Mantine React Table</h3>
   <p>Install dependencies:</p>
   <code style="background-color: gray; color: lightcyan; font-weight: bold;">npm install</code>
  </li>
  <li>
   <p>Start React:</p>
   <code style="background-color: gray; color: lightcyan; font-weight: bold;">npm run dev</code>
  </li>
  <li>
    <p>After 'npm run dev' command if there is no error, then you will see the following page:</p>
    <img alt=" " src="./screenshoots/login.png" />
  </li>
  <li>
    <p>Enter your credentials and click on login, you will see the dashboard like the following</p>
    <img alt = " " src="./screenshoots/dashboard.png" />
  </li>
  <li>
    <p>Click <strong>Data Management</strong>, then you will see the following screen</p>
    <img alt = " " src="./screenshoots/data-value.png" />
  </li>
  <li>
    <p>From Dropdown Menu <strong>Select</strong> Holdings</P>
    <img alt=" " src="./screenshoots/data-val-holdings.png" />
  </li>
  <li>
    <p>Click on <strong> Calendar Icon</strong> to select the date range</P>
    <img alt=" " src="./screenshoots/calendar-range.png" />
  </li>
  <li>
    <p>Click on <strong> Profile Icon</strong> you will see the list of options</P>
    <img alt=" " src="./screenshoots/profile.png" />
  </li>
  <li>
    <p>Search for Portfolio <strong> Select a filter for your portfolio search and enter a porfolio id/name then Enter/Click search icon</strong> you will see the following screen</P>
    <img alt=" " src="./screenshoots/portfolio-search.png" />
  </li>
  <li>
    <p>Click on a portfolio <strong> Reload the screen for selected Portfolio</strong></P>
    <img alt=" " src="./screenshoots/reload-portfolio-change.png" />
  </li>
  <li>
    <p>To upload a profile picture, click on <strong> Profile Avator > Click on [first name Last name]</strong> you will see the following page</P>
    <img alt=" " src="./screenshoots/upload-profile-picture.png" />
  </li>
  
</ol>
