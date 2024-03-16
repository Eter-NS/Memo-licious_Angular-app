# MemoLicious

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.5.

## The main idea behind the application

Someone might say it's another to-do app, and they're right. But which other app offers its own styling, not copied from another course project? It boasts both guest and online modes, allowing you to keep your data on your device or integrate it with other devices thanks to the Firebase backend 😉

## Inspirations and Attribution

- [No profile picture](https://www.iconpacks.net/free-icon/no-profile-picture-15257.html),
- [Beautiful SVG illustrations](https://undraw.co/illustrations),
- [Continue with Google button](https://developers.google.com/identity/branding-guidelines)
- [Fluent Emoji icons](https://icon-sets.iconify.design/fluent-emoji/)

## Local setup

### General setup

If you want to test this app locally, here's what you'll need first:

- Node (version 18+)
- Firebase CLI (version 9.30.2+)
- Firebase emulators (database, auth)

To set up a local user data entry point, you'll need to create the `environment.dev.ts` file inside `src/environments`. The content of this file should look like this:

```typescript
export const environment = {
  production: false,
};
```

The userData path can be changed if you want to.

And now for the main part: Building the project 🤘

In your terminal window, run `npm i` or `npm install`, whichever you prefer. Then you can start the app with `ng serve`.

For now, you're set up to run the guest mode only.

### Online mode

To enable online mode, you'll need to create a Firebase project and add it to the environment variables in the `environment.dev.ts` file inside the path `src/environments`. The content of this file should look like this:

```typescript
export const environment = {
  production: false,
  firebase: {
    projectId: 'xxx',
    appId: 'xxx',
    storageBucket: 'xxx',
    apiKey: 'xxx',
    authDomain: 'xxx',
    messagingSenderId: 'xxx',
    databaseURL: 'xxx',
  },
};
```

Replace the `xxx` placeholders with the corresponding values from your Firebase project.
