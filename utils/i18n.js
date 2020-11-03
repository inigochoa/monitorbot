const i18n = require('i18n')
const path = require('path')
const emoji = require('node-emoji')

i18n.configure({
    directory: path.join(__dirname, '..', 'locales'),
    objectNotation: true,
    retryInDefaultLocale: true,
})

i18n.setLocale(process.env.LOCALE || 'en')

exports.i18n = i18n

exports.emoji = emoji
