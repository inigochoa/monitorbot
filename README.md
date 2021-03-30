# Website monitor telegram bot

![GitHub package.json version]

> :warning: **If you are looking for potsgres version, switch to [v1.* branch]**

## What is it?

I am your private bot for web page monitoring. I can check the status of any web
page for you. I can also follow a list of URLs and notify you when their status
changes.

I am designed to be private. I will only respond to the messages I receive
within the chat that you have configured for me.

## Available commands

| Command | Description                                           | Parameters                                   |
|---------|-------------------------------------------------------|----------------------------------------------|
| /help   | Display bot usage info                                | -                                            |
| /check  | Check the status of a URL or a list of URLs           | A URL or a list of URLs separated by a space |
| /add    | Add a URL or a list of URLs to the tracking list      | A URL or a list of URLs separated by a space |
| /remove | Remove a URL or a list of URLs from the tracking list | A URL or a list of URLs separated by a space |
| /list   | Display the tracking list                             | -                                            |
| /report | Display a report of the tracked URLs                  | -                                            |

## Usage

### Local

1. Copy default.env to .env

```
cp default.env .env
```

2. Create a new Firebase Firestore database and set the connection values in the
.env file. [You can read the docs at Google]

3. Configure the telegram variables.

    - **TELEGRAM_TOKEN**. Write to [@BotFather] to create a new bot and get its
    unique token.

    - **TELEGRAM_TO**. Find out how to get a chat id [here].

4. [Optional] Asign the frequency of the check and report tasks. By default the
following values are used:

    - Every minute for the check task.

    - At 10 p.m. for the report task.

    > [Crontab guru] is a great tool for generating crontab schedule
    expressions.

5. [Optional] Set the timezone in the .env file to set the task time correctly.

6. [Optional] I18n.

    1. Duplicate **/locales/en.json** with the new language code.

    2. Edit the translations respecting the texts in braces.

    3. Write the new language code in the .env file...

### Deploying to Heroku

Heroku is a great hosting for this bot as it provides everything you need for
free. To carry out the deployment of the project you will need to:

1. Push the code to a Github repository.

2. Connect your Heroku and GitHub accounts.

3. Create a new Heroku app and select GitHub as the deployment method. Choose
main branch. Enable *Automatic Deploys* if you wish.

4. Add a free **Heroku Postgres** add-on to the app.

5. In the *Resources* section change the Dyno type from web to **worker**.

6. Create the missing environment variables in the *Settings* section.

## Contributing

Please make sure to read the [Contributing Guide] to learn about our submission
process, coding rules and more.

Help us keep Angular open and inclusive. Please read and follow our [Code of
Conduct].

## Supporting

If you are considering supporting the project, you could buy the developer a
coffee.

<p align="center"><a href="https://www.buymeacoffee.com/inigochoa" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a></p>

[GitHub package.json version]: https://img.shields.io/github/package-json/v/inigochoa/monitorbot?label=Version&style=flat-square
[v1.* branch]: https://github.com/inigochoa/monitorbot/tree/postgres
[You can read the docs at Google]: https://firebase.google.com/docs/firestore/quickstart?hl=en
[@BotFather]: https://t.me/BotFather
[here]: https://stackoverflow.com/a/32572159
[Crontab guru]: https://crontab.guru/
[Contributing Guide]: https://github.com/inigochoa/monitorbot/blob/main/CONTRIBUTING.md
[Code of Conduct]: https://github.com/inigochoa/monitorbot/blob/main/CODE_OF_CONDUCT.md
[Buy me a coffee]: https://www.buymeacoffee.com/inigochoa
