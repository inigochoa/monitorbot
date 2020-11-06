exports.percentage = (number, total) => (number / total * 100)

exports.round = (number, decimals = 2) => {
    const pow = Math.pow(10, decimals)

    return Math.round(number * pow) / pow
}
