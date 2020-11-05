const i18n = require('i18n')
const path = require('path')
const emoji = require('node-emoji')
const moment = require('moment')

const LOCALE = process.env.LOCALE || 'en'

i18n.configure({
    directory: path.join(__dirname, '..', 'locales'),
    objectNotation: true,
    retryInDefaultLocale: true,
})

i18n.setLocale(LOCALE)

moment.locale(LOCALE)

exports.i18n = i18n

exports.emoji = emoji

exports.moment = moment
