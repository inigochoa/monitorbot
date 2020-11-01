require('dotenv').config()

if (undefined === process.env.TELEGRAM_TOKEN || '' === process.env.TELEGRAM_TOKEN) {
    console.error('You have to set the environment variable TELEGRAM_TOKEN with the value from @BotFather')
    process.exit(1)
}

if (undefined === process.env.TELEGRAM_TO || '' === process.env.TELEGRAM_TO) {
    console.error('You have to set the environment variable TELEGRAM_TO with the ID of the target chat')
    process.exit(1)
}

if (undefined === process.env.DATABASE_URL || '' === process.env.DATABASE_URL) {
    console.error('You have to set the environment variable DATABASE_URL with the URL of a PostgreSQL database')
    process.exit(1)
}

const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: 'development' !== process.env.NODE_ENV },
})

const { Telegraf } = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const path = require('path')
const emoji = require('node-emoji')

const i18n = new TelegrafI18n({
    useSession: true,
    defaultLanguage: process.env.LOCALE || 'en',
    defaultLanguageOnMissing: true,
    directory: path.resolve(__dirname, 'locales')
})

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.use(Telegraf.session())
bot.use(i18n.middleware())
bot.use(async ({ chat }, next) => {
    if (parseInt(process.env.TELEGRAM_TO) !== chat.id) {
        return
    }

    await next()
})

bot.start((ctx) => ctx.reply(emoji.emojify(ctx.i18n.t('start'))))

bot.launch()

console.info('Monitor bot launched')
