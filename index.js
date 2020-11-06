require('dotenv').config()

const { i18n, emoji, moment } = require('./utils/i18n')

if (undefined === process.env.TELEGRAM_TOKEN || '' === process.env.TELEGRAM_TOKEN) {
    console.error(i18n.__('error.token'))
    process.exit(1)
}

if (undefined === process.env.TELEGRAM_TO || '' === process.env.TELEGRAM_TO) {
    console.error(i18n.__('error.target'))
    process.exit(1)
}

if (undefined === process.env.DATABASE_URL || '' === process.env.DATABASE_URL) {
    console.error(i18n.__('error.database'))
    process.exit(1)
}

const { Telegraf } = require('telegraf')
const commandParts = require('telegraf-command-parts')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.use(commandParts())
bot.use(async ({ chat, leaveChat, reply }, next) => {
    if (parseInt(process.env.TELEGRAM_TO) !== chat.id) {
        reply(i18n.__('error.leave'))

        if ('private' !== chat.type) {
            leaveChat()
        }

        return
    }

    await next()
})

bot.start(({ from, reply}) => reply(emoji.emojify(i18n.__('command.start', { name: from.first_name }))))

const { getAll, getWebsite, insert, remove, update } = require('./utils/db')

bot.command('list', ({ reply }) => {
    getAll()
    .then(res => reply(i18n.__('command.list') + '\n\n' + res.rows.map(website => website.url).join('\n')))
})

const { isValidURL, checkStatus } = require('./utils/url')

bot.command('add', ({ state, reply }) => {
    const args = state.command.splitArgs.filter(el => '' !== el)

    if (0 === args.length) {
        reply(i18n.__('command.add.empty'))

        return
    }

    args
    .filter(url => {
        let isValid = isValidURL(url)
        if (!isValid) {
            reply(i18n.__('command.add.not-valid', { url }))
        }

        return isValid
    })
    .map(url => {
        getWebsite(url)
        .then(({ rowCount }) => {
            if (0 < rowCount) {
                reply(i18n.__('command.add.already', { url }))

                return
            }

            if (!url.startsWith('https://') && !url.startsWith('http://')) {
                url = `http://${url}`
            }

            insert(url, url.startsWith('https://'))
            .then(() => reply(i18n.__('command.add.added', { url })))
            .catch(() => reply(i18n.__('command.add.not-added', { url })))
        })
    })
})

bot.command('remove', ({ state, reply }) => {
    const args = state.command.splitArgs.filter(el => '' !== el)

    if (0 === args.length) {
        reply(i18n.__('command.remove.empty'))

        return
    }

    args
    .filter(url => {
        let isValid = isValidURL(url)
        if (!isValid) {
            reply(i18n.__('command.remove.not-valid', { url }))
        }

        return isValid
    })
    .map(url => {
        getWebsite(url)
        .then(({ rowCount }) => {
            if (0 === rowCount) {
                reply(i18n.__('command.remove.not-found', { url }))

                return
            }

            remove(url)
            .then(() => reply(i18n.__('command.remove.removed', { url })))
            .catch(() => reply(i18n.__('command.remove.not-removed', { url })))
        })
    })
})

bot.command('report', () => sendReport())

bot.command('check', ({ state, reply }) => {
    const args = state.command.splitArgs.filter(el => '' !== el)

    if (0 === args.length) {
        reply(i18n.__('command.check.empty'))

        return
    }

    args
    .filter(url => {
        let isValid = isValidURL(url)
        if (!isValid) {
            reply(i18n.__('command.check.not-valid', { url }))
        }

        return isValid
    })
    .map(url => {
        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = `http://${url}`
        }

        checkStatus({ url: url, isHttps: url.startsWith('https://') }, checkStatusCallback)
    })
})

bot.launch()

console.info(i18n.__('launched'))

const CronJob = require('cron').CronJob
let checkStatusJob = new CronJob('*/1 * * * *', function() {
    getAll()
    .then(({ rows }) => rows.map(website => checkStatus(website, (url, success, statusCode) => {
        if (success !== website.isUp) {
            checkStatusCallback(url, success, statusCode)
        }

        let upCycles = (success) ? website.upCycles + 1 : website.upCycles
        let downCycles = (success) ? website.downCycles : website.downCycles + 1

        update([success, upCycles, downCycles, url])
    })))
}, null, true, 'Europe/Madrid')
checkStatusJob.start()

let reportJob = new CronJob('0 21 * * *', () => sendReport())
reportJob.start()

function checkStatusCallback(url, success, statusCode) {
    if (!success) {
        bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(i18n.__('status.unknown', { url })))

        return
    }

    if (400 <= statusCode && 600 > statusCode) {
        bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(i18n.__('status.error', { url, statusCode })))

        return
    }

    bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(i18n.__('status.success', { url })))
}

function sendReport() {
    getAll()
    .then(res => {
        let message = i18n.__('command.report.header', { date: moment().format('LL'), time: moment().format('LT') })
        message += '\n\n'
        message += res.rows.map(website => {
            let uptime = Math.round(website.upCycles / (website.upCycles + website.downCycles) * 100 * 100) / 100

            return (website.isUp) ? i18n.__('command.report.success', { url: website.url, uptime }) : i18n.__('command.report.error', { url: website.url, uptime })
        }).join('\n')

        bot.telegram.sendMessage(process.env.TELEGRAM_TO, emoji.emojify(message))
    })
}
