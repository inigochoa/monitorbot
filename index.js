require('dotenv').config()

const i18n = require('i18n')
const path = require('path')
const emoji = require('node-emoji')

i18n.configure({
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    retryInDefaultLocale: true,
})
i18n.setLocale(process.env.LOCALE)

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

const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: 'development' !== process.env.NODE_ENV },
})

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.use(async ({ chat }, next) => {
    if (parseInt(process.env.TELEGRAM_TO) !== chat.id) {
        return
    }

    await next()
})

bot.start(({ from, reply}) => {
    reply(emoji.emojify(i18n.__('command.start', { name: from.first_name })))
})

const selectQuery = 'SELECT * FROM websites'

bot.command('list', (ctx) => {
    pool.query(selectQuery)
    .then((res) => ctx.reply(i18n.__('command.list') + '\n\n' + res.rows.map((website) => website.url).join('\n')))
    .catch((err) => console.error(err.stack))
})

bot.launch()

console.info(i18n.__('launched'))
