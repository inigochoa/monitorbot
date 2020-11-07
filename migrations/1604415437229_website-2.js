/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('websites', {
        isHttps: {
            type: 'bool',
            notNull: true,
            default: false
        },
    })
};

exports.down = pgm => {
    pgm.dropColumns('websites', [
        'isHttps',
    ])
};
