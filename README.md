# Yamacoa

Data journalism about Cuba · [yamacoa.com](https://yamacoa.com)

> **Audit snapshot as of October 24, 2026.** This repository is not updated. It is published
> so anyone can check for themselves how Yamacoa works and what data it does, and does not,
> collect about its readers.

## License: source-available, audit-only

This is **not** free or open-source software. The [LICENSE](LICENSE) lets you read the code,
clone it and run it in a private environment **for the sole purpose of auditing it**, and
publish the results of that audit with credit to the source. It does not allow copying,
modifying, deploying or reusing the code, or using it to train AI models. If you find a bug or
a vulnerability, please contact us through [yamacoa.com](https://yamacoa.com) before
disclosing it publicly. The license is bilingual; the Spanish version is the binding one.

## What you can verify

- **No analytics or trackers.** No Google Analytics, no social media pixels, no browser
  fingerprinting. The site's code sets no cookies of its own. Fonts are served from the site
  itself, not from Google Fonts.
- **Anonymous polls.** A vote only adds 1 to an aggregate counter (question, option, total).
  Nothing is stored about who voted: no IP address, no device. Your browser remembers locally
  (`localStorage`) that you already voted, and that never leaves your device.
  See `ops/*/poll_supabase.sql`.
- **Newsletter, only if you subscribe.** We store your email address and how you signed up
  (email or Google) to send you the newsletter. You can unsubscribe at any time.
  See `ops/suscriptores/` and `src/periodico/Privacidad.jsx`.
- **Videos** are embedded through `youtube-nocookie.com`.
- **Automated news** is built from public press sources, cited paragraph by paragraph.
  No personal data is collected. See `ops/noticias/fuentes.json` and `ops/noticias/motor.md`.
- **Contributors and voices** (opinion, podcast): access is by invitation only, and consent
  is recorded before any recording. See `ops/portal/` and `ops/podcast/NOTAS.md`.
- **What is not here:** credentials and private keys (kept outside the repository), working
  material from third parties, and personal account data. The Supabase key in the code is the
  *publishable* one, which is public by design. Each table's access rules (RLS) are in the
  `.sql` files.

Like any website, the hosting provider (Cloudflare) and the database (Supabase) keep their own
technical service logs. Yamacoa does not use them to identify anyone.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
