const { mount } = require('telegraf')
const { i18n } = require('./i18n')

exports.botGuard = () => mount(['message'], ({ chat, leaveChat, reply }, next) => {
    if (parseInt(process.env.TELEGRAM_TO) !== chat.id) {
        reply(i18n.__('error.leave'))

        if ('private' !== chat.type) {
            leaveChat()
        }

        return
    }

    return next()
})
