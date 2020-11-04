const HTTP = require('http')
const HTTPS = require('https')

exports.isValidURL = url => {
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
        console.info(`URL: ${url} || Status code: ${statusCode}`)
        callback(url, true, statusCode)
    })
    .on('error', () => {
        console.error(`URL error: ${url}`)
        callback(url, false)
    })
}
