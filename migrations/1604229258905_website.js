/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('websites', {
        id: 'id',
        url: {
            type: 'varchar(1000)',
            notNull: true
        },
        isUp: {
            type: 'bool',
            notNull: true,
            default: false
        },
        upCycles: {
            type: 'integer',
            notNull: true,
            default: 0
        },
        downCycles: {
            type: 'integer',
            notNull: true,
            default: 0
        },
        lastCheck: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
    })
};

exports.down = pgm => {
    pgm.dropTable('websites')
};
