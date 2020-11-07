const HTTP = require('http')
const HTTPS = require('https')
const { i18n } = require('./i18n')

const isValidURL = url => {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})' + // domain name
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$','i'  // fragment locator
    )

    return !! pattern.test(url)
}

exports.checkStatus = (website, callback) => {
    let request = (website.isHttps) ? HTTPS : HTTP
    let url = website.url

    request.get(url, ({ statusCode }) => {
        console.info(i18n.__('console.status.success', { url, statusCode }))
        callback(url, true, statusCode)
    })
    .on('error', () => {
        console.error(i18n.__('console.status.error', { url }))
        callback(url, false)
    })
}

exports.filterUrls = (urls, reply) => {
    urls = urls.filter(url => '' !== url)

    if (0 === urls.length) {
        reply(i18n.__('error.url.empty'))

        return urls
    }

    urls = urls.filter(url => {
        const isValid = isValidURL(url)
        if (!isValid) {
            reply(i18n.__('error.url.not-valid', { url }))
        }

        return isValid
    })

    return urls
}
