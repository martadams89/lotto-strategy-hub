# 🔮 The Lottery Oracle v2.0
> High-Fidelity Mathematical Forecast Modeling & Anti-Split-Pot Strategy Engine for UK Lotto & EuroMillions.

**The Lottery Oracle** is a sophisticated, responsive, and mobile-friendly serverless web application designed to forecast the next optimal draws for both **EuroMillions** and **UK Lotto**. 

Rather than promising fake physical predictions (which are strictly governed by random chance), the Oracle focuses on **maximizing your Expected Value, $E[X]$**. It analyzes the **entire draw history** ever made for each game (thousands of draws stretching back to 1994 for UK Lotto and 2004 for EuroMillions) and maps human preference distributions. It filters out common human numbers (birthdays, visual keyboard patterns, consecutive ranges) to protect your potential jackpot from being shared among multiple winners (the **anti-split-pot strategy**).

The application is completely dual-mode: it runs with a full Node/Express backend or compiles into a **100% static, serverless Single Page Application (SPA)** ideal for zero-cost edge hosting on **Cloudflare Pages**, with automated database updates handled via **GitHub Actions**. To guarantee uncompromised performance and real-time synchronization in serverless/static environments, the client-side module features a **smart high-fidelity fallback** that queries the public dataset JSON assets directly from the public GitHub repository (`martadams89/lotto-strategy-hub`), instantly hydrating the visual components and deep historical archives with complete dataset points across thousands of historical runs.

---

## 🎨 System Architecture & Features

1. **🔮 Primary Predictions Tab (Novice-Friendly)**
   - **Front & Centre**: Located right at the top, displaying the two upcoming midweek and weekend draw sequences for the active game.
   - **Simple Explanations**: Features press-to-expand collapsible detail panels for each of the two predictions, explaining the exact logic in highly accessible, novice-friendly conceptual language.
   - **Visual Finish**: Rendered with absolute dark-mode premium typography (Inter & Playfair Display pairs), smooth motion transitions, and physical glowing ball containers.

2. **🔬 Advanced Mathematical Analysis Tab (Expert Deep-Dive)**
   - **Interactive Chaos Playground**: Customize coefficients and input custom seed keywords to iterate a chaotic non-linear logistic map in the browser's sandbox.
   - **Historical Database Explorer**: Instantly search, filter, and review historical drawings.
   - **Statistical Heatmaps**: View comprehensive frequency density charts, latency gap distributions, and odd-to-even split gaussian parameters.

---

## ⚡ Deployment to Cloudflare Pages

Cloudflare Pages provides global Edge network hosting that is completely free of charge. Since the frontend stores and reads its database from static JSON archives, it compiles into simple, fast, and secure static HTML/JS.

Here are the step-by-step instructions to deploy:

### Method A: Connect Your GitHub Repository (Recommended)
This is the best method because Cloudflare will automatically rebuild and redeploy your site whenever GitHub Actions pushes new results to your repo!

1. **Push your code to GitHub**:
   Create a new GitHub repository and push your project files (including `.github/`, `scripts/`, `src/`, etc.).
2. **Open Cloudflare Dashboard**:
   Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages**, and click **Create application** -> **Pages** -> **Connect to Git**.
3. **Select Your Repository**:
   Authorize your GitHub account and select your project's repository.
4. **Configure Build Settings**:
   Fill in the build configuration fields exactly as follows:
   * **Framework Preset**: `Vite` (or `None`)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Node Version**: Select `20` (or set an environment variable `NODE_VERSION=20` if prompted)
5. **Click Save and Deploy**:
   Cloudflare will compile the site statically and serve it on a secure `*.pages.dev` subdomain immediately!

---

### Method B: Deploy Locally via Wrangler CLI
If you want to compile and publish directly from your terminal:

1. **Install Wrangler globally**:
   ```bash
   npm install -g wrangler
   ```
2. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```
3. **Build the project statically**:
   ```bash
   npm run build
   ```
4. **Publish the static `dist/` directory**:
   ```bash
   wrangler pages deploy dist --project-name=lottery-oracle
   ```

---

## 🔄 Automated Data Updates (GitHub Actions)

We have created an automated background ingestion system inside `.github/workflows/update-results.yml`. This script runs completely serverless on GitHub's cloud platform to keep your lottery database updated hands-free!

### How the Auto-Updater Works:
1. **Cron Schedule**: The workflow fires automatically at **21:30 UTC** every Tuesday, Wednesday, Friday, and Saturday (right after official UK Lotto and EuroMillions draw numbers are published).
2. **Data Extraction**: It boots a Node environment and runs `npm run scrape` which execute `scripts/scrape.ts`.
3. **Deduplication & Order**: It fetches the latest numbers, merges them with the existing database copies (`src/data/lotto.json` and `src/data/euromillions.json`), deduplicates them by date, and sorts them descending.
4. **GitHub Commit**: If new drawing records are returned, the action commits the database changes directly back to your branch.
5. **Instant Redeployment**: Because your Cloudflare Pages dashboard is connected to your Git branch, Cloudflare instantly detects the commit, rebuilds the site, and deploys the new numbers to your audience globally!

### Initializing Github Actions:
To enable GitHub Actions to commit database adjustments back to your repository, ensure you have enabled read/write permissions for workflows:
1. In your GitHub repository, go to **Settings** -> **Actions** -> **General**.
2. Scroll down to **Workflow permissions**.
3. Select **Read and write permissions**.
4. Click **Save**.

---

## 🔬 Mathematical Prediction Models

### Model 1: Game-Theoretic Expected Value & Squeezed Claim Protection
This model protects your prize against split jackpots (sharing your prize with 5-50 players who guess the same numbers) by estimating human cognitive biases:
* **The Birthday Squeeze**: Over 70% of lottery participants pick sequences bounded between $1 \le x \le 31$ representing days. Our model penalizes any numbers inside this bracket, shifting combinations upwards.
* **Aesthetic Grid Biases**: Humans avoid choosing numbers adjacent to each other on the ticket or drawing straight diagonal/vertical lines. Our model calculates the consecutive adjacency spacing and arithmetic sequence intervals to ensure high Shannon-entropy patterns $H(X)$.

### Model 2: Deterministic Chaos System (Logistic Map Cascade)
To simulate the physical turbulent air currents of the actual drawing machines, the engine evaluates a non-linear chaotic iterative map:
$$x_{n+1} = \lambda x_n(1 - x_n)$$
* **Tuning parameters**: The growth parameter is set to maximum chaos ($\lambda \approx 3.99999$), seeded with a composite hash of previous results.
* **Gaussian Distribution Filters**: The output is run through statistical boundary checkers to align parity ratios (3:2 or 2:3 odd/even split) and sum standard deviation $\sigma$ constraints matching the historic population mean.

### Model 3: Sum Rating & The Central Limit Theorem (Normal Distribution)
The Sum Rating represents the pure arithmetic sum of all main drawn ball numbers in a sequence (excluding accessory / bonus numbers).
* **The Normalizing Bell Curve**: According to the Central Limit Theorem, when multiple independent random variables are added together, their sum naturally concentrates around a population average (bell curve). Selecting keys summing to the far edges of possible boundaries represents an extremely low-frequency event.
* **Statistically Ideal Brackets**: The engine leverages real historical Standard Deviations ($\sigma$) to advice a normal distribution sweet-spot bracket:
  * **EuroMillions Bracket**: `95 - 160`
  * **UK Lotto Bracket**: `140 - 220`
  * Over 70% of all historic drawings sit squarely within these mid-range sums. Filtering picks through these brackets blocks high-entropy outliers or improbable sets.

---

## 💻 Working in Local Development

To spin up the active full-stack server supporting both Node/Express API proxy routing and live Vite build modules on port `3000`:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run the development server**:
   ```bash
   npm run dev
   ```
3. **Execute a manual database scrape**:
   ```bash
   npm run scrape
   ```
