const { mount } = require('telegraf')
const { emoji, i18n } = require('./i18n')

exports.botGuard = () => mount('message', ({ chat, leaveChat, reply }, next) => {
    if (parseInt(process.env.TELEGRAM_TO) !== chat.id) {
        reply(emoji.emojify(i18n.__('error.private')))

        if ('private' !== chat.type) {
            leaveChat()
        }

        return
    }

    return next()
})
