require('dotenv').config()

const { i18n, emoji, moment, TZ } = require('./utils/i18n')

if (undefined === process.env.TELEGRAM_TOKEN || '' === process.env.TELEGRAM_TOKEN) {
    console.error(i18n.__('console.error.token'))
    process.exit(1)
}

if (undefined === process.env.TELEGRAM_TO || '' === process.env.TELEGRAM_TO) {
    console.error(i18n.__('console.error.target'))
    process.exit(1)
}

if (
    undefined === process.env.FIRESTORE_API_KEY || '' === process.env.FIRESTORE_API_KEY
    || undefined === process.env.FIRESTORE_APP_ID || '' === process.env.FIRESTORE_APP_ID
    || undefined === process.env.FIRESTORE_AUTH_DOMAIN || '' === process.env.FIRESTORE_AUTH_DOMAIN
    || undefined === process.env.FIRESTORE_DATABASE_URL || '' === process.env.FIRESTORE_DATABASE_URL
    || undefined === process.env.FIRESTORE_MESSAGING_SENDER_ID || '' === process.env.FIRESTORE_MESSAGING_SENDER_ID
    || undefined === process.env.FIRESTORE_PROJECT_ID || '' === process.env.FIRESTORE_PROJECT_ID
    || undefined === process.env.FIRESTORE_STORAGE_BUCKET || '' === process.env.FIRESTORE_STORAGE_BUCKET
) {
    console.error(i18n.__('console.error.database'))
    process.exit(1)
}

const { Extra, Telegraf } = require('telegraf')
const { botGuard } = require('./utils/bot')
const commandParts = require('telegraf-command-parts')

const commands = [
    { command: 'help', description: i18n.__('command.help.description') },
    { command: i18n.__('command.check.command'), description: i18n.__('command.check.description') },
    { command: i18n.__('command.add.command'), description: i18n.__('command.add.description') },
    { command: i18n.__('command.remove.command'), description: i18n.__('command.remove.description') },
    { command: i18n.__('command.list.command'), description: i18n.__('command.list.description') },
    { command: i18n.__('command.report.command'), description: i18n.__('command.report.description') },
]

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
bot.use(botGuard())
bot.use(commandParts())
bot.telegram.setMyCommands(commands)

const { getAll, getWebsite, insert, remove, update } = require('./utils/db')
const { checkStatus, filterUrls } = require('./utils/url')
const { percentage, round } = require('./utils/utils')

bot.start(({ from, reply }) => reply(emoji.emojify(i18n.__('command.start.reply', { name: from.first_name, helpMessage: helpMessage() }))))

bot.help(({ reply }) => reply(helpMessage()))

bot.command(i18n.__('command.check.command'), ({ state, reply }) => {
    filterUrls(state.command.splitArgs, reply)
    .map(url => {
        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = `http://${url}`
        }

        checkStatus({ url, isHttps: url.startsWith('https://') }, checkStatusCallback)
    })
})

bot.command(i18n.__('command.add.command'), ({ state, reply }) => {
    filterUrls(state.command.splitArgs, reply)
    .map(url => {
        getWebsite(url)
        .then(snapshot => {
            if (0 < snapshot.docs.length) {
                reply(i18n.__('error.url.already', { url }))

                return
            }

            if (!url.startsWith('https://') && !url.startsWith('http://')) {
                url = `http://${url}`
            }

            insert(url, url.startsWith('https://'))
            .then(() => reply(emoji.emojify(i18n.__('command.add.reply', { url })), Extra.webPreview(false)))
            .catch(() => reply(i18n.__('error.url.not-added', { url }), Extra.webPreview(false)))
        })
    })
})

bot.command(i18n.__('command.remove.command'), ({ state, reply }) => {
    filterUrls(state.command.splitArgs, reply)
    .map(url => {
        getWebsite(url)
        .then(snapshot => {
            if (0 === snapshot.docs.length) {
                reply(i18n.__('error.url.not-found', { url }))

                return
            }

            snapshot.docs.map(doc => {
                remove(doc.id)
                .then(() => reply(emoji.emojify(i18n.__('command.remove.reply', { url })), Extra.webPreview(false)))
                .catch(() => reply(i18n.__('error.url.not-removed', { url }), Extra.webPreview(false)))
            })
        })
    })
})

bot.command(i18n.__('command.list.command'), ({ reply }) => {
    getAll()
    .then(snapshot => {
        let urls = snapshot.docs.map(doc => doc.data().url).join('\n')

        reply(emoji.emojify(i18n.__('command.list.reply', { urls })), Extra.webPreview(false))
    })
})

bot.command(i18n.__('command.report.command'), () => {
    getAll()
    .then(snapshot => sendReport(snapshot))
})

bot.launch()

console.info(emoji.emojify(i18n.__('console.launched')))

const CronJob = require('cron').CronJob

let checkStatusJob = new CronJob(process.env.CRON_STATUS || '*/1 * * * *', () => {
    getAll()
    .then(snapshot => snapshot.docs.map(doc => {
        let website = doc.data()

        checkStatus(website, (url, success, statusCode) => {
            if (success !== website.isUp) {
                checkStatusCallback(url, success, statusCode)
            }

            website = {
                downCycles: (success) ? 0 : website.downCycles + 1,
                isUp: success,
                statusCode: statusCode,
                totalCycles: website.totalCycles + 1,
                upCycles: (success) ? website.upCycles + 1 : website.upCycles,
            }

            update(doc.id, website)

            if (!success && (0 == website.downCycles % 10)) {
                checkStatusCallback(url, success, statusCode)
            }
        })
    }))
}, null, true, TZ)
checkStatusJob.start()

let reportJob = new CronJob(process.env.CRON_REPORT || '0 22 * * *', () => {
    getAll()
    .then(snapshot => sendReport(snapshot))
}, null, true, TZ)
reportJob.start()

const helpMessage = () => emoji.emojify(i18n.__('command.help.reply', { commands: commands.map(command => '/' + command.command + ' - ' + command.description).join('\n') }))

const checkStatusCallback = (url, success, statusCode) => {
    if (!success) {
        bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(i18n.__('status.unknown', { url })), { disable_web_page_preview: true })

        return
    }

    if (400 <= statusCode && 600 > statusCode) {
        bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(i18n.__('status.error', { url, statusCode })), { disable_web_page_preview: true })

        return
    }

    bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(i18n.__('status.success', { url })), { disable_web_page_preview: true })
}

const sendReport = snapshot => {
    let urls = snapshot.docs.map(doc => {
        const website = doc.data()
        let uptime = round(percentage(website.upCycles, website.totalCycles))
        let params = { url: website.url, uptime }

        return (website.isUp)
            ? i18n.__('command.report.reply.success', params)
            : i18n.__('command.report.reply.error', params)
    }).join('\n')

    let message = i18n.__('command.report.reply.message', { date: moment().format('LL'), time: moment().format('LT'), urls })

    bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(message), { disable_web_page_preview: true })
}
