require('dotenv').config()

if (undefined === process.env.TELEGRAM_TOKEN || '' === process.env.TELEGRAM_TOKEN) {
    console.error('You have to set the environment variable TELEGRAM_TOKEN with the value from @BotFather')
    process.exit(1)
}

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.launch()

console.info('Monitor bot launched')
