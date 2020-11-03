require('dotenv').config()

const { i18n, emoji } = require('./utils/i18n')

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
bot.use(async ({ chat }, next) => {
    if (parseInt(process.env.TELEGRAM_TO) !== chat.id) {
        return
    }

    await next()
})

bot.start(({ from, reply}) => {
    reply(emoji.emojify(i18n.__('command.start', { name: from.first_name })))
})

const { getAll, getWebsite, insert } = require('./utils/db')

bot.command('list', (ctx) => {
    getAll()
    .then((res) => ctx.reply(i18n.__('command.list') + '\n\n' + res.rows.map((website) => website.url).join('\n')))
    .catch((err) => console.error(err.stack))
})

const { isValidURL } = require('./utils/url')

bot.command('add', ({ state, reply } ) => {
    const args = state.command.splitArgs.filter((el) => '' !== el)

    if (0 === args.length) {
        reply(i18n.__('command.add.empty'))

        return
    }

    args
    .filter((url) => {
        let isValid = isValidURL(url)
        if (!isValid) {
            reply(i18n.__('command.add.not-valid', { url }))
        }

        return isValid
    })
    .map((url) => {
        getWebsite(url)
        .then(({ rowCount }) => {
            if (0 < rowCount) {
                reply(i18n.__('command.add.already', { url }))

                return
            }

            insert(url)
            .then(() => reply(i18n.__('command.add.added', { url })))
            .catch(() => reply(i18n.__('command.add.not-added', { url })))
        })
    })
})

bot.launch()

console.info(i18n.__('launched'))
